import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UsuariosService } from '../../services/usuarios.service';
import { AddUsuariosProyectComponent } from '../../shared/add-usuarios-proyect/add-usuarios-proyect.component';
import { ActivatedRoute } from '@angular/router';
import { ProyectService } from '../../services/proyect.service';
import { AddUserProyect, Estados, ProyectByUser, ProyectUser, Task, TaskFilter, TaskState, UserLeaderProyect, UserSelect } from '../../models/models';
import { ToastrService } from 'ngx-toastr';
import { StateService } from '../../services/state.service';
import { TaskService } from '../../services/task.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-proyecto',
  templateUrl: './proyecto.component.html',
  styleUrls: ['./proyecto.component.scss']
})
export class ProyectoComponent implements OnInit {

  nombre: string = '';
  descripcion: string = '';
  estado: string = '';
  idproyect!: number;
  proyecto!: ProyectUser;
  userToProyect!: AddUserProyect;
  userSelected: UserSelect[] = [];
  userProyect: UserSelect[] = [];
  leaderProyect!: UserLeaderProyect;
  state: Estados[] = [];
  idNewState: number = 0;
  loader = false
  tasks: Task[] = [];
  displayedColumns: string[] = ['nombre', 'descripcion', 'estado'];
  selectedTabIndex: number = 0;
  filter: TaskFilter = {
    searchText: ''
  };
  filteredTasks: Task[] = [];
  filterText: string = '';

  SinComenzar: TaskState[] = []
  EnCurso: TaskState[] = []
  EnRiesgo: TaskState[] = []
  ConRetraso: TaskState[] = []
  EnEspera: TaskState[] = []
  Finalizadas: TaskState[] = []

  todo: TaskState[] = [];

  done:TaskState[] = [];


  constructor(private dialog: MatDialog, private httpUserServices: UsuariosService,  private route: ActivatedRoute,
    private httpProyectService: ProyectService, private changeDetectorRef: ChangeDetectorRef, private toastr: ToastrService,
    private httpStateService: StateService, private httpTaskServices: TaskService){
    }

  ngOnInit(): void {
    const storedTabIndex = localStorage.getItem('selectedTabIndex');
    if (storedTabIndex) {
      this.selectedTabIndex = +storedTabIndex;
    }
    this.route.paramMap.subscribe(params => {
      this.idproyect = Number(params.get('id'));

      if(this.idproyect){
        this.httpProyectService.GetProyectById(this.idproyect).subscribe({
          next:(res: any) => {
            for (let index = 0; index < res.data.length; index++) {
              this.proyecto = res.data[index];
            }
          },
        });
        
        this.httpProyectService.getUserByProyect(this.idproyect).subscribe({
          next:(res: any) => {
            this.userProyect = res.data
          },
        });

        this.getLeader(this.idproyect);
        this.GetTaskByProyect(this.idproyect);
        this.getTastByState(this.idproyect);
      }
    });

    this.getStates();

  }

  drop(event: CdkDragDrop<TaskState[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  getTastByState(idProyecto: number){
    this.httpTaskServices.mostrarTareasPorEstado(idProyecto).subscribe({
      next:(res: any) => {
        this.SinComenzar = res.data.filter((tarea:TaskState)  => tarea.idEstado === 1)
        this.EnCurso = res.data.filter((tarea:TaskState)  => tarea.idEstado === 2)
        this.EnRiesgo = res.data.filter((tarea:TaskState)  => tarea.idEstado === 3)
        this.ConRetraso = res.data.filter((tarea:TaskState)  => tarea.idEstado === 4)
        this.EnEspera = res.data.filter((tarea:TaskState)  => tarea.idEstado === 5)
        this.Finalizadas = res.data.filter((tarea:TaskState)  => tarea.idEstado === 6)
      },
    });
  }

  getStates(){
    this.httpStateService.getStates().subscribe({
      next:(res:any) => {
        this.state = res.data;
      },
    })
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
    // Almacenar el índice del tab seleccionado en localStorage
    localStorage.setItem('selectedTabIndex', this.selectedTabIndex.toString());
  }

  searchTask(value: string) {
    value = value.toLowerCase();

    if (value.length > 0) {
      this.tasks = this.tasks.filter(task => {
        task.subTareas = task.subTareas.filter(subTask => {
          return subTask.nombre.toLowerCase().includes(value) || subTask.descripcion.toLowerCase().includes(value);
        });

        return task.subTareas.length > 0;
      });
    } else {
      // Si el campo de búsqueda está vacío, mostrar todas las tareas originales.
      this.tasks = this.tasks.slice(); // Crear una copia para evitar modificar originalTasks.
    }
  }

  // updateListTask(){
  //   this.tasks = []

  //   let exist = false;

  //   for(let subtasks of t)

  // }
  

  guardarUsuarios(){
    if(this.userSelected.length > 0){
      let ids:number[] = [];
      this.userSelected.forEach((element:UserSelect) => {
        ids.push(element.idUsuario)
      });
      let users: AddUserProyect = {
        idproyecto: this.idproyect,
        idUsuario: ids
      }

      this.httpProyectService.agregarUsuarios(users).subscribe({
        next:(res:any) => {
          if(res.success === true){
            this.showAlert(true, "Usuarios agregados con exito");
          } else if(res.success === false){
            this.showAlert(false, "Ha ocurrido un error al agregar usuarios")
          }
        },error:(err:any) => {
          this.showAlert(false, "Ha ocurrido un error");
        },
      });
    } else if(this.idNewState !== 0){
      this.updateStateProyect(this.idproyect, this.idNewState);

      setTimeout(() => {
        location.reload();
      }, 3000);
    } else {
      this.showAlert(false, "No hay cambios para guardar")
    }
  }

  updateStateProyect(IdProyecto: number, IdState: number){
    this.httpProyectService.updateStateProyect(IdProyecto, IdState).subscribe({
      next:(res:any) => {
        if(res === true){
          this.showAlert(true, "Estado Actualizado con exito");
        } else{
          this.showAlert(false, "Error, no se pudo actualizar el proyecto")
        }
      },
      error:(err: any) => {
        this.showAlert(false, "Ocurrio un error al actualizar el proyecto")
      },
    });
  }

  onSelectEstado(event: Event) {
    const target = event.target as HTMLSelectElement;
    const idEstado = target.value;

    if (idEstado !== null) {
      this.idNewState = +idEstado;
    }
  }

  GetTaskByProyect(IdProyect: number){
    this.httpTaskServices.getTaskByProyect(IdProyect).subscribe({
      next:(res:any) => {
        this.tasks = res.data;
      },
    });
  }

  // groupTasks(data: Task[]): Task[]{
  //   const taskMap = new Map<number, Task>();

  //   data.forEach((item) => {
  //     const task: Task = {
  //       IdTarea: item.IdTarea,
  //       Nombre: item.Nombre,
  //       Descripcion: item.Descripcion,
  //       FechaInicio: item.FechaInicio,
  //       FechaFin: item.FechaFin,
  //       IdTareaPadre: item.IdTareaPadre,
  //       Estado: item.Estado,
  //       Responsable: item.Responsable,
  //       UrlArchivo: item.UrlArchivo,
  //       Prioridad: item.Prioridad,
  //       Subtareas: []
  //     }

  //     taskMap.set(task.IdTarea, task);
  //   });

  //   data.forEach((item) => {
  //     const task = taskMap.get(item.IdTarea);

  //     if (item.IdTareaPadre !== null && task) {
  //       const parentTask = item.IdTareaPadre !== undefined ? taskMap.get(item.IdTareaPadre) : undefined;
  //       if (parentTask) {
  //         parentTask.Subtareas!.push(task); // Agregar la tarea como subtarea del padre
  //       }
  //     }
  //   });

  //   const rootTasks = Array.from(taskMap.values()).filter((task) => !task.IdTareaPadre);
  //   return rootTasks;
  // }

  deleteUserToProyect(IdUsuario: number){
    this.httpProyectService.deleteUserToProyect(this.idproyect, IdUsuario).subscribe({
      next:(res: any) => {
        if(res.success == true){
          this.loader = true;
          this.showAlert(true, "El usuario ha sido eliminado de este proyecto")
          setTimeout(() => {
            location.reload();
            this.loader = false;
          }, 2000);
        } else {
          this.showAlert(false, "Ocurrio un error al eliminar usuario")
        }
      },error:(err) => {
        this.showAlert(false, "Ocurrio un error al eliminar usuario, asegurese de haber guardado cambios")
      },
    });
  }

  getLeader(IdProyect: number){
    this.httpProyectService.getLeaderProyect(IdProyect).subscribe({
      next:(res: any) => {
        this.leaderProyect = res.data;
      },
    });
  }

  openModal() {
    const dialogRef: MatDialogRef<any> = this.dialog.open( AddUsuariosProyectComponent , {
      width: '750px',
      //height: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((usuariosSeleccionados: UserSelect[]) => {
      if (usuariosSeleccionados) {
        usuariosSeleccionados.forEach(usuarioSeleccionado => {
          const index = this.userSelected.findIndex(user => user.nombresCompleto === usuarioSeleccionado.nombresCompleto);
          if (index === -1) {
            this.userSelected.push(usuarioSeleccionado);
            this.userProyect.push(usuarioSeleccionado);
            // if(this.userProyect.length > 0 || this.userProyect.length === 0){
            //   this.userProyect.push(usuarioSeleccionado);
            // }
          }
        });
      }
    });
  }

  showAlert(isSuccess:boolean,mensaje:string){
    isSuccess === true ? this.toastr.success(`${mensaje}`,"",{
        timeOut: 2000,
        closeButton: true,
        progressBar: true,
        progressAnimation: 'decreasing',
        easing: 'ease-in',
        easeTime: 300,
      } ): this.toastr.error(`${mensaje}`,"",{
      timeOut: 2000,
      closeButton: true,
      progressBar: true,
      progressAnimation: 'decreasing',
      easing: 'ease-in',
      easeTime: 300,
    } )
  }
}
