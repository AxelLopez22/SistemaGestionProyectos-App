import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateSubTask, CreateTask, Prioridades, UserSelect } from '../../models/models';
import { UsuariosService } from '../../services/usuarios.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AddSubtaskComponent } from '../add-subtask/add-subtask.component';
import { StateService } from '../../services/state.service';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { ProyectService } from '../../services/proyect.service';
import { ToastrService } from 'ngx-toastr';
import { LoginServicesService } from 'src/app/auth/services/login-services.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent implements OnInit {

  tareaForm!: FormGroup
  breakpoint!: number;
  listUser: UserSelect[] = [];
  prioridades: Prioridades[] = [];
  archivoSeleccionado: File | null = null;
  idProyecto!: number;
  subTask: CreateSubTask[] = [];
  archivos: any;
  progressBar: boolean = false;

  constructor(private fb: FormBuilder, private httpService: UsuariosService, private dialog: MatDialog, 
    private httpStateServices: StateService, private route: ActivatedRoute, private taskServices: TaskService,
    private httpProyectServices: ProyectService, private toastr: ToastrService, private loginServices: LoginServicesService,
    private dateAdapter: DateAdapter<Date>){
    this.tareaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaFin: [, Validators.required],
      idUsuario: Validators.required,
      idArchivo: [],
      idPrioridad: [0, Validators.required]
    });

    this.dateAdapter.setLocale('en-US');
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    //console.log(this.route.snapshot);
    
    if (idParam) {
      this.idProyecto = Number(idParam);
      //console.log(this.idProyecto);
    }
    this.breakpoint = (window.innerWidth <= 600) ? 3 : 6;
    this.getUserForSelect(this.idProyecto);
    this.GetPrioridades();
  }

  dateFilter = (d: Date | null): boolean => {
    const today = new Date();
    return !d || d >= today; // Permitir solo fechas iguales o posteriores a hoy
  };

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 600) ? 3 : 6;
  }

  getUserForSelect(idProyecto: number){
    this.httpProyectServices.getUserByProyect(idProyecto).subscribe({
       next:(res: any) => {
         this.listUser = res.data
       },
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    // Aquí puedes realizar operaciones con el archivo seleccionado, como subirlo a un servidor, leer su contenido, etc.
    console.log('Archivo seleccionado:', file);
  }

  GetPrioridades(){
    this.httpStateServices.getPrioridades().subscribe({
      next:(res: any) => {
        this.prioridades = res.data;
      },
    });
  }

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files.length > 0) {
      this.archivoSeleccionado = event.dataTransfer.files[0];
      console.log('Archivo seleccionado:', this.archivoSeleccionado);
    }
  }

  openModal() {
    const dialogRef: MatDialogRef<any> = this.dialog.open(AddSubtaskComponent, {
      width: '80%',
      height: '90vh',
      disableClose: false,
      data: {
        idProyecto: this.idProyecto
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.subTask = result;  
      console.log('Datos recibidos del modal:', this.subTask);
        // Aquí puedes trabajar con los datos recibidos del modal
    });
  }

  onSubmitTasks() {
    this.progressBar = true;
    let idArchivo = null;
    if(this.archivos != null){
      const formData = new FormData();
      formData.append('archivo', this.archivos);

      this.taskServices.AddFileTask(formData).subscribe({
        next:(res:any) => {
          idArchivo = res.data.IdArchivo
        },error:(err:any) => {
          console.log(err);
        },
      });

      let task: CreateTask = {
        nombre: this.tareaForm.get('nombre')?.value,
        descripcion: this.tareaForm.get('descripcion')?.value,
        fechaFin: this.tareaForm.get('fechaFin')?.value,
        idUsuario: this.tareaForm.get('idUsuario')?.value,
        idPrioridad: this.tareaForm.get('idPrioridad')?.value,
        idUsuarioCreador: Number(this.loginServices.getUserId()),
        idArchivo: idArchivo,
        idProyecto: this.idProyecto,
        subTareas: this.subTask
      }
    }

    let task: CreateTask = {
      nombre: this.tareaForm.get('nombre')?.value,
      descripcion: this.tareaForm.get('descripcion')?.value,
      fechaFin: this.tareaForm.get('fechaFin')?.value,
      idUsuario: this.tareaForm.get('idUsuario')?.value,
      idPrioridad: this.tareaForm.get('idPrioridad')?.value,
      idUsuarioCreador: Number(this.loginServices.getUserId()),
      //idArchivo: idArchivo,
      idProyecto: this.idProyecto,
      subTareas: this.subTask
    }

    let result = this.processData(task);

    this.taskServices.CreateTask(result).subscribe({
      next:(res: any) => {
        if(res.success === false){
          this.showAlert(false, "Ocurrio un error al guardar la tarea");
          this.progressBar = false;
        }

        if(res.success === true){
          this.showAlert(true, "Tarea creada con exito");
          this.progressBar = false;
          this.tareaForm.reset();
          this.subTask.splice(0, this.subTask.length);
        }
      },error:(err: any) => {
        this.showAlert(false, "Ocurrió un error, intentelo mas tarde");
        this.progressBar = false;
      },
    });
  }

  processData(task: any){
    let subTaskProcess: CreateSubTask[] = []
    task.subTareas.forEach((element: CreateSubTask) => {
      let newSubTask: CreateSubTask = {
        nombre: element.nombre,
        descripcion: element.descripcion,
        fechaFin: element.fechaFin,
        idUsuarioCreador: element.idUsuarioCreador,
        idProyecto: element.idProyecto,
        idArchivo: element.idArchivo,
        idPrioridad: element.idPrioridad.idPrioridad,
        idUsuario: element.idUsuario.idUsuario
      }

      subTaskProcess.push(newSubTask);
    });

    let dataToServer: CreateTask = {
      nombre: task.nombre,
      descripcion: task.descripcion,
      fechaFin: task.fechaFin,
      idUsuario: task.idUsuario.idUsuario,
      idPrioridad: task.idPrioridad.idPrioridad,
      idArchivo: task.idArchivo,
      idProyecto: task.idProyecto,
      idUsuarioCreador: task.idUsuarioCreador,
      subTareas: subTaskProcess
    }
    return dataToServer;
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
