import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { ChatInputComponent } from "./chat-input.component";
import { BotMessageComponent } from "./bot-message.component";
import { ChatAreaComponent } from "./chat-area.component";
import { UserMessageComponent } from "./user-message.component";
import { ConfigComponent } from "./config.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChatSidebarComponent } from "./sidebar.component";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { DocViewerComponent } from "./doc-viewer.component";
import { SafePipe } from "./shared/safe.pipe";
import { EditorComponent } from "./editor/editor-details.component";
import { ChatComponent } from "./chat.component";
import { AppRoutingModule } from "./app-routing.module";
import { EditorOverviewComponent } from "./editor/editor-overview.component";
import { HttpClientModule } from "@angular/common/http";

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
    EditorOverviewComponent,
    SafePipe,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
