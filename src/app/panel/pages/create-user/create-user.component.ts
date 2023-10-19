import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListaRoles, asignarRol, createUser } from '../../models/models';
import { UsuariosService } from '../../services/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  usuarioForm!: FormGroup
  breakpoint!: number;
  archivoSeleccionado: File | null = null;
  listaRoles: ListaRoles[] = [];
  archivos: any;
  progressBar: boolean = false;

  constructor(private fb: FormBuilder, private httpUserServices: UsuariosService, private toastr: ToastrService, private route: Router){
    this.usuarioForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.email, Validators.required]],
      contrasenia: ['', Validators.required],
      foto: [],
      idRol: [0 ,Validators.required]
    });
  }

  ngOnInit(): void {
    this.listarRoles();
    this.breakpoint = (window.innerWidth <= 600) ? 3 : 6;
    
  }

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 600) ? 3 : 6;
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    // Aquí puedes realizar operaciones con el archivo seleccionado, como subirlo a un servidor, leer su contenido, etc.
    console.log('Archivo seleccionado:', file);
    this.archivoSeleccionado = file;
  }

  listarRoles(){
    this.httpUserServices.getRoles().subscribe({
      next:(res: any) => {
        this.listaRoles = res.data
      },
    });
  }

  CrearUsuario(){

    this.progressBar = true;

    const formData = new FormData();
    formData.append('Nombres', this.usuarioForm.get("nombres")?.value);
    formData.append('Apellidos', this.usuarioForm.get("apellidos")?.value);
    formData.append('Correo', this.usuarioForm.get("correo")?.value);
    formData.append('Contrasenia', this.usuarioForm.get("contrasenia")?.value)
    formData.append('Foto', this.archivoSeleccionado!)


    console.log(formData);
    

    this.httpUserServices.crearUsuario(formData).subscribe({
      next:(res: any) => {
        if(res.success === true){

          const userRol: asignarRol = {
            idRol: this.usuarioForm.get('idRol')?.value,
            idUsuario: res.data
          }
          console.log(userRol);
          

          this.httpUserServices.asignarRol(userRol).subscribe({
            next:(res: any) => {
              if(res.success === true){
                setTimeout(() => {
                  this.showAlert(true, "Usuario creado con exito");
                  this.progressBar = false;
                  this.route.navigate(['panel/home']);
                }, 1000);
              }
            },
            error:(err: any) => {
              this.showAlert(false, "Ocurrio un error al asignar el rol al usuario");

              console.log(err);
              
            },
          });
        }
      },
      error:(err: any) => {
        this.showAlert(false, "Ocurrio un error al crear el usuario");
        console.log(err);

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
