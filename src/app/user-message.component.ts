import { Component, Input } from "@angular/core";

@Component({
  selector: "app-user-message",
  template: `
    <div
      class="flex items-end justify-end mb-4 space-x-2"
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

  constructor() {
    this.message = "";
  }
}
