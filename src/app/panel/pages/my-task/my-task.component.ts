import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AgregarComentario, Estados, ListarComentarios, MencionarUsuario, TaskByUser, UpdateStateTask, UserSelect } from '../../models/models';
import { TaskService } from '../../services/task.service';
import { LoginServicesService } from 'src/app/auth/services/login-services.service';
import { SelectionModel } from '@angular/cdk/collections';
import { StateService } from '../../services/state.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { Observable, map, of, startWith } from 'rxjs';
import { UsuariosService } from '../../services/usuarios.service';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-my-task',
  templateUrl: './my-task.component.html',
  styleUrls: ['./my-task.component.scss']
})
export class MyTaskComponent implements OnInit {

  displayedColumns: string[] = ['select', 'nombre', 'estado', 'prioridad','fechafin'];
  displayedColumnsTaskColaborator: string[] = ['select', 'nombre', 'estado', 'prioridad','fechafin'];
  dataSource = new MatTableDataSource<TaskByUser>();
  dataSourceTaskColaborator = new MatTableDataSource<TaskByUser>();
  selection = new SelectionModel<TaskByUser>(true, []);
  idTaskSelect!: number;
  selectedTask!: Estados;
  tarea: TaskByUser = {} as TaskByUser; 
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
  fechaTareas!: Date;
  filteredStates!: Observable<UserSelect[]>;
  listUser: UserSelect[] = [];
  usuariosSeleccionados: UserSelect[] = [];
  stateCtrl = new FormControl('');
  mentions: string[] = [];

  constructor(private httpTaskServices: TaskService, private httpUserService: LoginServicesService, private httpStateService: StateService,
    private toastr: ToastrService, private datepipe: DatePipe, private httpUserServices: UsuariosService, 
    ){
    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hub/comment`)
      .build();
      
      this.connection.on('NotifyComment', comentario => {
        if(comentario.idTarea === this.idTaskSelect){
          comentario.descripcion = comentario.descripcion.replace(/\\n/g, '<br>');
          this.listaComentarios.push(comentario);
        }    
      });

      this.filteredStates = this.stateCtrl.valueChanges.pipe(
        startWith(''),
        map(state => (state ? this._filterStates(state) : this.listUser.slice())),
      );
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
      this.cargarTareasMencionadas(this.idUsuario);
      this.getUsuarios();
    }
  }

  cargarTareasUsuario(idUsuario: number){
    this.httpTaskServices.mostrarTareasPorUsuario(idUsuario).subscribe({
      next:(res:any) => {
        this.dataSource.data = res.data;
      },
    });
  }

  cargarTareasMencionadas(idUsuario: number){
    this.httpTaskServices.mostrarTareasMencionadas(idUsuario).subscribe({
      next:(res: any) => {
        this.dataSourceTaskColaborator.data = res.data
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

    const foundTask = this.dataSource.data.find(x => x.idTarea === this.idTaskSelect);
    if (foundTask) {
      this.tarea = foundTask;
      if (this.tarea.fechaFin) {
        this.tarea.fechaFin = new Date(this.tarea.fechaFin);
      }
    } else {
      this.tarea = {} as TaskByUser;
    }
    //console.log(this.tarea?.fechaFin);
    

    this.getStateByTask(this.idTaskSelect)
    this.getStates(); 
    this.cargarDescripcion(this.idTaskSelect);
    this.cargarComentarios(this.idTaskSelect);
    this.listarUsuariosMencionados(this.idTaskSelect);
    this.loader = true;
    
    setTimeout(() => {  
      this.loader = false;
    }, 1500);
  }

  onDateSelected(event: any){
    const selectedDate = event.value;
    let fecha = selectedDate.toISOString();

    
    this.httpTaskServices.cambiarFechaEntrega(this.idTaskSelect, fecha).subscribe({
      next:(res: any) => {
        if(res.success == true){
          this.showAlert(true, "Fecha cambiada con exito");
        }
      },
      error:(err) => {
        this.showAlert(false, "Error al cambiar fecha");
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

  listarUsuariosMencionados(idTarea: number){
    this.httpTaskServices.mostrarUsuariosMencionados(idTarea).subscribe({
      next: (res: any) => {
        this.usuariosSeleccionados = res.data;
        console.log(this.usuariosSeleccionados);
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
        
      },error: (err: any) => {
        console.log("Ocurrio un error");
      },
    })
  }

  dateFilter = (d: Date | null): boolean => {
    const today = new Date();
    return !d || d >= today; // Permitir solo fechas iguales o posteriores a hoy
  };

  handleTextareaInput() {
    // const mentionPattern = /@([\w]+)/g;  
    // const matches = this.comment.match(mentionPattern);
    
    // if(matches){
      
    //   this.getUsuarios();
    //   const searchTerm = matches[matches.length - 1].slice(1);
    //   console.log("searchTerm:", searchTerm);
    //   console.log("this.listUser:", this.listUser); 
    //   const filteredUsers = this.listUser.filter(user => user.nombresCompleto.toLowerCase().includes(searchTerm.toLowerCase()));
    //   this.filteredStates = of(filteredUsers);

    //   const usuarioSeleccionado = this.listUser.find(state => state.nombresCompleto.toLowerCase().includes(searchTerm.toLowerCase())) || '';
    //   //const textoAnterior = this.comment.substring(0, this.comment.lastIndexOf('@'));
    //   //console.log(usuarioSeleccionado);
      
      
    //   if (usuarioSeleccionado) {
    //     console.log("Dentro del if UsuarioSeleccionado");
        
    //     this.usuariosSeleccionados.push(usuarioSeleccionado);
    //     console.log(this.usuariosSeleccionados);
    //     const textoAnterior = this.comment.substring(0, this.comment.lastIndexOf('@'));      
    //     this.comment = textoAnterior + `@${usuarioSeleccionado.nombresCompleto} `;
  
    //   }
    // } else {
    //   this.listUser = [];
    //   this.filteredStates = of([]);
    // } 
  }

  onCommentChange(newValue: string){
    this.comment = newValue;
  }

  getUsuarios(){
    this.httpUserServices.getUsuarios().subscribe({
      next:(res:any) => {
        this.listUser = res.data
      },
    });
  }

  private _filterStates(value: string): UserSelect[] {
    const filterValue = value.toLowerCase();
    return this.listUser.filter(state => state.nombresCompleto.toLowerCase().includes(filterValue));
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files;
    this.archivos = this.selectedFile;
    this.archivoSeleccionado = event.target.files[0]; 
  }

  agregarUsuario(){
    const usuarioSeleccionado = this.listUser.find(state => state.nombresCompleto === this.stateCtrl.value);
    
    if (usuarioSeleccionado) {
      console.log(usuarioSeleccionado);

      let usrMencion: MencionarUsuario = {
        idTarea: this.idTaskSelect,
        idUsuarioMencionado: usuarioSeleccionado.idUsuario,
        idUsuarioMencion: Number(this.httpUserService.getUserId())
      };

      console.log(usrMencion);

      this.httpTaskServices.mencionarUsuario(usrMencion).subscribe({
        next:(res:any) => {
          if(res.success == true){
            this.showAlert(true, "Colaborador agregado correctamente");
            this.usuariosSeleccionados.push(usuarioSeleccionado);
            
          }
        },
        error:(err) => {
          this.showAlert(false, "Ha ocurrido un error al agregar al colaborador");
        },
      });
      
    }
    
    this.stateCtrl.setValue('');
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

  showAlert(isSuccess:boolean,mensaje:string){
    isSuccess === true ? this.toastr.success(`${mensaje}`,"",{
        timeOut: 2000,
        closeButton: true,
        progressBar: true,
        progressAnimation: 'decreasing',
        easing: 'ease-in',
        easeTime: 300
      } ): this.toastr.error(`${mensaje}`,"",{
      timeOut: 2000,
      closeButton: true,
      progressBar: true,
      progressAnimation: 'decreasing',
      easing: 'ease-in',
      easeTime: 300
    } )
  }
}
