import { Component, EventEmitter, Output, Input } from "@angular/core";

@Component({
  selector: "app-chat-input",
  template: `
    <div
      class="flex items-center p-4 bg-gray-200 dark:bg-gray-700 rounded-br-lg"
    >
      <textarea
        class="resize-none w-full px-4 py-2 mr-4 bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-gray-300 dark:focus:ring-offset-gray-800"
        rows="1"
        placeholder="Type your message..."
        (input)="adjustTextarea($event)"
        (keyup.enter)="sendMessage()"
        [(ngModel)]="message"
        [attr.disabled]="deactivated ? true : null"
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
            <input id="bordered-radio-1" type="radio" value="ee" name="bordered-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" [checked]="mode == 'ee'" (change)="selectModeOption($event.target)">
            <label for="bordered-radio-1" class="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">EmbedElite mode</label>
          </div>
          <label for="productid" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select an product id</label>
          <select id="countries" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" (change)="selectProductOption($event.target)">
            <option selected>Choose a country</option>
            <option value="vat-rules-es" [selected]="product_id === 'vat-rules-es'">vat-rules-es</option>
            <option value="vat-rules-de" [selected]="product_id === 'vat-rules-de'">vat-rules-de</option>
            <option value="vat-rules-fr" [selected]="product_id === 'vat-rules-fr'">vat-rules-fr</option>
            <option *ngIf="showExtraProduct" value="{{ product_id }}" selected>{{ product_id }}</option>
          </select>
        </div>
        <hr class="my-0">
        <div class="rounded-lg border-none dark:border-gray-700 my-0 grid justify-start">
          <div class="flex items-center pl-4 border-none border-gray-200 rounded dark:border-gray-700">
              <input id="bordered-radio-2" type="radio" value="oai" name="bordered-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" [checked]="mode == 'oai'" (change)="selectModeOption($event.target)">
              <label for="bordered-radio-2" class="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">OpenAI mode</label>
          </div>
          <label for="productid" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a model</label>
          <select id="countries" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" (change)="selectModelOption($event.target)">
            <option value="gpt-3.5-turbo"
              [selected]="model === 'gpt-3.5-turbo'">
              gpt-3.5-turbo
            </option>
            <option value="gpt-4"
              [selected]="model === 'gpt-4'">
              gpt-4
            </option>
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
  @Input() mode: "ee" | "oai" = "ee";
  @Input() model: "gpt-3.5-turbo" | "gpt-4" = "gpt-3.5-turbo";
  @Input() product_id: string | null = null;
  @Input() deactivated: boolean = false;
  @Output() openViewer = new EventEmitter<string>();
  @Output() newMessage = new EventEmitter<any>();
  @Output() updateChatConfig = new EventEmitter<any>();
  message: string;
  showChatConfig: boolean = false;
  showExtraProduct: boolean = false;

  constructor() {
    this.message = "";
    // if product id is not fr, de, or es then show extra product
    this.updateExtraProduct();  
  }

  ngOnChanges() {
    this.updateExtraProduct();
  }

  updateExtraProduct() {
    // check product id is null
    if (this.product_id && !["vat-rules-fr", "vat-rules-de", "vat-rules-es"].includes(this.product_id)) {
      this.showExtraProduct = true;
    } else {
      this.showExtraProduct = false;
    }
  }

  toggleChatConfig() {
    this.showChatConfig = !this.showChatConfig;
  }

  sendMessage() {
    if (this.deactivated) return;
    if (!this.message.trim()) return;
    let msg_info = {"message": this.message.trim(),
                    "mode": this.mode,
                    "model": this.model,
                    "product_id": this.product_id}
    this.newMessage.emit(msg_info);
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

  selectModelOption(model: any) {
    if (this.deactivated) return;
    this.model = model.value;
    this.updateChatConfigTrigger();
  }

  selectProductOption(product_id: any) {
    if (this.deactivated) return;
    this.product_id = product_id.value;
    this.updateChatConfigTrigger();
  }

  selectModeOption(mode: any) {
    if (this.deactivated) return;
    this.mode = mode.value;
    this.updateChatConfigTrigger();
  }

  updateChatConfigTrigger() {
    if (this.deactivated) return;
    let config = {"mode": this.mode,
                  "model": this.model,
                  "product_id": this.product_id
                 }
    console.log(config);
    this.updateChatConfig.emit(config);
  }
}
