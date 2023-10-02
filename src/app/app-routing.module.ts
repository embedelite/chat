import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EditorComponent } from "./editor/editor.component";
import { ChatComponent } from "./chat.component";
import { ConfigComponent } from "./config.component";

const routes: Routes = [
  { path: "chat", component: ChatComponent },
  { path: "settings", component: ConfigComponent },
  { path: "editor", component: EditorComponent },
  { path: "", redirectTo: "/chat", pathMatch: "full" }, // default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
