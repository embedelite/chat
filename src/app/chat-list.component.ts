import { Component, OnInit } from "@angular/core";
import { Chat, ChatService } from "./chat.service";

@Component({
  selector: "app-chat-list",
  template: `
    <div>
      <button (click)="addChat()">+ New chat</button>
      <div *ngFor="let chat of chats">
        <button (click)="switchChat(chat)">Chat from {{ chat.date }}</button>
      </div>
    </div>
  `,
  styles: [],
})
export class ChatListComponent implements OnInit {
  chats: Chat[];

  constructor(private chatService: ChatService) {
    this.chats = [];
  }

  ngOnInit() {
    this.chatService.getChats().subscribe((chats) => {
      this.chats = chats;
    });
  }

  switchChat(chat: Chat) {
    this.chatService.switchChat(chat);
  }

  addChat() {
    // TODO: implement functionality to add a new chat
  }
}
