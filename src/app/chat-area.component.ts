import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { Chat, Message } from "./services/chat.service";
import { StorageService } from "./services/storage.service";

@Component({
  selector: "app-chat-area",
  template: `
    <div #msgcontainer class="flex flex-col">
      <div *ngFor="let message of chat?.messages">
        <ng-container *ngIf="message.from === 'user'">
          <app-user-message
            [message]="message"
            [layout]="layout"
            (messageEdited)="handleMessageEdit($event)"
          ></app-user-message>
        </ng-container>
        <ng-container *ngIf="message.from === 'bot'">
          <app-bot-message
            [message]="message.text"
            [links]="message.links"
            [layout]="layout"
	    [type]="message.type"
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
  @Input() layout: "chat-bubbles" | "centered" = "chat-bubbles";
  @Output() openViewer = new EventEmitter<string>();
  @Output() messageEdited = new EventEmitter<Message>();
  @ViewChild("msgcontainer") chatArea!: ElementRef;

  //@ViewChild("chatArea") private chatArea!: ElementRef;
  constructor(private storageService: StorageService) {
    this.chat = {
      id: "",
      title: "",
      mode: "oai",
      deactivated: false,
      product_id: null,
      model: "gpt-3.5-turbo",
      date: new Date(),
      messages: [],
    };
  }

  ngAfterViewChecked() {
    let stickyScroll = this.storageService.getItem<boolean>("stickyScroll");
    this.scrollToBottom();
  }

  ngAfterViewInit() {
    this.chatArea.nativeElement.parentElement.addEventListener("scroll", () => {
      const div = this.chatArea.nativeElement.parentElement;
      if (div.scrollTop + div.offsetHeight >= div.scrollHeight) {
        //console.log('reached bottom');
        this.storageService.setItem("stickyScroll", true);
      } else {
        //console.log('not at bottom');
        this.storageService.setItem("stickyScroll", false);
      }
    });
  }

  scrollToBottom() {
    let stickyScroll = this.storageService.getItem<boolean>("stickyScroll");
    if (stickyScroll) {
      this.chatArea.nativeElement.parentElement.scrollTop =
        this.chatArea.nativeElement.parentElement.scrollHeight;
    }
  }

  handleMessageEdit(updatedMessage: Message): void {
    this.messageEdited.emit(updatedMessage);
  }
}
