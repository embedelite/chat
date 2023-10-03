import { Component } from "@angular/core";
@Component({
  selector: "app-root",
  template: `
    <nav
      class="flex justify-between items-center bg-gray-700 dark:bg-gray-900 shadow-md px-6 py-1 flex-shrink-0 border-b border-gray-800"
    >
      <div class="flex space-x-4">
        <a
          routerLink="/chat"
          routerLinkActive="active-link"
          class="px-3 py-2 rounded text-gray-300 dark:text-gray-200 hover:bg-gray-600 dark:hover:bg-gray-800"
          >Chat</a
        >
        <a
          routerLink="/editor"
          routerLinkActive="active-link"
          class="px-3 py-2 rounded text-gray-300 dark:text-gray-200 hover:bg-gray-600 dark:hover:bg-gray-800"
          >Editor</a
        >
      </div>
      <div class="flex items-center space-x-4">
        <a
          routerLink="/settings"
          routerLinkActive="active-link"
          class="px-3 py-2 rounded text-gray-300 dark:text-gray-200 hover:bg-gray-600 dark:hover:bg-gray-800"
          >Settings
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
      .active-link {
        color: #1a202c; /* text-primary-600, it's actually a dark gray color, if you want any other color replace it with your desired hex color */
        background-color: #4a5568; /* bg-gray-900, it's a lighter gray, replace it with your desired hex color */
      }
    `,
  ],
})
export class AppComponent {}
