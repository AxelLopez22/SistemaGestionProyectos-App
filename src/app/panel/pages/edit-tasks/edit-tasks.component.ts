import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AgregarComentario, CreateSubTask, CreateTask, Estados, ListarComentarios, Task, UpdateStateTask, UserLeaderProyect } from '../../models/models';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { StateService } from '../../services/state.service';
import { LoginServicesService } from 'src/app/auth/services/login-services.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddSubtaskComponent } from '../../shared/add-subtask/add-subtask.component';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Component({
  selector: 'app-edit-tasks',
  templateUrl: './edit-tasks.component.html',
  styleUrls: ['./edit-tasks.component.scss']
})
export class EditTasksComponent implements OnInit {

  idTask!: number;
  idProyect!: number;
  tarea!: Task;
  completed: boolean = false;
  displayedColumns: string[] = ['select', 'descripcion', 'fechaEntrega', 'responsable'];
  dataSource = new MatTableDataSource<Task>();
  selection = new SelectionModel<Task>(true, []);
  comment: string = '';
  selectedFile: File | undefined;
  state: Estados[] = [];
  idNewState: number = 0;
  selectedTask!: Estados;
  encargado!: UserLeaderProyect;
  comentario!: AgregarComentario;
  archivos: any;
  archivoSeleccionado: File | null = null;
  listaComentarios: ListarComentarios[] = [];
  idTaskSelect!: number;
  subTask: CreateSubTask[] = [];
  readonly baseUrl = environment.baseUrlHub;
  private connection!: HubConnection;

  constructor(private route: ActivatedRoute, private httpTaskService: TaskService, private httpStateService: StateService,
    private httpUserService: LoginServicesService,  private dialog: MatDialog, private toastr: ToastrService){
      this.connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hub/comment`)
      .build();
      
      this.connection.on('NotifyComment', comentario => {
        this.listaComentarios.push(comentario);
        console.log(comentario);
      });
    }

  ngOnInit(): void {
    this.connection.start()
      .then(_ => {
        console.log('Connection Started');
      }).catch(error => {
        return console.error(error);
      });

    this.route.paramMap.subscribe(params => {
      this.idTask = Number(params.get('idTarea'));
      this.idProyect = Number(params.get('id'));

      if (this.idTask) {
        this.httpTaskService.getTaskById(this.idProyect, this.idTask).subscribe({
          next:(res: any) => {
            this.tarea = res.data[0];
            this.dataSource.data = this.tarea.subTareas;
          },
        });
      }
      
      this.idTaskSelect = this.idTask
      this.getStateByTask(this.idTask)
      this.getStates()
      this.getEncargadoByProyect(this.idTask)
      this.cargarComentarios(this.idTask);
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  

  onFileSelected(event: any) {
    this.selectedFile = event.target.files;
    this.archivos = this.selectedFile;
    this.archivoSeleccionado = event.target.files[0]; 
  }

  onSelectEstado(event: Event) {
    const target = event.target as HTMLSelectElement;
    const idEstado = target.value;

    let newState: UpdateStateTask = {
      idTarea: this.idTaskSelect,
      idUsuario: Number(this.httpUserService.getUserId()),
      idEstado: Number(idEstado)
    }
   
    this.httpTaskService.updateStateTask(newState).subscribe({
      next:(res: any) => {
        if(res.success == true){
          this.selectedTask = this.state.find(x => x.idEstado == Number(idEstado)) || this.selectedTask
        }
        target.selectedIndex = 0;
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

  getEncargadoByProyect(idTarea: number){
    this.httpTaskService.obtenerEncargadoTarea(idTarea).subscribe({
      next: (res:any) => {
        this.encargado = res.data
      },
    });
  }

  getStateByTask(idTask: number){
    this.httpStateService.getStateByTask(idTask).subscribe({
      next:(res: any) => {
        this.selectedTask = res.data;
      },
    });
  }

  cargarComentarios(idTarea: number){
    this.httpTaskService.obtenerComentarios(idTarea).subscribe({
      next: (res: any) => {
        this.listaComentarios = []
        this.listaComentarios = res.data
      },error: (err: any) => {
        console.log("Ocurrio un error");
      },
    })
  }

  submitComment() {
    let idArchivo = null;
    if(this.archivos != null){
      const formData = new FormData();
      formData.append('archivo', this.archivos);

      this.httpTaskService.AddFileTask(formData).subscribe({
        next:(res:any) => {
          idArchivo = res.data.IdArchivo
        },error:(err:any) => {
          console.log(err);
        },
      });

      let comentario: AgregarComentario = {
        descripcion: this.comment,
        idTarea: this.idTaskSelect,
        idUsuario: Number(this.httpUserService.getUserId()),
        idArchivo: idArchivo
      } 

      this.enviarComentario(comentario);
      this.comment = '';
      this.selectedFile = undefined;

      return;
    }

    let comentario: AgregarComentario = {
      descripcion: this.comment,
      idTarea: this.idTaskSelect,
      idUsuario: Number(this.httpUserService.getUserId()),
    }

    this.enviarComentario(comentario);
    
    this.comment = '';
    this.selectedFile = undefined;
  }

  openModal() {
    const dialogRef: MatDialogRef<any> = this.dialog.open(AddSubtaskComponent, {
      width: '80%',
      height: '90vh',
      disableClose: false,
      data: {
        idProyecto: this.idProyect
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.subTask = result;
      let data = this.processData(result)  
      
      this.httpTaskService.agregarSubTareas(this.idTask ,data).subscribe({
        next: (res: any) => {
          if(res.success == true){
            this.showAlert(true, "SubTareas Agregadas con exito")
            var element = this.procesSubTask(result);
            console.log(element);
            
          } else {
            this.showAlert(false, "Ha ocurrido un error al agregar las subTareas")
          }
        },error:(err: any) => {
            this.showAlert(false, "Estamos teniendo problemas, intentelo mas tarde")
        },
      });
    });
  }

  enviarComentario(comentario: AgregarComentario){
    this.httpTaskService.agregarComentario(comentario).subscribe({
      next:(res: any) => {
        //this.listaComentarios.push(comentario)
        return true;
      },error:(err: any) => {
        return false
      },
    });
  }

  handleTextareaInput() {
    const mentionPattern = /@([\w]+)/g;  
    const matches = this.comment.match(mentionPattern);
    //console.log(matches);
  }

  procesSubTask(task: any){
    let processData: Task[] = [];
    task.forEach((element: Task) => {
      let task: Task = {
        idTarea: element.idTarea,
        nombre: element.nombre,
        descripcion: element.descripcion,
        responsable: element.responsable,
        estado: element.estado,
        fechaInicio: element.fechaInicio,
        fechaFin: element.fechaFin,
        urlArchivo: element.urlArchivo,
        idTareaPadre: element.idTareaPadre,
        prioridad: element.prioridad,
        subTareas: []
      }

      processData.push(task);
    });

    return processData;
  }

  toggleAllRows(row: Task) {
    this.selection.clear();
    this.selection.toggle(row);

    this.idTaskSelect = row.idTarea
    this.getEncargadoByProyect(row.idTarea);
    this.getStateByTask(row.idTarea);
    this.cargarComentarios(row.idTarea);
  }

  checkboxLabel(row: Task): string {  
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.idTarea}`;
  }

  processData(task: any){
    let subTaskProcess: CreateSubTask[] = []
    task.forEach((element: CreateSubTask) => {
      let newSubTask: CreateSubTask = {
        nombre: element.nombre,
        descripcion: element.descripcion,
        fechaFin: element.fechaFin,
        idProyecto: element.idProyecto,
        idArchivo: element.idArchivo,
        idPrioridad: element.idPrioridad.idPrioridad,
        idUsuario: element.idUsuario.idUsuario
      }

      subTaskProcess.push(newSubTask);
    });
    return subTaskProcess;
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
