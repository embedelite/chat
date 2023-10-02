import { Component } from "@angular/core";
import { Chat, ChatService } from "./services/chat.service";

@Component({
  selector: "app-root",
  template: ` <div
    class="flex h-screen flex-col bg-white dark:bg-gray-800 shadow-md"
  >
    <router-outlet></router-outlet>
  </div>`,
  styles: [],
})
export class AppComponent {}
