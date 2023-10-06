import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Estados, ListarComentarios, TaskByUser, UpdateStateTask } from '../../models/models';
import { TaskService } from '../../services/task.service';
import { LoginServicesService } from 'src/app/auth/services/login-services.service';
import { SelectionModel } from '@angular/cdk/collections';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-my-task',
  templateUrl: './my-task.component.html',
  styleUrls: ['./my-task.component.scss']
})
export class MyTaskComponent implements OnInit {

  displayedColumns: string[] = ['select', 'nombre', 'estado', 'prioridad','fechafin'];
  dataSource = new MatTableDataSource<TaskByUser>();
  selection = new SelectionModel<TaskByUser>(true, []);
  idTaskSelect!: number;
  selectedTask!: Estados;
  state: Estados[] = [];
  idUsuario!: number;
  descripcion!: string;
  listaComentarios: ListarComentarios[] = [];

  constructor(private httpTaskServices: TaskService, private httpUserService: LoginServicesService, private httpStateService: StateService,){}

  ngOnInit(): void {
    this.idUsuario = this.httpUserService.getUserId();
    if(this.idUsuario){
      this.cargarTareasUsuario(this.idUsuario);
    }
  }

  cargarTareasUsuario(idUsuario: number){
    this.httpTaskServices.mostrarTareasPorUsuario(idUsuario).subscribe({
      next:(res:any) => {
        this.dataSource.data = res.data;
      },
    });
  }

  checkboxLabel(row: TaskByUser): string {  
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.idTarea}`;
  }

  toggleAllRows(row: TaskByUser) {
    this.selection.clear();
    this.selection.toggle(row);

    this.idTaskSelect = row.idTarea

    this.getStateByTask(this.idTaskSelect)
    this.getStates(); 
    this.cargarDescripcion(this.idTaskSelect);
    this.cargarComentarios(this.idTaskSelect);
    // this.getEncargadoByProyect(row.idTarea);
    // this.getStateByTask(row.idTarea);
     
    // this.getHistoryByTask(row.idTarea);
  }

  getStateByTask(idTask: number){
    this.httpStateService.getStateByTask(idTask).subscribe({
      next:(res: any) => {
        this.selectedTask = res.data;
      },
    });
  }

  getStates(){
    this.httpStateService.getStates().subscribe({
      next:(res: any) => {
        this.state = res.data
      },
    });
  }

  onSelectEstado(event: Event) {
    const target = event.target as HTMLSelectElement;
    const idEstado = target.value;

    let newState: UpdateStateTask = {
      idTarea: this.idTaskSelect,
      idUsuario: Number(this.httpUserService.getUserId()),
      idEstado: Number(idEstado)
    }

    this.httpTaskServices.updateStateTask(newState).subscribe({
      next:(res: any) => {
        if(res.success == true){
          this.selectedTask = this.state.find(x => x.idEstado == Number(idEstado)) || this.selectedTask
          this.dataSource.data = this.dataSource.data.map(task => {
            if (task.idTarea === this.idTaskSelect) {
              return { ...task, estado: this.selectedTask.nombre };
            }
            return task;
          });
        }
        target.selectedIndex = 0;
      },
    });  
    //this.cargarTareasUsuario(this.idUsuario);
  }

  cargarDescripcion(idTarea: number){
    this.httpTaskServices.obtenerDescripcionTarea(idTarea).subscribe({
      next:(res: any) => {
        this.descripcion = res.data
      },
    });
  }

  cargarComentarios(idTarea: number){
    this.httpTaskServices.obtenerComentarios(idTarea).subscribe({
      next: (res: any) => {
        this.listaComentarios = []
        this.listaComentarios = res.data
      },error: (err: any) => {
        console.log("Ocurrio un error");
      },
    })
  }
}
