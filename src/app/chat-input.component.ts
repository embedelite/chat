import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  Input,
  ViewChild,
} from "@angular/core";
import { Product, ProductService } from "./services/product.service";

@Component({
  selector: "app-chat-input",
  template: `
    <div
      class="flex items-center p-2 bg-gray-200 dark:bg-gray-700 rounded-br-lg"
    >
      <textarea
        #textarea
        id="chat-input"
        class="resize-none w-full px-4 py-2 mr-4 bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-gray-300 dark:focus:ring-offset-gray-800"
        rows="1"
        placeholder="Type your message..."
        (input)="adjustTextarea($event)"
        (paste)="adjustTextarea($event)"
        (keyup.enter)="sendMessage()"
        [(ngModel)]="message"
        [attr.disabled]="deactivated ? true : null"
      ></textarea>
      <!-- The send button -->
      <div class="inline-flex rounded-md shadow-sm" role="group">
        <button
          id="dropdownTopButton"
          data-dropdown-toggle="dropdownTop"
          data-dropdown-placement="top"
          class="mr-0 mb-0 text-white bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-primary-600 dark:hover:bg-primary-500 dark:focus:ring-primary-800"
          type="button"
          (click)="toggleChatConfig()"
        >
          <i class="fas fa-angle-up"></i>
        </button>
        <button
          class="flex items-center justify-center w-12 h-11 rounded-r-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2"
          (click)="sendMessage()"
        >
          <i class="fas fa-arrow-right text-white"></i>
        </button>
      </div>

      <!-- Dropdown menu -->
      <div
        *ngIf="showChatConfig"
        id="dropdownTop"
        class="z-10 p-5 bg-white divide-y divide-gray-100 rounded-lg shadow w-320 border border-gray-200 dark:border-gray-700 dark:bg-gray-700"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Select the mode you want to use.
        </p>
        <div class="rounded-lg dark:border-gray-700 my-5 grid justify-start">
          <div class="flex items-center pl-4 rounded dark:border-gray-700">
            <input
              id="bordered-radio-1"
              type="radio"
              value="ee"
              name="bordered-radio"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              [checked]="mode == 'ee'"
              (change)="selectModeOption($event.target)"
            />
            <label
              for="bordered-radio-1"
              class="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >EmbedElite mode</label
            >
          </div>
          <label
            for="productid"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Select an product id</label
          >
          <div class="relative">
            <select
              id="products"
              class="appearance-none px-3 py-2 h-10 text-sm leading-5 font-sans w-full border border-muted-300 bg-white text-muted-600 placeholder-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg dark:placeholder-muted-600 dark:bg-muted-700 dark:text-muted-200 dark:border-muted-600 dark:focus-visible:border-muted-600 focus-visible:ring-0 outline-transparent focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-muted-300 dark:focus-visible:outline-muted-600 focus-visible:outline-offset-2 transition-all duration-300"
              (change)="selectProductOption($event.target)"
            >
              <option selected>Choose a product</option>
              <option
                *ngFor="let product of products"
                [value]="product.id"
                [selected]="product_id === product.id"
              >
                {{ product.name }}
                <!-- Modify as per the attribute of Product -->
              </option>
              <option *ngIf="showExtraProduct" [value]="product_id" selected>
                {{ product_id }}
              </option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                class="h-4 w-4"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 15a.5.5 0 01-.354-.146l-4.5-4.5a.5.5 0 01.708-.708L10 13.793l4.146-4.147a.5.5 0 01.708 0 .5.5 0 010 .708l-4.5 4.5A.5.5 0 0110 15z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        <hr class="my-0" />
        <div
          class="rounded-lg border-none dark:border-gray-700 my-0 grid justify-start"
        >
          <div
            class="flex items-center pl-4 border-none border-gray-200 rounded dark:border-gray-700"
          >
            <input
              id="bordered-radio-2"
              type="radio"
              value="oai"
              name="bordered-radio"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              [checked]="mode == 'oai'"
              (change)="selectModeOption($event.target)"
            />
            <label
              for="bordered-radio-2"
              class="w-full py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >OpenAI mode</label
            >
          </div>
          <label
            for="productid"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Select a model</label
          >
          <div class="relative">
            <select
              id="countries"
              class="appearance-none px-3 py-2 h-10 text-sm leading-5 font-sans w-full border border-muted-300 bg-white text-muted-600 placeholder-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg dark:placeholder-muted-600 dark:bg-muted-700 dark:text-muted-200 dark:border-muted-600 dark:focus-visible:border-muted-600 focus-visible:ring-0 outline-transparent focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-muted-300 dark:focus-visible:outline-muted-600 focus-visible:outline-offset-2 transition-all duration-300"
              (change)="selectModelOption($event.target)"
            >
              <option
                value="gpt-3.5-turbo"
                [selected]="model === 'gpt-3.5-turbo'"
              >
                gpt-3.5-turbo
              </option>
              <option value="gpt-4" [selected]="model === 'gpt-4'">
                gpt-4
              </option>
              <option
                value="gpt-4-turbo-preview"
                [selected]="model === 'gpt-4-turbo-preview'"
              >
                gpt-4-turbo-preview
              </option>
              <option value="gpt-4o" [selected]="model === 'gpt-4o'">
                gpt-4o
              </option>
            </select>
            <div
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                class="h-4 w-4"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 15a.5.5 0 01-.354-.146l-4.5-4.5a.5.5 0 01.708-.708L10 13.793l4.146-4.147a.5.5 0 01.708 0 .5.5 0 010 .708l-4.5 4.5A.5.5 0 0110 15z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      textarea {
        transition: height 0.2s;
        overflow-y: auto;
        max-height: 300px;
        min-height: 20px;
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
  @Input() model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview" | "gpt-4o" =
    "gpt-4-turbo-preview";
  @Input() product_id: string | null = null;
  @Input() deactivated: boolean = false;
  @Output() openViewer = new EventEmitter<string>();
  @Output() newMessage = new EventEmitter<any>();
  @Output() updateChatConfig = new EventEmitter<any>();
  @ViewChild("textarea") textArea!: ElementRef;
  message: string;
  showChatConfig: boolean = false;
  showExtraProduct: boolean = false;

  products: Product[] = [];

  constructor(private productService: ProductService) {
    this.message = "";
    // if product id is not fr, de, or es then show extra product
    this.updateExtraProduct();
    this.fetchProducts();
  }

  ngOnChanges() {
    this.updateExtraProduct();
  }

  async fetchProducts() {
    this.products = await this.productService.listProducts();
  }

  updateExtraProduct() {
    // check product id is null
    if (
      this.product_id &&
      !["vat-rules-fr", "vat-rules-de", "vat-rules-es"].includes(
        this.product_id
      )
    ) {
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
    let msg_info = {
      message: this.message.trim(),
      mode: this.mode,
      model: this.model,
      product_id: this.product_id,
    };
    this.newMessage.emit(msg_info);
    this.message = "";
    setTimeout(() => this.adjustTextarea(null), 0); // Adjust textarea after message is sent
  }

  adjustTextarea(event: any) {
    setTimeout(() => {
      const textarea: any = event
        ? event.target
        : document.querySelector("textarea");
      if (textarea.value === "") {
        // Reset textarea size if there's no content
        textarea.style.height = "auto";
      } else if (textarea.scrollHeight < 300) {
        // Increase height if scrollHeight is under 150.
        textarea.style.height = `${textarea.scrollHeight}px`;
      } else if (textarea.clientHeight < 300) {
        // If content is larger but textarea's visible height is less, set it to 150
        textarea.style.height = `300px`;
      }
    }, 0);
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
    let config = {
      mode: this.mode,
      model: this.model,
      product_id: this.product_id,
    };
    console.log(config);
    this.updateChatConfig.emit(config);
  }
}
