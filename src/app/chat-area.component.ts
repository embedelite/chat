import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { Chat } from "./chat.service";

@Component({
  selector: "app-chat-area",
  template: `
    <div class="flex flex-col">
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

  @ViewChild("chatArea") private chatArea!: ElementRef;
  constructor() {
    this.chat = {
      id: "",
      title: "",
      date: new Date(),
      messages: [],
    };
  }

  ngAfterViewInit() {
    this.autoScrollToBottom();
  }

  autoScrollToBottom() {
    const config = { attributes: true, childList: true, subtree: true };
    const observer = new MutationObserver(() => {
      this.chatArea.nativeElement.scrollTop =
        this.chatArea.nativeElement.scrollHeight;
    });
    observer.observe(this.chatArea.nativeElement, config);
  }
}
