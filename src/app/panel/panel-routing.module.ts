import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './panel.component';
import { HomeComponent } from './pages/home/home.component';
import { InboxComponent } from './pages/inbox/inbox.component';
import { MyTaskComponent } from './pages/my-task/my-task.component';
import { ProyectoComponent } from './pages/proyecto/proyecto.component';

const routes: Routes = [
  {path: '', redirectTo: 'panel', pathMatch: 'full'},
  {path: '', component: PanelComponent, children: [
    {path: 'home', component: HomeComponent},
    {path: 'misTareas', component: MyTaskComponent},
    {path: 'inbox', component: InboxComponent},
    {path: 'proyecto/:id', component: ProyectoComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanelRoutingModule { }
