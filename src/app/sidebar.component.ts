import { Component, OnDestroy, OnInit } from "@angular/core";
import { AVAILABLE_MODELS, Chat, ChatService, availableModels } from "./services/chat.service";
import { KeyboardShortcutService } from "./services/keyboardshortcut.service";
import { Accordion } from 'flowbite';


@Component({
  selector: "app-chat-sidebar",
  template: `
  <div class="flex flex-col h-full p-4 bg-white dark:bg-gray-700 border-r border-gray-300">
    <div class="grid grid-cols-4 gap-4">
	    <div class="col-span-4 flex items-center justify-between">
	      <button class="primary-btn w-full mb-4 mr-2" (click)="createNewChat()">
          + New chat
        </button>
        <button class="primary-btn flex items-center justify-center p-2 text-white rounded mb-4" (click)="createNewFolder()">
          <svg class="w-5 h-5 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 8H4m8 3.5v5M9.5 14h5M4 6v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"/>
          </svg>
        </button>
	    </div>
    </div>
    <div class="overflow-y-auto" id="accordion-nested-collapse">

      <div id="accordion-collapse" data-accordion="collapse" data-active-classes="bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-white">
        <div *ngFor="let group of chatGroups; let i = index">
          <ng-container *ngIf="group.chats.length > 0">

            <ng-container *ngIf="group.folder_id !== null">
              <app-chat-accordion
                title="{{ getFormattedTitle(group.title) }}"
                [isExpanded]="isGroupExpanded(group.title)" 
                (toggleExpansion)="toggleGroupExpansion(group.title)" 
                (addNewItem)="createNewChatInGroup(group.folder_id)"
                (openSettings)="openSettings($event)"
                data-accordion="collapse"
              >
                <ng-container *ngFor="let chat of group.chats">
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
                      <svg class="w-6 h-6 text-gray-300 dark:text-white focus:text-gray-500 dark:focus:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                      </svg>
                    </span>
                  </div>
                </ng-container>
              </app-chat-accordion>
            </ng-container>
            <ng-container *ngIf="group.title === ''">
              <ng-container *ngFor="let chat of group.chats">
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
                    <svg class="w-6 h-6 text-gray-300 dark:text-white focus:text-gray-500 dark:focus:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                    </svg>
                  </span>
                </div>
              </ng-container>
            </ng-container>
          </ng-container>
        </div>
      </div>
      <app-folder-settings
        [isVisible]="showPopup"
        [title]="popupData.title"
        [systemPrompt]="popupData.systemPrompt"
        [defaultModel]="popupData.defaultModel"
        (closePopup)="closePopup()"
        (saveSettings)="saveSettings($event)"
      ></app-folder-settings>
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
    folder_id: null,
    system_prompt: "",
    product_id: null,
    model: AVAILABLE_MODELS.GPT_4O_MINI,
    title: "",
    date: new Date(),
    messages: [],
  };
  chatGroups: { title: string; folder_id: number | null; chats: Chat[] }[] = [];
  expandedGroups: { [key: string]: boolean } = {};
  showPopup: boolean = false;
  popupData: { title: string; systemPrompt: string; defaultModel: availableModels; folderId: number } = { title: 'test', systemPrompt: '', defaultModel: AVAILABLE_MODELS.GPT_4O_MINI, folderId: 0 };

  constructor(
    private chatService: ChatService,
    private keyboardShortcutService: KeyboardShortcutService
  ) {
    chatService.getChats().subscribe((chats) => {
      this.chats = chats;
      this.chatGroups = this.groupChatsByFolder(this.chats);
    });
    chatService.currentChat.subscribe((chat) => {
      this.currentChat = chat;
    });
  }

  openSettings(data: { title: string, systemPrompt: string, defaultModel: availableModels, folderId: number }) {
    this.popupData = data;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  saveSettings(settings: { title: string, systemPrompt: string, defaultModel: availableModels }) {
    const folder = this.chatService.getFolderById(this.popupData.folderId);
    if (folder) {
      folder.title = settings.title;
      folder.system_prompt = settings.systemPrompt;
      // Assuming defaultModel is a property of the folder, if not, adjust accordingly
      folder.default_model = settings.defaultModel;
      console.log('Settings saved:', settings);
    } else {
      console.error('Folder not found with id:', this.popupData.folderId);
    }
    this.closePopup();
  }

  toggleGroupExpansion(groupTitle: string) {
    this.expandedGroups[groupTitle] = !this.expandedGroups[groupTitle];
  }

  isGroupExpanded(groupTitle: string): boolean {
    return !!this.expandedGroups[groupTitle];
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

  getFormattedTitle(title: string): string {
    return title.replace(/ /g, '_');
  }

  deleteCurrentChat() {
    this.deleteChat(this.currentChat);
  }

  deleteChat(chat: Chat) {
    this.chatService.deleteChat(chat.id);

    // Refreshing chat groups
    //this.chatGroups = this.groupChatsByDate(this.chats);
    this.chatGroups = this.groupChatsByFolder(this.chats);

    // If the current chat was the deleted one, switch to another chat if available
    if (this.currentChat?.id === chat.id && this.chats.length) {
      this.selectChat(this.chats[0]);
    }
  }

  selectChat(chat: Chat) {
    this.chatService.switchChat(chat);
  }

  groupChatsByFolder(chats: Chat[]): { title: string; folder_id: number | null; chats: Chat[] }[] {
    const folderGroups: { [key: number]: Chat[] } = {};
    const groupedChats: { title: string; folder_id: number | null; chats: Chat[] }[] = [];

    chats.forEach((chat) => {
      const folderId = chat.folder_id;

      if (folderId === null) {
        groupedChats.push({ title: "", folder_id: null, chats: [chat] });
      } else {
        const folder = this.chatService.getFolderById(folderId);
        const folderTitle = folder ? folder.title : "Unknown Folder";

        if (!folderGroups[folderId]) {
          folderGroups[folderId] = [];
          groupedChats.push({ title: folderTitle, folder_id: folderId, chats: folderGroups[folderId] });
        }
        folderGroups[folderId].push(chat);
      }
    });

    return groupedChats;
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

  createNewChatInGroup(folderId: number) {
    const newChat = this.chatService.addChat("New Chat", folderId);
    this.chatGroups = this.groupChatsByFolder(this.chats);
    this.selectChat(newChat);
  }

  createNewChat() {
    let newChat = this.chatService.addChat("New Chat");
    //this.chatGroups = this.groupChatsByDate(this.chats);
    this.chatGroups = this.groupChatsByFolder(this.chats);
    this.selectChat(newChat);
  }

  createNewFolder() {
    const baseFolderName = "New Folder";
    let folderNumber = 1;

    // Extract existing folder names that start with "New Folder"
    const folderNames = this.chats
      .map(chat => {
        if (chat.folder_id === null) {
          return "";
        }
        const folder = this.chatService.getFolderById(chat.folder_id);
        return folder ? folder.title : "";
      })
      .filter(folder => folder.startsWith(baseFolderName));

    // Find the highest number used in "New Folder X" naming
    folderNames.forEach(folder => {
      const match = folder.match(/New Folder (\d+)/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num >= folderNumber) {
          folderNumber = num + 1;
        }
      }
    });

    const newFolderName = `${baseFolderName} ${folderNumber}`;
    const newFolderId = this.chatService.addFolder(newFolderName, "", AVAILABLE_MODELS.GPT_4O_MINI);

    let newChat = this.chatService.addChat("New Chat", newFolderId);
    this.chatGroups = this.groupChatsByFolder(this.chats);
    this.selectChat(newChat);
  }

  ngAfterViewInit(): void {
    this.chatGroups.forEach(group => {
      if (group.folder_id !== null) {
        const accordionElement = document.getElementById('accordion-' + group.folder_id);
        if (accordionElement) {
          new Accordion(accordionElement);
        }
      }
    });
  }
}
