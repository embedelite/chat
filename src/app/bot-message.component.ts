import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  OnInit,
} from "@angular/core";
import { Clipboard } from "@angular/cdk/clipboard";

@Component({
  selector: "app-bot-message",
  template: `
    <div class="flex items-end mb-4 space-x-2">
      <div
        *ngIf="type === 'text'"
        class="px-4 py-2 text-white bg-primary-600 dark:bg-primary-500 rounded-lg w-fit max-w-[min(90%,800px)]"
      >
        <ng-container *ngFor="let block of parsedBlocks">
          <markdown
            [data]="block.content"
            *ngIf="!block.isCode"
            class="markdown-content break-words"
          ></markdown>
          <div *ngIf="block.isCode" class="my-2 bg-black rounded-md">
            <div
              class="flex justify-between items-center px-4 py-2 bg-gray-800 text-xs"
            >
              <span class="truncate">{{ block.language || "plaintext" }}</span>
              <button
                (click)="copyCode(block.content)"
                class="text-gray-300 hover:text-white flex-shrink-0 ml-2"
              >
                <i class="fas fa-copy"></i> Copy
              </button>
            </div>
            <div class="overflow-x-auto">
              <pre
                class="p-4 text-sm"
              ><code class="whitespace-pre-wrap break-all">{{ block.content }}</code></pre>
            </div>
          </div>
        </ng-container>
      </div>
      <div
        *ngIf="type === 'image'"
        class="bg-primary-600 dark:bg-primary-500 rounded-lg max-w-[30%]"
      >
        <img src="{{ message }}" alt="Bot Image" class="rounded-lg max-w-2" />
      </div>
    </div>
  `,
  styles: [
    `
      ::ng-deep .markdown-content {
        font-size: 0.875rem;
        line-height: 1.25rem;
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-all;
      }
      ::ng-deep .markdown-content p {
        margin-bottom: 0.5rem;
      }
      ::ng-deep .markdown-content pre {
        max-width: 100%;
        overflow-x: auto;
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
  @Input() type: string;
  messageCopy: string;
  @Input() layout: "chat-bubbles" | "centered" = "chat-bubbles";
  @Input() links?: Array<{ title: string; url: string }>;
  @Output() openViewer = new EventEmitter<string>();
  parsedBlocks: Array<{ content: string; isCode: boolean; language?: string }> =
    [];

  constructor(private clipboard: Clipboard) {
    this.message = "";
    this.messageCopy = "";
    this.links = [];
    this.type = "text";
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
    const lines = this.message.split("\n");
    let currentBlock: { content: string; isCode: boolean; language?: string } =
      { content: "", isCode: false };
    this.parsedBlocks = [];

    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        if (currentBlock.content) {
          this.parsedBlocks.push({ ...currentBlock });
        }
        if (!currentBlock.isCode) {
          // Starting a new code block
          const lang = line.trim().slice(3).trim();
          currentBlock = {
            content: "",
            isCode: true,
            language: lang || undefined,
          };
        } else {
          // Ending a code block
          currentBlock = { content: "", isCode: false };
        }
      } else {
        currentBlock.content += line + "\n";
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
