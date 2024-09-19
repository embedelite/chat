import { Component, Output, EventEmitter, Input } from '@angular/core';
import { AVAILABLE_MODELS, availableModels } from './services/chat.service';

@Component({
    selector: 'app-folder-settings',
    template: `
        <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50" *ngIf="isVisible">
            <div class="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 class="text-2xl font-bold mb-4">Settings</h2>
                <label class="block mb-2">
                    <span class="text-gray-700">Title:</span>
                    <input type="text" [(ngModel)]="title" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </label>
                <label class="block mb-2">
                    <span class="text-gray-700">System Prompt:</span>
                    <input type="text" [(ngModel)]="systemPrompt" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                </label>
                <label class="block mb-4">
                    <span class="text-gray-700">Default Model:</span>
                    <select multiple [(ngModel)]="defaultModel" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        <option *ngFor="let model of models" [value]="model">{{model}}</option>
                    </select>
                </label>
                <div class="flex justify-end space-x-2">
                    <button (click)="save()" class="primary-btn text-white px-4 py-2 rounded-md hover:bg-blue-600">Save</button>
                    <button (click)="close()" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Close</button>
                </div>
            </div>
        </div>
    `,
    styles: []
})
export class FolderSettingsComponent {
    @Input() isVisible: boolean = false;
    @Input() title: string = '';
    @Input() systemPrompt: string = '';
    @Input() defaultModel: availableModels = AVAILABLE_MODELS.GPT_4O_MINI;
    @Input() models: string[] = ['Model 1', 'Model 2', 'Model 3'];

    @Output() closePopup = new EventEmitter<void>();
    @Output() saveSettings = new EventEmitter<{ title: string, systemPrompt: string, defaultModel: availableModels }>();

    close() {
        this.closePopup.emit();
    }

    save() {
        this.saveSettings.emit({ title: this.title, systemPrompt: this.systemPrompt, defaultModel: this.defaultModel });
        this.close();
    }
}