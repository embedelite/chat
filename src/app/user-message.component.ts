import { Component, Input } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Chat, ChatService } from "./services/chat.service";

@Component({
  selector: "app-user-message",
  template: `
    <div
      class="flex items-end justify-end mb-4 space-x-2 focus:outline-none" contentEditable
      (input)="onContentEditableInput($event)"
    >
      <div
        class="flex items-right flex-shrink-0 px-4 py-2 bg-primary-100 dark:bg-primary-700 rounded-lg max-w-[90%]"
      >
        <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {{ message }}
        </p>
      </div>
    </div>
  `,
  styles: [
    `
    `,
  ],
})
export class UserMessageComponent {
  @Input() message: string;
  @Input() layout: "chat-bubbles" | "centered" = "chat-bubbles";
  @Input() messageIndex: number;

  constructor(private chatService: ChatService) {
    this.message = "";
    this.messageIndex = 0;
  }

  onContentEditableInput(event: any) {
    this.chatService.editMessage(this.messageIndex, event.target.textContent);
    //this.message = event.target.textContent;
  }
}
