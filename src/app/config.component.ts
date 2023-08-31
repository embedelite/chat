import { Component, EventEmitter, Output } from "@angular/core";
import { StorageService } from "./storage.service";

@Component({
  selector: "app-config",
  template: `
    <button class="mb-4 bg-primary-500 text-white rounded-md px-4 py-2" type="button" (click)="toggleConfig()">
      <svg class="w-4 h-4 mr-2 text-white-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 11.424V1a1 1 0 1 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 0-6.152ZM19.25 14.5A3.243 3.243 0 0 0 17 11.424V1a1 1 0 0 0-2 0v10.424a3.227 3.227 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.243 3.243 0 0 0 2.25-3.076Zm-6-9A3.243 3.243 0 0 0 11 2.424V1a1 1 0 0 0-2 0v1.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0V8.576A3.243 3.243 0 0 0 13.25 5.5Z"/>
      </svg>
    </button>
    <div *ngIf="showModal" tabindex="-1" class="overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none justify-center items-center flex md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative w-full max-w-md max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal" (click)="toggleConfig()">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
                <div class="px-6 py-6 lg:px-8">
                    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Global Configuration</h3>
                    <form class="space-y-6" action="#">
                        <div>
                            <label for="api_key" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">API KEY (OpenAI or EmbedElite)</label>
                            <input name="api_key" id="api_key" placeholder="sk_..." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required value="{{ api_key }}" [(ngModel)]="api_key">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                          <button type="submit" class="text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" (click)="toggleConfig()">Cancel</button>
                          <button type="submit" class="text-white bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800" (click)="saveConfig()">Save</button>
                        </div>
                        <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                            Not registered? <a href="https://www.embedelite.com/" target="_blank" class="text-blue-700 hover:underline dark:text-blue-500">Get EmbedElite Key</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div *ngIf="showModal" class="opacity-25 fixed inset-0 z-40 bg-black"></div>
    `,
})

export class ConfigComponent {
  showModal = false;
  api_key: string;

  constructor(private storageService: StorageService) {
    this.api_key = "";
    const api_key = this.storageService.getItem<string>("api_key");
    if (api_key) {
      this.api_key = api_key;
    }
  }

  saveConfig(){
    this.storageService.setItem("api_key", this.api_key);
    this.showModal = false;
  }

  toggleConfig(){
    this.showModal = !this.showModal;
  }
}
