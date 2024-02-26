import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  OnInit,
} from "@angular/core";

@Component({
  selector: "app-bot-message",
  template: `
    <div class="flex items-end mb-4 space-x-2">
      <div
        class=" px-4 py-2 text-white bg-primary-600 dark:bg-primary-500 rounded-lg max-w-[90%]"
      >
        <ng-container
          *ngFor="
            let line of messageCopy.split('\n')
          "
        >
          <p class="text-sm whitespace-pre-wrap">{{line}}\n</p>
        </ng-container>
        <ng-container *ngIf="links !== undefined">
          <ng-container *ngFor="let link of links">
            <br /><br /><strong>{{ link.title }}</strong
            ><br />
            <a
              class="cursor-pointer group inline-flex items-center gap-4 text-primary-200 hover:text-primary-100 transition-colors duration-300"
              (click)="openViewer.emit(link.url)"
            >
              <!--span class="font-sans font-medium text-sm">View here</span-->
              <i
                class="iconify w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                data-icon="lucide:arrow-right"
              ></i>
            </a>
          </ng-container>
        </ng-container>
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
export class BotMessageComponent implements OnInit, OnChanges {
  @Input() message: string;
  messageCopy: string;
  @Input() layout: "chat-bubbles" | "centered" = "chat-bubbles";
  @Input() links?: Array<{ title: string; url: string }>;
  @Output() openViewer = new EventEmitter<string>();

  constructor() {
    this.message = "";
    this.messageCopy = "";
    this.links = [];
  }

  ngOnInit() {
    this.messageCopy = this.message;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["message"] && !changes["message"].firstChange) {
      this.messageCopy = changes["message"].currentValue;
    }
  }
}
