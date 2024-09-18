import { appWindow } from "@tauri-apps/api/window";
import { Component } from "@angular/core";
import { ThemeService } from "./services/theme.service";
import { ChatService } from "./services/chat.service";
import { Location } from "@angular/common";
import { NavigationEnd, Router } from "@angular/router";

@Component({
  selector: "app-root",
  template: `
    <nav
      data-tauri-drag-region
      class="flex justify-between items-center bg-muted-100 dark:bg-muted-1000 shadow-md px-6 py-1 flex-shrink-0 border-b border-gray-800"
    >
      <div class="flex md:ml-14 text-sm">
        <i
          *ngIf="showToggleIcon"
          class="fas fa-bars cursor-pointer px-3 py-3 rounded text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
          (click)="toggleSidebarVisibility()"
        ></i>
        <i
          class="fas fa-arrow-left cursor-pointer px-3 py-3 rounded text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
          (click)="goBack()"
        ></i>
        <i
          class="fas fa-arrow-right cursor-pointer px-3 py-3 rounded text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
          (click)="goForward()"
        ></i>
        <a
          routerLink="/chat"
          routerLinkActive="text-black bg-gray-300 dark:bg-gray-800"
          class="px-4 py-2 rounded text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
          >Chat</a
        >
      </div>
      <div class="flex items-center space-x-4">
        <a
          routerLink="/settings"
          routerLinkActive="text-black bg-gray-300 dark:bg-gray-800"
          class="px-3 py-2 rounded text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-800"
          ><i class="fas fa-cog"></i>
        </a>
      </div>
    </nav>
    <div class="bg-muted-100 dark:bg-muted-1000 flex-grow overflow-auto">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
    `,
  ],
})
export class AppComponent {
  showToggleIcon: boolean = false;

  constructor(
    private themeService: ThemeService,
    private chatService: ChatService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showToggleIcon = this.router.url === "/chat";
      }
    });
  }

  goBack() {
    this.location.back();
  }

  goForward() {
    this.location.forward();
  }

  toggleSidebarVisibility() {
    this.chatService.toggleChatsVisibility();
  }
}
