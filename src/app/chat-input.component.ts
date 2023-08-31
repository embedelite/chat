import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "app-chat-input",
  template: `
    <div
      class="flex items-center p-4 bg-gray-200 dark:bg-gray-700 rounded-b-lg"
    >
      <textarea
        class="resize-none w-full px-4 py-2 mr-4 bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-gray-300 dark:focus:ring-offset-gray-800"
        rows="1"
        placeholder="Type your message..."
        (input)="adjustTextarea($event)"
        (keyup.enter)="sendMessage()"
        [(ngModel)]="message"
      ></textarea>
      <!-- The send button -->
      <div class="inline-flex rounded-md shadow-sm" role="group">
        <button id="dropdownTopButton" data-dropdown-toggle="dropdownTop" data-dropdown-placement="top" class="mr-0 mb-3 md:mb-0 text-white bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-primary-600 dark:hover:bg-primary-500 dark:focus:ring-primary-800" type="button" (click)="toggleChatConfig()">
          <svg class="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
          </svg>
        </button>
        <button
          class="flex items-center justify-center w-12 h-12 rounded-r-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2"
          (click)="sendMessage()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="w-6 h-6 text-white"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h14M12 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>
      

      <!-- Dropdown menu -->
      <div *ngIf="showChatConfig" id="dropdownTop" class="z-10 p-5 bg-white divide-y divide-gray-100 rounded-lg shadow w-320 border border-gray-200 dark:border-gray-700 dark:bg-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400">Select the mode you want to use.</p>
        <div class="rounded-lg dark:border-gray-700 my-5 grid justify-start">
          <div class="flex items-center pl-4 rounded dark:border-gray-700">
            <input id="bordered-radio-1" type="radio" value="" name="bordered-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
            <label for="bordered-radio-1" class="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">EmbedElite mode</label>
          </div>
          <label for="productid" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an product id</label>
          <select id="countries" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected>Choose a country</option>
            <option value="es">vat-rules-es</option>
            <option value="de">vat-rules-de</option>
            <option value="fr">vat-rules-fr</option>
          </select>
        </div>
        <hr class="my-0">
        <div class="rounded-lg border-none dark:border-gray-700 my-0 grid justify-start">
          <div class="flex items-center pl-4 border-none border-gray-200 rounded dark:border-gray-700">
              <input checked id="bordered-radio-2" type="radio" value="" name="bordered-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="bordered-radio-2" class="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">OpenAI mode</label>
          </div>
          <label for="productid" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a model</label>
          <select id="countries" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option value="3">gpt3.5</option>
            <option value="4">gpt4</option>
          </select>
        </div>
      </div>

    </div>
  `,
  styles: [
    `
      textarea {
        transition: height 0.2s;
        overflow-y: hidden;
      }
      #dropdownTopButton {
        position: relative;
      }
      #dropdownTop {
        position: absolute;
        bottom: 68px; 
        right: 40px;
        z-index: 10;
      }
    `,
  ],
})
export class ChatInputComponent {
  @Output() newMessage = new EventEmitter<string>();
  message: string;
  showChatConfig: boolean = false;

  constructor() {
    this.message = "";
  }

  toggleChatConfig() {
    this.showChatConfig = !this.showChatConfig;
  }

  sendMessage() {
    this.newMessage.emit(this.message.trim());
    this.message = "";
    setTimeout(() => this.adjustTextarea(null), 0); // Adjust textarea after message is sent
  }

  adjustTextarea(event: any) {
    const textarea: any = event
      ? event.target
      : document.querySelector("textarea");
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
  }
}
