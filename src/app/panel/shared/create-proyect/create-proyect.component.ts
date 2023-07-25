import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { CreateProyect, UserSelect } from '../../models/models';
import { ToastrService } from 'ngx-toastr';
import { ProyectService } from '../../services/proyect.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-proyect',
  templateUrl: './create-proyect.component.html',
  styleUrls: ['./create-proyect.component.scss']
})
export class CreateProyectComponent implements OnInit{

  listUser: UserSelect[] = [];
  createProyectForm!: FormGroup

  constructor(private fb: FormBuilder, private httpService: UsuariosService, private toastr: ToastrService,
    private httpProyectService: ProyectService, private router: Router){
    this.createProyectForm = fb.group({
      Nombre: ['',[Validators.required]],
      Descripcion: ['', [Validators.required]],
      FechaFin: [''],
      IdUsuario: [0,[Validators.required]]
    });
  }

  ngOnInit(): void {
    this.getUserForSelect()
  }

  getUserForSelect(){
    this.httpService.getUsuarios().subscribe({
       next:(res: any) => {
         this.listUser = res.data
       },
    });
  }

  createProyect(){
    let element: CreateProyect = {
      nombre: this.createProyectForm.get('Nombre')?.value,
      descripcion: this.createProyectForm.get('Descripcion')?.value,
      fechaFin: this.createProyectForm.get('FechaFin')?.value,
      idUsuario: this.createProyectForm.get('IdUsuario')?.value.idUsuario
    }

    this.httpProyectService.CreateProyect(element).subscribe({
      next:(res:any) => {
        if(res.success === true){
          this.showAlert(true, res.message);
          this.router.navigate(['panel/home']);
        } else {
          this.showAlert(false, res.message);
        }
      },error:(err:any) => {
        this.showAlert(false, err.message);
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
