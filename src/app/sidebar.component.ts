import { Component, EventEmitter, Output } from "@angular/core";
import { Chat, ChatService } from "./services/chat.service";
import { KeyboardShortcutService } from "./services/keyboardshortcut.service";

@Component({
  selector: "app-chat-sidebar",
  template: `
    <div class="flex flex-col h-full p-4 bg-gray-200 dark:bg-gray-700">
      <div class="grid grid-cols-4 gap-4">
        <div class="col-span-4">
          <button class="primary-btn w-full mb-4" (click)="createNewChat()">
            + New chat
          </button>
        </div>
      </div>
      <div class="overflow-y-auto">
        <ng-container *ngFor="let group of chatGroups">
          <h5
            *ngIf="group.chats.length"
            class="mb-2 font-bold text-gray-700 dark:text-gray-300"
          >
            {{ group.title }}
          </h5>
          <div *ngFor="let chat of group.chats; let i = index">
            <div
              (click)="selectChat(chat)"
              class="group relative cursor-pointer px-4 py-2 rounded-lg mb-2 flex items-center justify-between"
              [class.active]="currentChat.id === chat.id"
            >
              <p class="text-gray-600 dark:text-gray-400 mb-0">
                {{ chat.title }}
              </p>
              <span
                (click)="deleteChat(chat); $event.stopPropagation()"
                class="ml-4 opacity-0 group-hover:opacity-100"
              >
                🗑️
              </span>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .active {
        background-color: #f3f4f6;
      }
      .hover-group:hover .opacity-0 {
        opacity: 1 !important;
      }
      .custom-btn {
        height: 44px;
      }
    `,
  ],
})
export class ChatSidebarComponent {
  @Output() showConfig = new EventEmitter<boolean>();

  chats: Chat[] = [];
  currentChat: Chat = {
    id: "",
    mode: "oai",
    deactivated: false,
    product_id: null,
    model: "gpt-3.5-turbo",
    title: "",
    date: new Date(),
    messages: [],
  };
  chatGroups: { title: string; chats: Chat[] }[] = [];

  constructor(
    private chatService: ChatService,
    private keyboardShortcutService: KeyboardShortcutService
  ) {
    keyboardShortcutService.addShortcut({ key: "KeyT", ctrlKey: true }, () =>
      this.createNewChat()
    );
    chatService.getChats().subscribe((chats) => {
      this.chats = chats;
      this.chatGroups = this.groupChatsByDate(this.chats);
    });
    chatService.currentChat.subscribe((chat) => {
      this.currentChat = chat;
    });
  }

  deleteCurrentChat() {
    this.deleteChat(this.currentChat);
  }

  deleteChat(chat: Chat) {
    this.chatService.deleteChat(chat.id);

    // Refreshing chat groups
    this.chatGroups = this.groupChatsByDate(this.chats);

    // If the current chat was the deleted one, switch to another chat if available
    if (this.currentChat?.id === chat.id && this.chats.length) {
      this.selectChat(this.chats[0]);
    }
  }

  selectChat(chat: Chat) {
    this.showConfig.emit(false);
    this.chatService.switchChat(chat);
  }

  groupChatsByDate(chats: Chat[]): { title: string; chats: Chat[] }[] {
    let today: Chat[] = [];
    let yesterday: Chat[] = [];
    let previous7Days: Chat[] = [];
    let previous30Days: Chat[] = [];

    const todayDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(todayDate.getDate() - 1);

    for (let chat of chats) {
      let chatDate = new Date(chat.date);
      if (this.isSameDay(todayDate, chatDate)) {
        today.push(chat);
      } else if (this.isSameDay(yesterdayDate, chatDate)) {
        yesterday.push(chat);
      } else if (this.isInPastDays(chatDate, todayDate, 7)) {
        previous7Days.push(chat);
      } else if (this.isInPastDays(chatDate, todayDate, 30)) {
        previous30Days.push(chat);
      }
    }

    return [
      { title: "Today", chats: today },
      { title: "Yesterday", chats: yesterday },
      { title: "Previous 7 days", chats: previous7Days },
      { title: "Previous 30 days", chats: previous30Days },
    ];
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  isInPastDays(targetDate: Date, currentDate: Date, pastDays: number): boolean {
    const pastDate = new Date(currentDate);
    pastDate.setDate(pastDate.getDate() - pastDays);
    return targetDate <= currentDate && targetDate >= pastDate;
  }

  openConfig() {
    this.showConfig.emit(true);
  }

  closeConfig() {
    this.showConfig.emit(false);
  }

  createNewChat() {
    this.closeConfig();
    let newChat = this.chatService.addChat("New Chat");
    this.chatGroups = this.groupChatsByDate(this.chats);
    this.selectChat(newChat);
  }
}
