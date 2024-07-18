import {
    Component,
    EventEmitter,
    Input,
    Output,
    SimpleChanges,
    OnChanges,
    OnInit,
} from "@angular/core";
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
    selector: "app-bot-message",
    template: `
    <div class="flex items-end mb-4 space-x-2">
      <div
        class="px-4 py-2 text-white bg-primary-600 dark:bg-primary-500 rounded-lg max-w-[90%] overflow-hidden"
      >
        <ng-container *ngFor="let block of parsedBlocks">
          <markdown [data]="block.content" *ngIf="!block.isCode" class="break-words markdown-content"></markdown>
          <div *ngIf="block.isCode" class="my-2 bg-black rounded-md overflow-hidden">
            <div class="flex justify-between items-center px-4 py-2 bg-gray-800 text-xs">
              <span>{{ block.language || 'plaintext' }}</span>
              <button (click)="copyCode(block.content)" class="text-gray-300 hover:text-white">
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
            <pre class="p-4 whitespace-pre-wrap break-words text-sm"><code>{{ block.content }}</code></pre>
          </div>
        </ng-container>
        <ng-container *ngIf="links !== undefined">
          <ng-container *ngFor="let link of links">
            <br /><br /><strong class="text-sm">{{ link.title }}</strong
            ><br />
            <a
              class="cursor-pointer group inline-flex items-center gap-4 text-primary-200 hover:text-primary-100 transition-colors duration-300 text-sm"
              (click)="openViewer.emit(link.url)"
            >
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
      ::ng-deep .markdown-content {
        font-size: 0.875rem; /* 14px */
        line-height: 1.25rem; /* 20px */
      }
      ::ng-deep .markdown-content p {
        margin-bottom: 0.5rem;
      }
      ::ng-deep .markdown-content h1,
      ::ng-deep .markdown-content h2,
      ::ng-deep .markdown-content h3,
      ::ng-deep .markdown-content h4,
      ::ng-deep .markdown-content h5,
      ::ng-deep .markdown-content h6 {
        font-size: 1rem;
        font-weight: bold;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }
    `,
    ],
})
export class BotMessageComponent implements OnInit, OnChanges {
    @Input() message: string;
    @Input() layout: "chat-bubbles" | "centered" = "chat-bubbles";
    @Input() links?: Array<{ title: string; url: string }>;
    @Output() openViewer = new EventEmitter<string>();

    parsedBlocks: Array<{ content: string; isCode: boolean; language?: string }> = [];

    constructor(private clipboard: Clipboard) {
        this.message = "";
        this.links = [];
    }

    ngOnInit() {
        this.parseMessage();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["message"] && !changes["message"].firstChange) {
            this.parseMessage();
        }
    }

    parseMessage() {
        const lines = this.message.split('\n');
        let currentBlock: { content: string; isCode: boolean; language?: string } =
            { content: '', isCode: false };
        this.parsedBlocks = [];

        for (const line of lines) {
            if (line.trim().startsWith('```')) {
                if (currentBlock.content) {
                    this.parsedBlocks.push({ ...currentBlock });
                }
                if (!currentBlock.isCode) {
                    // Starting a new code block
                    const lang = line.trim().slice(3).trim();
                    currentBlock = { content: '', isCode: true, language: lang || undefined };
                } else {
                    // Ending a code block
                    currentBlock = { content: '', isCode: false };
                }
            } else {
                currentBlock.content += line + '\n';
            }
        }

        if (currentBlock.content) {
            this.parsedBlocks.push(currentBlock);
        }
    }

    copyCode(code: string) {
        this.clipboard.copy(code);
        // Optionally, you can add a toast notification here to indicate successful copy
    }
}
