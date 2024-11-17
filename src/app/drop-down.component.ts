import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-drop-down",
  template: `
    <div class="relative inline-block text-left">
      <div>
        <button
          (click)="toggleMenu()"
          class="mr-0 mb-0 text-white bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-primary-600 dark:hover:bg-primary-500 dark:focus:ring-primary-800"
          style="height: 44px;"
        >
          <i
            class="fas"
            [ngClass]="{ 'fa-angle-down': isOpen, 'fa-angle-up': !isOpen }"
          ></i>
        </button>
      </div>

      <div
        *ngIf="isOpen"
        class="absolute right-0 bottom-full z-10 mt-2 w-56 origin-bottom-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabindex="-1"
      >
        <div class="py-1">
          <a
            href="#"
            (click)="onMenuItemClick('gpt-3.5-turbo', $event)"
            class="block px-4 py-2 text-sm flex justify-between items-center hover:bg-gray-100"
            [ngClass]="{ 'bg-gray-50': selectedModel === 'gpt-3.5-turbo' }"
          >
            <span>GPT-3.5-Turbo</span>
            <i
              *ngIf="selectedModel === 'gpt-3.5-turbo'"
              class="fas fa-check text-primary-500"
            ></i>
          </a>
          <a
            href="#"
            (click)="onMenuItemClick('gpt-4o', $event)"
            class="block px-4 py-2 text-sm flex justify-between items-center hover:bg-gray-100"
            [ngClass]="{ 'bg-gray-50': selectedModel === 'gpt-4o' }"
          >
            <span>GPT-4o</span>
            <i
              *ngIf="selectedModel === 'gpt-4o'"
              class="fas fa-check text-primary-500"
            ></i>
          </a>
          <a
            href="#"
            (click)="onMenuItemClick('gpt-4o-mini', $event)"
            class="block px-4 py-2 text-sm flex justify-between items-center hover:bg-gray-100"
            [ngClass]="{ 'bg-gray-50': selectedModel === 'gpt-4o-mini' }"
          >
            <span>GPT-4o-mini</span>
            <i
              *ngIf="selectedModel === 'gpt-4o-mini'"
              class="fas fa-check text-primary-500"
            ></i>
          </a>
          <a
            href="#"
            class="block px-4 py-2 text-sm flex justify-between items-center cursor-not-allowed text-gray-400"
          >
            <span>Claude-3</span>
            <i
              *ngIf="selectedModel === 'Claude-3'"
              class="fas fa-check text-primary-500"
            ></i>
          </a>
        </div>
        <div className="py-1">
          <a
            href="#"
            class="block px-4 py-2 text-sm flex justify-between items-center cursor-not-allowed text-gray-400"
          >
            <span>StableDiffusion 3</span>
            <i
              *ngIf="selectedModel === 'StableDiffusion 3'"
              class="fas fa-check text-primary-500"
            ></i>
          </a>
          <a
            href="#"
            class="block px-4 py-2 text-sm flex justify-between items-center cursor-not-allowed text-gray-400"
          >
            <span>Midjourney</span>
            <i
              *ngIf="selectedModel === 'Midjourney'"
              class="fas fa-check text-primary-500"
            ></i>
          </a>
          <a
            href="#"
            (click)="onMenuItemClick('dalle3', $event)"
            class="block px-4 py-2 text-sm flex justify-between items-center hover:bg-gray-100"
            [ngClass]="{ 'bg-gray-50': selectedModel === 'dalle3' }"
          >
            <span>Dalle 3</span>
            <i
              *ngIf="selectedModel === 'dalle3'"
              class="fas fa-check text-primary-500"
            ></i>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .menu-item {
        transition: background-color 0.2s ease;
      }
    `,
  ],
})
export class DropDownComponent implements OnInit {
  @Input() selectedModel!: string;
  isOpen = false;
  menuItems: string[] = [];
  @Output() menuItemClick: EventEmitter<string> = new EventEmitter<string>();

  get selectedItem(): string {
    return this.selectedModel;
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log("Initial selected model:", this.selectedModel);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedModel"]) {
      console.log("Selected model changed:", this.selectedModel);
    }
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  closeMenu() {
    this.isOpen = false;
  }

  onMenuItemClick(item: string, event: Event) {
    event.preventDefault();
    this.menuItemClick.emit(item);
    this.closeMenu();
  }
}
