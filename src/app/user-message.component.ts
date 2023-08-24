import { Component, Input } from "@angular/core";

@Component({
  selector: "app-user-message",
  template: `
    <div
      class="flex items-end mb-4 space-x-2"
      [ngClass]="{
        'justify-center mx-auto max-w-[30%]': layout === 'centered'
      }"
    >
      <div
        class="flex items-center flex-shrink-0 px-4 py-2 bg-primary-100 dark:bg-primary-700 rounded-lg max-w-md"
      >
        <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {{ message }}
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .max-w-3/10 {
        max-width: 40%;
      }
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
