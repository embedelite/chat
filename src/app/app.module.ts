import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { ChatInputComponent } from "./chat-input.component";
import { BotMessageComponent } from "./bot-message.component";
import { ChatAreaComponent } from "./chat-area.component";
import { UserMessageComponent } from "./user-message.component";
import { ConfigComponent } from "./config.component";
import { FormsModule } from "@angular/forms";
import { ChatSidebarComponent } from "./sidebar.component";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { DocViewerComponent } from "./doc-viewer.component";
import { SafePipe } from "./shared/safe.pipe";
import { EditorComponent } from "./editor/editor.component";
import { ChatComponent } from "./chat.component";
import { AppRoutingModule } from "./app-routing.module";

@NgModule({
  declarations: [
    AppComponent,
    BotMessageComponent,
    ChatComponent,
    ChatInputComponent,
    ChatAreaComponent,
    UserMessageComponent,
    ChatSidebarComponent,
    DocViewerComponent,
    ConfigComponent,
    EditorComponent,
    SafePipe,
  ],
  imports: [AppRoutingModule, BrowserModule, FormsModule, PdfViewerModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
