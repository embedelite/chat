import { Component, OnDestroy, OnInit } from "@angular/core";
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
export class ChatSidebarComponent implements OnInit, OnDestroy {
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
        chatService.getChats().subscribe((chats) => {
            this.chats = chats;
            this.chatGroups = this.groupChatsByDate(this.chats);
        });
        chatService.currentChat.subscribe((chat) => {
            this.currentChat = chat;
        });
    }

    ngOnInit(): void {
        this.keyboardShortcutService.registerShortcut(
            { key: "t", ctrlKey: true },
            () => this.createNewChat()
        );

        this.keyboardShortcutService.registerShortcut(
            { key: "w", ctrlKey: true },
            () => this.deleteCurrentChat()
        );
    }

    ngOnDestroy(): void {
        this.keyboardShortcutService.unregisterShortcut({
            key: "KeyT",
            ctrlKey: true,
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
        this.chatService.switchChat(chat);
    }

    groupChatsByDate(chats: Chat[]): { title: string; chats: Chat[] }[] {
        const specialGroups: { [key: string]: Chat[] } = {
            Today: [],
            Yesterday: [],
            "Previous 30 days": [],
        };
        const monthGroups: { [key: string]: Chat[] } = {};
        const yearGroups: { [key: string]: Chat[] } = {};

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of the day
        const yesterday = new Date(today.getTime());
        yesterday.setDate(yesterday.getDate() - 1);
        const thirtyDaysAgo = new Date(today.getTime());
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        chats.forEach((chat) => {
            const chatDate = new Date(chat.date);
            chatDate.setHours(0, 0, 0, 0); // Normalize to start of the day

            if (this.isSameDay(chatDate, today)) {
                specialGroups["Today"].push(chat);
            } else if (this.isSameDay(chatDate, yesterday)) {
                specialGroups["Yesterday"].push(chat);
            } else if (chatDate > thirtyDaysAgo) {
                specialGroups["Previous 30 days"].push(chat);
            } else {
                const year = chatDate.getFullYear();
                const monthName = this.getMonthName(chatDate.getMonth());

                if (year === today.getFullYear()) {
                    if (!monthGroups[monthName]) monthGroups[monthName] = [];
                    monthGroups[monthName].push(chat);
                } else {
                    if (!yearGroups[year]) yearGroups[year] = [];
                    yearGroups[year].push(chat);
                }
            }
        });

        // Combine and sort the groups
        const combinedGroups = [
            ...Object.keys(specialGroups)
                .filter((key) => specialGroups[key].length > 0)
                .map((key) => ({ title: key, chats: specialGroups[key] })),
            ...Object.keys(monthGroups)
                .sort(
                    (a, b) =>
                        new Date(`${b} 1, ${today.getFullYear()}`).getTime() -
                        new Date(`${a} 1, ${today.getFullYear()}`).getTime()
                )
                .map((month) => ({ title: month, chats: monthGroups[month] })),
            ...Object.keys(yearGroups)
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map((year) => ({ title: year.toString(), chats: yearGroups[year] })),
        ];

        return combinedGroups;
    }

    getMonthName(monthIndex: number): string {
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        return monthNames[monthIndex];
    }

    isSameDay(date1: Date, date2: Date): boolean {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    }

    createNewChat() {
        let newChat = this.chatService.addChat("New Chat");
        this.chatGroups = this.groupChatsByDate(this.chats);
        this.selectChat(newChat);
    }
}
