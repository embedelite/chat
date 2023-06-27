import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { ChatInputComponent } from "./chat-input.component";
import { BotMessageComponent } from "./bot-message.component";
import { ChatAreaComponent } from "./chat-area.component";
import { UserMessageComponent } from "./user-message.component";
import { FormsModule } from "@angular/forms";
import { ChatService } from "./chat.service";
import { ChatSidebarComponent } from "./sidebar.component";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { DocViewerComponent } from "./doc-viewer.component";
import { SafePipe } from "./shared/safe.pipe";

@NgModule({
  declarations: [
    AppComponent,
    BotMessageComponent,
    ChatInputComponent,
    ChatAreaComponent,
    UserMessageComponent,
    ChatSidebarComponent,
    DocViewerComponent,
    SafePipe,
  ],
  imports: [BrowserModule, FormsModule, PdfViewerModule],
  providers: [ChatService],
  bootstrap: [AppComponent],
})
export class AppModule {}
