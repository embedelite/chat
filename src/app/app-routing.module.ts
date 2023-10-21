import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ChatComponent } from "./chat.component";
import { ConfigComponent } from "./config.component";
import { EditorOverviewComponent } from "./editor/editor-overview.component";
import { EditorComponent } from "./editor/editor-details.component";

const routes: Routes = [
  { path: "chat", component: ChatComponent },
  { path: "settings", component: ConfigComponent },
  { path: "editor", component: EditorOverviewComponent },
  { path: "editor/:id", component: EditorComponent },
  { path: "", redirectTo: "/chat", pathMatch: "full" }, // default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
