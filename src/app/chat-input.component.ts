import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  Input,
  ViewChild,
} from "@angular/core";
import { Product, ProductService } from "./services/product.service";
import { Chat, ChatService, Message } from "./services/chat.service";
import { DropDownComponent } from "./drop-down.component";

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
        <app-drop-down 
	  #appdropdown
	  (menuItemClick)="handleMenuItemClick($event)"
          selectedModel="this.model"
        ></app-drop-down>
        <button
          class="flex items-center justify-center w-12 h-11 rounded-r-lg bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2"
          (click)="sendMessage()"
        >
          <i class="fas fa-arrow-right text-white"></i>
        </button>
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
  @Input() model: "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview" | "gpt-4o" | "gpt-4o-mini" | "dalle3" =
    "gpt-4o";
  @Input() product_id: string | null = null;
  @Input() deactivated: boolean = false;
  @Output() openViewer = new EventEmitter<string>();
  @Output() newMessage = new EventEmitter<any>();
  @Output() updateChatConfig = new EventEmitter<any>();
  @ViewChild("textarea") textArea!: ElementRef;
  @ViewChild(DropDownComponent) dropDown!: DropDownComponent;
  message: string;
  showChatConfig: boolean = false;
  showExtraProduct: boolean = false;
  currentChat: Chat = {
    id: "",
    mode: "oai",
    deactivated: false,
    product_id: null,
    model: "gpt-3.5-turbo",
    title: "",
    date: new Date(),
    messages: [],
  };

  products: Product[] = [];

  constructor(private productService: ProductService, private chatService: ChatService) {
    this.chatService.currentChat.subscribe((chat) => {
      this.currentChat = chat;
      console.log(this.currentChat);
      this.mode = chat.mode;
      this.model = chat.model;
      this.dropDown.changeModel(this.model);
      
      // update the drop down with the current model
    });
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

  handleMenuItemClick(item: any) {
    console.log(`Parent received item: ${item}`);
    this.model = item;
    this.updateChatConfigTrigger();
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
