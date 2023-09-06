import { Component, EventEmitter, Output } from "@angular/core";
import { Chat, ChatService } from "./services/chat.service";
import { KeyboardShortcutService } from "./services/keyboardshortcut.service";

@Component({
  selector: "app-chat-sidebar",
  template: `
    <div
      class="flex flex-col h-full p-4 overflow-y-auto bg-gray-200 dark:bg-gray-700"
    >
      <div class="grid grid-cols-4 gap-4">
        <button
          class="custom-btn mb-4mb-4 bg-primary-500 text-white rounded-md px-4 py-2"
          (click)="openConfig()"
        >
          <svg
            class="w-4 h-4 mr-2 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M5 11.424V1a1 1 0 1 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 0-6.152ZM19.25 14.5A3.243 3.243 0 0 0 17 11.424V1a1 1 0 0 0-2 0v10.424a3.227 3.227 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.243 3.243 0 0 0 2.25-3.076Zm-6-9A3.243 3.243 0 0 0 11 2.424V1a1 1 0 0 0-2 0v1.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0V8.576A3.243 3.243 0 0 0 13.25 5.5Z"
            />
          </svg>
        </button>
        <button
          class="custom-btn col-span-3 mb-4 bg-primary-500 text-white rounded-md px-4 py-2"
          (click)="createNewChat()"
        >
          + New chat
        </button>
      </div>
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
  `,
  styles: [
    `
      .active {
        background-color: #f3f4f6;
        dark: bg-gray-800;
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
