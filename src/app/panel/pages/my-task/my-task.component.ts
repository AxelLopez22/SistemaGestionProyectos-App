import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AgregarComentario, Estados, ListarComentarios, TaskByUser, UpdateStateTask } from '../../models/models';
import { TaskService } from '../../services/task.service';
import { LoginServicesService } from 'src/app/auth/services/login-services.service';
import { SelectionModel } from '@angular/cdk/collections';
import { StateService } from '../../services/state.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

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
  comment: string = '';
  selectedFile: File | undefined;
  archivos: any;
  archivoSeleccionado: File | null = null;
  loader = false
  readonly baseUrl = environment.baseUrlHub;
  private connection!: HubConnection;

  constructor(private httpTaskServices: TaskService, private httpUserService: LoginServicesService, private httpStateService: StateService,){
    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hub/comment`)
      .build();
      
      this.connection.on('NotifyComment', comentario => {
        if(comentario.idTarea === this.idTaskSelect){
          comentario.descripcion = comentario.descripcion.replace(/\\n/g, '<br>');
          this.listaComentarios.push(comentario);
        }    
      });
  }

  ngOnInit(): void {
    this.connection.start()
      .then(_ => {
        console.log('Connection Started');
      }).catch(error => {
        return console.error(error);
      });

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
    this.loader = true;
    
    setTimeout(() => {  
      this.loader = false;
    }, 1500);
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
        this.listaComentarios = res.data ? res.data.map((coment:ListarComentarios) => {
          coment.idComentario = coment.idComentario
          coment.descripcion = coment.descripcion.replace(/\\n/g, '<br>')
          coment.fecha = coment.fecha
          coment.foto = coment.foto
          coment.usuario = coment.usuario
          coment.idTarea = coment.idTarea
          return coment;
        }) : [];
        console.log(this.listaComentarios);
        
      },error: (err: any) => {
        console.log("Ocurrio un error");
      },
    })
  }

  handleTextareaInput() {
    const mentionPattern = /@([\w]+)/g;  
    const matches = this.comment.match(mentionPattern);
    //console.log(matches);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files;
    this.archivos = this.selectedFile;
    this.archivoSeleccionado = event.target.files[0]; 
  }

  submitComment() {
    let idArchivo = null;
    if(this.archivos != null){
      const formData = new FormData();
      formData.append('archivo', this.archivos);

      this.httpTaskServices.AddFileTask(formData).subscribe({
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
      descripcion: this.comment.replace(/\n/g, "\\n"),
      idTarea: this.idTaskSelect,
      idUsuario: Number(this.httpUserService.getUserId()),
    }

    this.enviarComentario(comentario);
    
    this.comment = '';
    this.selectedFile = undefined;
  }

  enviarComentario(comentario: AgregarComentario){
    this.httpTaskServices.agregarComentario(comentario).subscribe({
      next:(res: any) => {
        //this.listaComentarios.push(comentario)
        return true;
      },error:(err: any) => {
        return false
      },
    });
  }
}
