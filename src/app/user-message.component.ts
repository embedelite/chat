import { Component, Input } from "@angular/core";

@Component({
  selector: "app-user-message",
  template: `
    <div class="flex items-end mb-4 space-x-2">
      <div
        class="flex items-center flex-shrink-0 px-4 py-2 bg-primary-100 dark:bg-primary-700 rounded-lg max-w-xs"
      >
        <p class="text-sm text-gray-800 dark:text-gray-200">
          {{ message }}
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class UserMessageComponent {
  @Input() message: string;

  constructor() {
    this.message = "";
  }
}
