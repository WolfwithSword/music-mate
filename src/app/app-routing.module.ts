import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlayerComponent } from "./player/player.component";
import { MainComponent } from "./main/main.component";

const routes: Routes = [
  { path: "", component: MainComponent },
  { path: "**", redirectTo: "" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}