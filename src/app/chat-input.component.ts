import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-chat-input",
  template: `
    <div
      class="flex items-center p-4 bg-gray-200 dark:bg-gray-700 rounded-b-lg"
    >
      <textarea
        class="resize-none w-full px-4 py-2 mr-4 bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-gray-300 dark:focus:ring-offset-gray-800"
        rows="1"
        placeholder="Type your message..."
        (input)="adjustTextarea($event)"
        (keyup.enter)="sendMessage()"
        [(ngModel)]="message"
      ></textarea>
      <!-- The send button -->
      <button
        class="flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2"
        (click)="sendMessage()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-6 h-6 text-white"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 12h14M12 5l7 7-7 7"
          ></path>
        </svg>
      </button>
    </div>
  `,
  styles: [
    `
      textarea {
        transition: height 0.2s;
        overflow-y: hidden;
      }
    `,
  ],
})
export class ChatInputComponent {
  @Output() newMessage = new EventEmitter<string>();
  message: string;

  constructor() {
    this.message = "";
  }

  sendMessage() {
    this.newMessage.emit(this.message.trim());
    this.message = "";
    setTimeout(() => this.adjustTextarea(null), 0); // Adjust textarea after message is sent
  }

  adjustTextarea(event: any) {
    const textarea: any = event
      ? event.target
      : document.querySelector("textarea");
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
  }
}
