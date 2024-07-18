import { NgModule, isDevMode } from "@angular/core";
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
import { ServiceWorkerModule } from '@angular/service-worker';
import { MarkdownModule } from "ngx-markdown";

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
        MarkdownModule.forRoot(),
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: !isDevMode(),
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }
