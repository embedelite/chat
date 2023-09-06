import { Component } from "@angular/core";
import { Chat, ChatService } from "./services/chat.service";
import { StorageService } from "./services/storage.service";

@Component({
  selector: "app-root",
  template: `
    <div class="flex h-screen flex-col bg-white dark:bg-gray-800 shadow-md">
      <div class="flex-grow flex overflow-hidden">
        <app-chat-sidebar class="h-full w-64 flex-shrink-0"></app-chat-sidebar>
        <div class="flex flex-col flex-grow">
          <app-chat-area
            class="overflow-y-auto p-4 bg-white dark:bg-gray-800 flex-grow"
            [chat]="currentChat"
            [layout]="'centered'"
            (openViewer)="openViewer($event)"
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
      </div>
    </div>
  `,
  styles: [],
})
export class AppComponent {
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
  docUrl = "";

  constructor(
    private chatService: ChatService,
    private storageService: StorageService
  ) {
    this.chatService.currentChat.subscribe((chat) => (this.currentChat = chat));

    const ee_api_key = this.storageService.getItem<string>("ee_api_key") ?? "";
    this.chatService.updateProducts(ee_api_key);
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

  openViewer(url: string) {
    this.docUrl = url;
    this.isViewerVisible = true;
  }

  closeViewer() {
    this.isViewerVisible = false;
  }
}
