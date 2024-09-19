import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-drop-down',
  template: `
  <div class="relative inline-block text-left">
    <div>
      <button (click)="toggleMenu()" 
        class="mr-0 mb-0 text-white bg-primary-500 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-l-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-primary-600 dark:hover:bg-primary-500 dark:focus:ring-primary-800"
        style="height: 44px;">
        <i class="fas" [ngClass]="{'fa-angle-down': isOpen, 'fa-angle-up': !isOpen}"></i>
      </button>
    </div>


    <div *ngIf="isOpen" class="absolute right-0 bottom-full z-10 mt-2 w-56 origin-bottom-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">

      <div class="py-1">
        <a href="#" (click)="onMenuItemClick('gpt-4o', $event)" class="block px-4 py-2 text-sm"
           [ngClass]="classNames({ 'bg-gray-100 text-gray-900': selectedItem === 'gpt-4o', 'text-gray-700': selectedItem !== 'gpt-4o' })">
          GPT-4o
        </a>
        <a href="#" (click)="onMenuItemClick('gpt-4o-mini', $event)" class="block px-4 py-2 text-sm"
           [ngClass]="classNames({ 'bg-gray-100 text-gray-900': selectedItem === 'gpt-4o-mini', 'text-gray-700': selectedItem !== 'gpt-4o-mini' })">
          GPT-4o-mini
        </a>
        <a href="#" (click)="onMenuItemClick('Claude-3', $event)" class="block px-4 py-2 text-sm"
           [ngClass]="classNames({ 'bg-gray-100 text-gray-900': selectedItem === 'Claude-3', 'text-gray-700': selectedItem !== 'Claude-3' })">
          Claude-3
        </a>
      </div>
      <div className="py-1">
        <a href="#" class="block px-4 py-2 text-sm cursor-not-allowed text-gray-400"
           [ngClass]="classNames({ 'bg-gray-100 text-gray-900': selectedItem === 'StableDiffusion 3', 'text-gray-700': selectedItem !== 'StableDiffusion 3' })">
          StableDiffusion 3
        </a>
        <a href="#" class="block px-4 py-2 text-sm cursor-not-allowed text-gray-400"
           [ngClass]="classNames({ 'bg-gray-100 text-gray-900': selectedItem === 'Midjourney', 'text-gray-700': selectedItem !== 'Midjourney' })">
          Midjourney
        </a>
        <a href="#" (click)="onMenuItemClick('dalle3', $event)" class="block px-4 py-2 text-sm"
           [ngClass]="classNames({ 'bg-gray-100 text-gray-900': selectedItem === 'dalle3', 'text-gray-700': selectedItem !== 'Midjourney' })">
          Dalle 3
        </a>
      </div>
    </div>
  </div>
  `,
  styles: [`
  `],
  animations: [
    trigger('menuAnimations', [
      state('void', style({
        transform: 'scale(0.95)',
        opacity: 0,
      })),
      state('*', style({
        transform: 'scale(1)',
        opacity: 1,
      })),
      transition('void => *', animate('100ms ease-out')),
      transition('* => void', animate('75ms ease-in')),
    ]),
  ]
})
export class DropDownComponent {
  @Input() selectedModel!: string;
  isOpen = false;
  menuItems: string[] = [];
  @Output() menuItemClick: EventEmitter<string> = new EventEmitter<string>();


  get selectedItem(): string {
    return this.selectedModel;
  }

  constructor(private http: HttpClient) {
    console.log('model selected: ', this.selectedModel);
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  closeMenu() {
    this.isOpen = false;
  }

  classNames(classes: { [key: string]: boolean }) {
    return Object.entries(classes)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(' ');
  }

  public changeModel(model: string): void {
    this.selectedModel = model;
  }

  onMenuItemClick(item: string, event: Event) {
    event.preventDefault();  // Prevent the default action of the anchor tag
    this.menuItemClick.emit(item); // Emit the event with the selected item
    this.selectedModel = item;  // Set the selected model
    this.closeMenu(); // Optionally close the menu after selection
  }
}
