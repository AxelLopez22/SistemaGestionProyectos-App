import { Component, OnInit, Inject, EventEmitter, Output  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateSubTask, Prioridades, UserSelect } from '../../models/models';
import { UsuariosService } from '../../services/usuarios.service';
import { StateService } from '../../services/state.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import { ProyectService } from '../../services/proyect.service';

@Component({
  selector: 'app-add-subtask',
  templateUrl: './add-subtask.component.html',
  styleUrls: ['./add-subtask.component.scss']
})
export class AddSubtaskComponent implements OnInit {

  tareaForm!: FormGroup
  breakpoint!: number;
  listUser: UserSelect[] = [];
  prioridades: Prioridades[] = [];
  archivoSeleccionado: File | null = null;
  subTask: CreateSubTask[] = [];
  idProyecto!: number;
  inputData: any;
  archivos: any;

  @Output() subTareas = new EventEmitter<CreateSubTask[]>();

  constructor(private fb: FormBuilder, private httpService: UsuariosService, private httpStateServices: StateService,
    private route: ActivatedRoute, public dialogRef: MatDialogRef<AddSubtaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private taskServices: TaskService, private httpProyectService: ProyectService){
    this.tareaForm = this.fb.group({
      nombre: '',
      descripcion: ['', Validators.required],
      fechaFin: [, Validators.required],
      idUsuario: Validators.required,
      idArchivo: [],
      idPrioridad: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.idProyecto) {
      this.idProyecto = this.data.idProyecto;
      //console.log(this.data.idProyecto);
    }
    this.breakpoint = (window.innerWidth <= 600) ? 3 : 6;
    this.getUserForSelect(this.idProyecto);
    this.GetPrioridades();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 600) ? 3 : 6;
  }

  getUserForSelect(idProyecto: number){
    this.httpProyectService.getUserByProyect(idProyecto).subscribe({
       next:(res: any) => {
         this.listUser = res.data
       },
    });
  }

  GetPrioridades(){
    this.httpStateServices.getPrioridades().subscribe({
      next:(res: any) => {
        this.prioridades = res.data;
      },
    });
  }

  AddSubTask(){

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

      let subTask: CreateSubTask = {
        nombre: this.tareaForm.get('nombre')?.value,
        descripcion: this.tareaForm.get('descripcion')?.value,
        fechaFin: this.tareaForm.get('fechaFin')?.value,
        idUsuario: this.tareaForm.get('idUsuario')?.value,
        idPrioridad: this.tareaForm.get('idPrioridad')?.value,
        idArchivo: idArchivo,
        idProyecto: this.idProyecto
      }
      this.subTask.push(subTask);
    }

    let subTask: CreateSubTask = {
      nombre: this.tareaForm.get('nombre')?.value,
      descripcion: this.tareaForm.get('descripcion')?.value,
      fechaFin: this.tareaForm.get('fechaFin')?.value,
      idUsuario: this.tareaForm.get('idUsuario')?.value,
      idPrioridad: this.tareaForm.get('idPrioridad')?.value,
      //idArchivo: 0,
      idProyecto: this.idProyecto
    }

    this.subTask.push(subTask);

    this.tareaForm.reset();
  }
  
  closeDialog() {
    this.dialogRef.close();
  }

  onFileSelected(event: any) {
    //const file: File = event.target.files[0];
    this.archivos = event.target.files[0];
    this.archivoSeleccionado = event.dataTransfer.files[0];
    console.log('Archivo seleccionado:', this.archivos);
  }

  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files.length > 0) {
      this.archivos = event.dataTransfer.files[0];
      this.archivoSeleccionado = event.dataTransfer.files[0];
      console.log('Archivo seleccionado:', this.archivos);
    }
  }
}
