import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Chat } from "./chat.service";

@Component({
  selector: "app-chat-area",
  template: `
    <div
      class="flex flex-col p-4 overflow-y-auto bg-white dark:bg-gray-800"
      style="height: 100%;"
    >
      <div *ngFor="let message of chat?.messages">
        <ng-container *ngIf="message.from === 'user'">
          <app-user-message [message]="message.text"></app-user-message>
        </ng-container>
        <ng-container *ngIf="message.from === 'bot'">
          <app-bot-message
            [message]="message.text"
            [links]="message.links"
            (openViewer)="openViewer.emit($event)"
          ></app-bot-message>
        </ng-container>
      </div>
    </div>
  `,
  styles: [],
})
export class ChatAreaComponent {
  @Input() chat: Chat;
  @Output() openViewer = new EventEmitter<string>();

  constructor() {
    this.chat = {
      id: "",
      title: "",
      date: new Date(),
      messages: [],
    };
  }
}
