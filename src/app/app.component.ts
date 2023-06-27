import { Component } from "@angular/core";
import { Chat, ChatService } from "./chat.service";

@Component({
  selector: "app-root",
  template: `
    <div class="flex h-screen bg-white dark:bg-gray-800 shadow-md">
      <app-chat-sidebar class="h-full w-64"></app-chat-sidebar>
      <div class="flex flex-col flex-grow">
        <app-chat-area
          class="flex-grow"
          [chat]="currentChat"
          (openViewer)="openViewer($event)"
        ></app-chat-area>
        <app-chat-input
          class="flex-shrink-0"
          (newMessage)="updateMessages($event)"
        ></app-chat-input>
      </div>
      <app-doc-viewer
        class="h-full w-1/2"
        *ngIf="isViewerVisible"
        [url]="docUrl"
      ></app-doc-viewer>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  currentChat: Chat = {
    id: "",
    title: "",
    date: new Date(),
    messages: [],
  };

  isViewerVisible = false;
  docUrl = "";

  constructor(private chatService: ChatService) {
    this.chatService.currentChat.subscribe((chat) => (this.currentChat = chat));
  }

  updateMessages(message: string) {}

  openViewer(url: string) {
    this.docUrl = url;
    this.isViewerVisible = true;
  }

  closeViewer() {
    this.isViewerVisible = false;
  }
}
