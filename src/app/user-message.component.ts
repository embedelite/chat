import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { Message } from "./services/chat.service";

@Component({
  selector: "app-user-message",
  template: `
    <div class="flex justify-end mb-4">
      <div *ngIf="!isEditing; else editingTemplate" class="w-full max-w-[90%]">
        <div class="bg-primary-100 dark:bg-primary-700 rounded-lg px-4 py-2">
          <p
            class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
          >
            {{ message.text }}
          </p>
        </div>
        <!-- Align the icon to the left below the message box -->
        <div class="mt-2 text-left">
          <i
            (click)="activateEdit()"
            class="text-sm text-gray-800 dark:text-gray-200  fas fa-pencil-alt cursor-pointer"
          ></i>
        </div>
      </div>
    </div>
    <ng-template #editingTemplate>
      <div class="flex flex-col space-y-2 w-full max-w-[90%]">
        <textarea
          #myTextarea
          [(ngModel)]="editableMessage"
          (input)="autoResizeTextarea()"
          class="w-full text-sm text-gray-800 dark:text-gray-200 bg-primary-100 dark:bg-primary-700 rounded-lg px-4 py-2 resize-none overflow-hidden"
          style="min-height: 100px;"
        ></textarea>
        <div class="flex justify-end space-x-2">
          <button
            (click)="saveEdit()"
            class="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Save
          </button>
          <button
            (click)="cancelEdit()"
            class="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [],
})
export class UserMessageComponent {
  @Input() message!: Message;
  @Input() layout: "chat-bubbles" | "centered" = "chat-bubbles";
  @Output() messageEdited = new EventEmitter<Message>();
  @ViewChild("myTextarea") myTextarea!: ElementRef;

  isEditing: boolean = false;
  editableMessage: string = "";

  constructor() {}

  activateEdit() {
    this.editableMessage = this.message.text;
    this.isEditing = true;
    setTimeout(() => this.autoResizeTextarea());
  }

  saveEdit() {
    this.messageEdited.emit({ ...this.message, text: this.editableMessage });
    this.isEditing = false;
  }

  cancelEdit() {
    this.editableMessage = "";
    this.isEditing = false;
  }

  autoResizeTextarea(): void {
    const textarea: HTMLTextAreaElement = this.myTextarea.nativeElement;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
