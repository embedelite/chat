import { Component, OnInit } from "@angular/core";
import { Chat, ChatService, Message } from "./services/chat.service";

@Component({
    selector: "app-chat",
    template: `
    <div class="flex h-full flex-col bg-white dark:bg-gray-800 shadow-md">
      <div class="flex overflow-hidden h-screen">
        <app-chat-sidebar
          [hidden]="!currentVisibility"
          [ngClass]="{ show: currentVisibility }"
          class="overflow-y-auto h-full w-64 flex-shrink-0 sidebar-mobile-overlay"
        ></app-chat-sidebar>
        <ng-container>
          <div class="flex flex-col flex-grow">
            <app-chat-area
              (click)="closeSidebar()"
              class="overflow-y-auto p-4 bg-white dark:bg-gray-800 flex-grow"
              [chat]="currentChat"
              [layout]="'centered'"
              (openViewer)="openViewer($event)"
              (messageEdited)="handleMessageEdit($event)"
            ></app-chat-area>
            <app-chat-input
              class="flex-shrink-0"
              [mode]="currentChat.mode"
              [model]="currentChat.model"
              [product_id]="currentChat.product_id"
              [deactivated]="currentChat.deactivated"
              (newMessage)="updateMessages($event)"
              (updateChatConfig)="updateChatConfig($event)"
            ></app-chat-input>
          </div>
          <app-doc-viewer
            class="h-full w-1/2"
            *ngIf="isViewerVisible"
            [url]="docUrl"
          ></app-doc-viewer>
        </ng-container>
      </div>
    </div>
  `,
    styles: [
        `
      :host {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      @media (max-width: 767px) {
        .sidebar-mobile-overlay {
          position: fixed;
          top: 48px;
          left: 0;
          height: 100%;
          width: 80%; /* Adjust this value based on your design requirements */
          background-color: #ffffff; /* Or whichever your desired background color is */
          z-index: 100; /* Ensures it floats above other content */
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
        }

        .sidebar-mobile-overlay.show {
          transform: translateX(0);
        }
      }

      @media (min-width: 768px) {
        .sidebar-normal {
          /* Define styles for larger screens if necessary, or rely on default styles */
        }
      }
    `,
    ],
})
export class ChatComponent implements OnInit {
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

    isViewerVisible = false;
    showConfig = false;
    docUrl = "";
    currentVisibility = true;

    constructor(private chatService: ChatService) {
        this.chatService.currentChat.subscribe((chat) => (this.currentChat = chat));
        this.currentVisibility = true;
    }

    ngOnInit() {
        this.chatService.currentVisibility.subscribe(
            (state) => (this.currentVisibility = state)
        );
    }

    updateShowConfig(newShowConfigValue: boolean) {
        this.showConfig = newShowConfigValue;
    }

    openViewer(url: string) {
        this.docUrl = url;
        this.isViewerVisible = true;
    }

    closeViewer() {
        this.isViewerVisible = false;
    }

    updateChatConfig(config: any) {
        this.chatService.updateChatConfig(
            this.currentChat.id,
            config.mode,
            config.model,
            config.product_id
        );
    }

    updateMessages(msgInfo: any) {
        this.chatService.sendMessage(
            this.currentChat.id,
            msgInfo.message,
            msgInfo.mode,
            msgInfo.model,
            msgInfo.product_id
        );
    }

    closeSidebar() {
        // Check if we are on a mobile device by window width
        if (window.innerWidth <= 767) {
            this.chatService.toggleChatsVisibility();
        }
    }

    handleMessageEdit(updatedMessage: Message): void {
        this.chatService.updateMessage(this.currentChat.id, updatedMessage);
    }
}
