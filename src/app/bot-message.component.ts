import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-bot-message",
  template: `
    <div class="flex items-end justify-end mb-4 space-x-2">
      <div
        class="flex items-center flex-shrink-0 px-4 py-2 text-white bg-primary-600 dark:bg-primary-500 rounded-lg max-w-xs"
      >
        <p class="text-sm">
          {{ message }}
          <ng-container *ngFor="let link of links">
            <br /><br /><strong>{{ link.title }}</strong
            ><br />
            <a
              class="cursor-pointer group inline-flex items-center gap-4 text-primary-200 hover:text-primary-100 transition-colors duration-300"
              (click)="openViewer.emit(link.url)"
            >
              <span class="font-sans font-medium text-sm">View here</span>
              <i
                class="iconify w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                data-icon="lucide:arrow-right"
              ></i>
            </a>
          </ng-container>
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class BotMessageComponent {
  @Input() message: string;
  @Input() links?: Array<{ title: string; url: string }>;
  @Output() openViewer = new EventEmitter<string>();

  constructor() {
    this.message = "";
    this.links = [];
  }
}
