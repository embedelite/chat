import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { StorageService } from "./services/storage.service";
import { ChatService } from "./services/chat.service";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ThemeService } from "./services/theme.service";

@Component({
  selector: "app-config",
  template: `
    <div class="w-full h-full flex items-start justify-center md:p-6 xs:p-2">
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
          <!-- SVG and label omitted for brevity -->
        </button>
        <div class="px-6 py-6 lg:px-8">
          <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
            Global Configuration
          </h3>
          <form class="space-y-6" action="#" [formGroup]="configForm">
            <!-- EmbedElite API KEY Control -->
            <div>
              <label
                for="ee_api_key"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                EmbedElite API KEY
              </label>
              <input
                formControlName="ee_api_key"
                id="ee_api_key"
                placeholder="sk_..."
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required
              />
            </div>
            <!-- OpenAI API KEY Control -->
            <div>
              <label
                for="oai_api_key"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                OpenAI API KEY
              </label>
              <input
                formControlName="oai_api_key"
                id="oai_api_key"
                placeholder="sk_..."
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required
              />
            </div>
            <!-- Default OpenAI Model Control -->
            <div class="flex p-0 m-2">
              <label
                for="default_model"
                class="pt-3 pr-3 shrink-0 block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Default OpenAI model:
              </label>
              <select
                formControlName="defaultModel"
                id="default_model"
                class="appearance-none px-3 py-2 h-10 text-sm leading-5 font-sans w-full border border-muted-300 bg-white text-muted-600 placeholder-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg dark:placeholder-muted-600 dark:bg-muted-700 dark:text-muted-200 dark:border-muted-600 dark:focus-visible:border-muted-600 focus-visible:ring-0 outline-transparent focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-muted-300 dark:focus-visible:outline-muted-600 focus-visible:outline-offset-2 transition-all duration-300"
              >
                <option [value]="'gpt-3.5-turbo'">gpt-3.5-turbo</option>
                <option [value]="'gpt-4'">gpt-4</option>
                <option [value]="'gpt-4-turbo-preview'">
                  gpt-4-turbo-preview
                </option>
                <option [value]="'gpt-4o'">gpt-4o</option>
              </select>
            </div>
            <!-- Dark Mode Control -->
            <div>
              <label class="flex items-center space-x-3">
                <input
                  formControlName="isDarkMode"
                  id="toggleDark"
                  type="checkbox"
                  (change)="toggleDarkMode()"
                  class="form-checkbox h-5 w-5 text-blue-600 dark:text-pink-600"
                  aria-labelledby="toggleDark"
                />
                <span class="text-gray-700 dark:text-gray-200">Dark Mode</span>
              </label>
            </div>
            <!-- Buttons -->
            <div class="flex justify-between">
              <div>
                <button
                  *ngIf="configForm.dirty"
                  type="button"
                  class="w-40 text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-10 py-3 mt-4 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                  (click)="closeConfig()"
                >
                  Cancel
                </button>
                <div *ngIf="!configForm.dirty" class="flex-grow"></div>
              </div>
              <div>
                <button
                  type="button"
                  class="w-40 primary-btn px-10 py-3 mt-4"
                  (click)="saveConfig()"
                  [disabled]="!configForm.dirty"
                >
                  Save
                </button>
              </div>
            </div>
            <!-- Link to obtain EmbedElite Key -->
            <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
              Not registered?
              <a
                href="https://www.embedelite.com/"
                target="_blank"
                class="text-blue-700 hover:underline dark:text-blue-500"
              >
                Get EmbedElite Key
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ConfigComponent implements OnInit {
  @Output() showConfig = new EventEmitter<boolean>();

  configForm: FormGroup = new FormGroup({});

  constructor(
    private chatService: ChatService,
    private storageService: StorageService,
    private themeService: ThemeService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    const ee_api_key = this.storageService.getItem<string>("ee_api_key") || "";
    const oai_api_key =
      this.storageService.getItem<string>("oai_api_key") || "";
    const defaultModel =
      this.storageService.getItem<
        "gpt-3.5-turbo" | "gpt-4" | "gpt-4-turbo-preview" | "gpt-4o"
      >("default_model") || "";
    const isDarkMode = this.detectDarkMode();

    this.configForm = this.fb.group({
      ee_api_key: [ee_api_key, Validators.required],
      oai_api_key: [oai_api_key, Validators.required],
      defaultModel: [defaultModel],
      isDarkMode: [isDarkMode],
    });
  }

  detectDarkMode(): boolean {
    const theme = this.storageService.getItem<string>("theme");
    return theme === "dark";
  }

  toggleDarkMode() {
    const currentMode = this.configForm.get("isDarkMode")?.value;
    this.themeService.setTheme(currentMode);
  }

  saveConfig() {
    this.storageService.setItem(
      "oai_api_key",
      this.configForm.get("oai_api_key")?.value
    );
    this.storageService.setItem(
      "ee_api_key",
      this.configForm.get("ee_api_key")?.value
    );
    this.storageService.setItem(
      "default_model",
      this.configForm.get("defaultModel")?.value
    );
    this.toggleDarkMode();
    this.chatService.updateProducts(this.configForm.get("ee_api_key")?.value);
    this.showConfig.emit(false);
  }

  closeConfig() {
    this.router.navigate(["/"]);
  }
}
