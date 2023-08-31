import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelRoutingModule } from './panel-routing.module';
import { PanelComponent } from './panel.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MaterialModule } from '../material/material.module';
import { HomeComponent } from './pages/home/home.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { InboxComponent } from './pages/inbox/inbox.component';
import { MyTaskComponent } from './pages/my-task/my-task.component';
import { HttpClientModule } from '@angular/common/http';
import { CreateProyectComponent } from './shared/create-proyect/create-proyect.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ProyectoComponent } from './pages/proyecto/proyecto.component';
import { AddUsuariosProyectComponent } from './shared/add-usuarios-proyect/add-usuarios-proyect.component';
import { SubtasksComponent } from './shared/subtasks/subtasks.component';
import { AddTaskComponent } from './shared/add-task/add-task.component';
import { AddSubtaskComponent } from './shared/add-subtask/add-subtask.component';
import { EditTasksComponent } from './pages/edit-tasks/edit-tasks.component';
import { CommentComponent } from './shared/comment/comment.component';


@NgModule({
  declarations: [
    PanelComponent,
    NavbarComponent,
    HomeComponent,
    SideNavComponent,
    InboxComponent,
    MyTaskComponent,
    CreateProyectComponent,
    ProyectoComponent,
    AddUsuariosProyectComponent,
    SubtasksComponent,
    AddTaskComponent,
    AddSubtaskComponent,
    EditTasksComponent,
    CommentComponent
  ],
  imports: [
    CommonModule,
    PanelRoutingModule,
    MaterialModule,
    NgxSpinnerModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-center'
    })
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  providers:[
    ToastrService
  ]
})
export class PanelModule { }
