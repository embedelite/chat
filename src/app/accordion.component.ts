import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AVAILABLE_MODELS, availableModels } from './services/chat.service';

@Component({
    selector: "app-chat-accordion",
    template: `
        <div id="accordion-collapse" [attr.data-accordion]="'collapse'"
            class="m-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 gap-3" 
        >
            <h3 id="accordion-collapse-heading-1">
                <button 
                type="button" 
                class="flex items-center justify-between w-full p-2 font-medium rtl:text-right text-gray-500 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-1" 
                [ngClass]="{'rounded-b-xl': !isExpanded}"
                (click)="toggle()" 
                [attr.aria-expanded]="isExpanded" 
                [attr.aria-controls]="'accordion-collapse-body-1'">
                <span>{{title}}</span>
                <button
                    class="ml-1 p-1 text-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:text-gray-700 flex items-center justify-center"
                    style="width: 24px; height: 24px;"
                    (click)="handleOpenSettings($event)"
                >
                    <svg class="w-4 h-6 text-gray-300 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M20 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6h-2m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4"/>
                    </svg>
                </button>
                <button
                    class="ml-0.5 p-1 text-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:text-gray-700 flex items-center justify-center"
                    style="width: 24px; height: 24px; margin-left: -5px;"
                    (click)="onAddNewItem($event)"
                >
                    +
                </button>
                <svg data-accordion-icon class="w-2 h-2" [ngClass]="{'rotate-180': isExpanded}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                </svg>
                </button>
            </h3>
            <div id="accordion-collapse-body-1" [ngClass]="{'hidden': !isExpanded}" aria-labelledby="accordion-collapse-heading-1">
                <div class="pt-1 pr-1 pl-1">
                    <ng-content></ng-content>
                </div>
            </div>
        </div>
    `,
})
export class AccordionComponent {
    @Input() title: string = 'Accordion Title';
    @Input() folderId: number = 0;
    @Input() isExpanded: boolean = false;
    @Output() addNewItem = new EventEmitter<void>();
    @Output() toggleExpansion = new EventEmitter<void>();
    @Output() openSettings = new EventEmitter<{ title: string, systemPrompt: string, defaultModel: availableModels, folderId: number }>();
  
    toggle(): void {
      this.toggleExpansion.emit();
    }

    onAddNewItem(event: any): void {
        event.stopPropagation();
        this.addNewItem.emit();
    }

    handleOpenSettings(event: any): void {
        event.stopPropagation();
        this.openSettings.emit({ title: this.title, systemPrompt: '', defaultModel: AVAILABLE_MODELS.GPT_4O_MINI, folderId: this.folderId });
    }
}