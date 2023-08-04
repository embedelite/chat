import { Component, EventEmitter, Output } from "@angular/core";
import { Chat, ChatService } from "./chat.service";

@Component({
  selector: "app-chat-sidebar",
  template: `
    <div
      class="flex flex-col h-full p-4 overflow-y-auto bg-gray-200 dark:bg-gray-700"
    >
      <button
        class="mb-4 bg-primary-500 text-white rounded-md px-4 py-2"
        (click)="createNewChat()"
      >
        + New chat
      </button>
      <ng-container *ngFor="let group of chatGroups">
        <h5 class="mb-2 font-bold text-gray-700 dark:text-gray-300">
          {{ group.title }}
        </h5>
        <div *ngFor="let chat of group.chats; let i = index">
          <div
            (click)="selectChat(chat)"
            class="cursor-pointer px-4 py-2 rounded-lg mb-2"
            [class.active]="currentChat?.id === chat.id"
          >
            <p class="text-gray-600 dark:text-gray-400">
              {{ chat.title }}
            </p>
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
    `,
  ],
})
export class ChatSidebarComponent {
  chats: Chat[] = [];
  currentChat: Chat = {
    id: "",
    title: "",
    date: new Date(),
    messages: [],
  };
  chatGroups: { title: string; chats: Chat[] }[] = [];

  constructor(private chatService: ChatService) {
    chatService.getChats().subscribe((chats) => {
      this.chats = chats;
      this.chatGroups = this.groupChatsByDate(this.chats);
    });
    chatService.currentChat.subscribe((chat) => {
      this.currentChat = chat;
    });
  }

  selectChat(chat: Chat) {
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

  createNewChat() {
    let newChat = this.chatService.addChat("New Chat");
    this.chatGroups = this.groupChatsByDate(this.chats);
    this.selectChat(newChat);
  }
}
