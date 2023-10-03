import { Component, EventEmitter, Output } from "@angular/core";
import { StorageService } from "./services/storage.service";
import { ChatService } from "./services/chat.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-config",
  template: `
    <div class="w-full h-full flex items-center justify-center p-6 ">
      <!-- Modal content -->
      <div
        class="relative bg-white rounded-lg shadow dark:bg-gray-700 w-4/5 max-h-full"
      >
        <button
          type="button"
          class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          data-modal-hide="authentication-modal"
          (click)="closeConfig()"
        >
          <svg
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
        <div class="px-6 py-6 lg:px-8">
          <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
            Global Configuration
          </h3>
          <form class="space-y-6" action="#">
            <div>
              <label
                for="ee_api_key"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >EmbedElite API KEY</label
              >
              <input
                name="ee_api_key"
                id="ee_api_key"
                placeholder="sk_..."
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required
                value="{{ ee_api_key }}"
                [(ngModel)]="ee_api_key"
              />
            </div>
            <div>
              <label
                for="oai_api_key"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >OpenAI API KEY</label
              >
              <input
                name="oai_api_key"
                id="oai_api_key"
                placeholder="sk_..."
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required
                value="{{ oai_api_key }}"
                [(ngModel)]="oai_api_key"
              />
            </div>

            <div class="flex p-0 m-2">
              <label
                for="default_model"
                class="pt-3 pr-3 shrink-0 block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >Default OpenAI model:</label
              >
              <select
                id="default_model"
                class="appearance-none px-3 py-2 h-10 text-sm leading-5 font-sans w-full border border-muted-300 bg-white text-muted-600 placeholder-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg dark:placeholder-muted-600 dark:bg-muted-700 dark:text-muted-200 dark:border-muted-600 dark:focus-visible:border-muted-600 focus-visible:ring-0 outline-transparent focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-muted-300 dark:focus-visible:outline-muted-600 focus-visible:outline-offset-2 transition-all duration-300"
                (change)="selectDefaultModel($event.target)"
              >
                <option
                  value="gpt-3.5-turbo"
                  [selected]="defaultModel === 'gpt-3.5-turbo'"
                >
                  gpt-3.5-turbo
                </option>
                <option value="gpt-4" [selected]="defaultModel === 'gpt-4'">
                  gpt-4
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <button
                type="submit"
                class="text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                (click)="closeConfig()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="text-white bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                (click)="saveConfig()"
              >
                Save
              </button>
            </div>
            <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
              Not registered?
              <a
                href="https://www.embedelite.com/"
                target="_blank"
                class="text-blue-700 hover:underline dark:text-blue-500"
                >Get EmbedElite Key</a
              >
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ConfigComponent {
  @Output() showConfig = new EventEmitter<boolean>();

  ee_api_key: string;
  oai_api_key: string;
  defaultModel: string;

  constructor(
    private chatService: ChatService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.ee_api_key = "";
    const ee_api_key = this.storageService.getItem<string>("ee_api_key");
    if (ee_api_key) {
      this.ee_api_key = ee_api_key;
    }

    this.oai_api_key = "";
    const oai_api_key = this.storageService.getItem<string>("oai_api_key");
    if (oai_api_key) {
      this.oai_api_key = oai_api_key;
    }

    this.defaultModel = "gpt-3.5-turbo";
    const defaultModel = this.storageService.getItem<"gpt-3.5-turbo" | "gpt-4">(
      "default_model"
    );
    if (defaultModel) {
      this.defaultModel = defaultModel;
    }
  }

  selectDefaultModel(target: any) {
    this.defaultModel = target.value;
  }

  saveConfig() {
    this.storageService.setItem("oai_api_key", this.oai_api_key);
    this.storageService.setItem("ee_api_key", this.ee_api_key);
    this.storageService.setItem("default_model", this.defaultModel);
    this.chatService.updateProducts(this.ee_api_key);
    this.showConfig.emit(false);
  }

  closeConfig() {
    //go back one page
    this.router.navigate(["/"]);
  }
}
