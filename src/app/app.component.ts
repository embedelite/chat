import { Component } from "@angular/core";
import { ThemeService } from "./services/theme.service";
@Component({
  selector: "app-root",
  template: `
    <nav
      class="flex justify-between items-center bg-gray-200 dark:bg-gray-900 shadow-md px-6 py-1 flex-shrink-0 border-b border-gray-800"
    >
      <div class="flex space-x-4">
        <a
          routerLink="/chat"
          routerLinkActive="text-black bg-gray-300 dark:bg-gray-800"
          class="px-3 py-2 rounded text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
          >Chat</a
        >
        <a
          routerLink="/editor"
          routerLinkActive="text-black bg-gray-300 dark:bg-gray-800"
          class="px-3 py-2 rounded text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-800"
          >Solutions</a
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
    <div class="bg-gray-200 dark:bg-gray-900 flex-grow overflow-auto">
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
  constructor(private themeService: ThemeService) {}
}
