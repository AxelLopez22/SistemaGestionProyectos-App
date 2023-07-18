import { Component, OnInit } from '@angular/core';
import { LoginServicesService } from 'src/app/auth/services/login-services.service';
import { ProyectService } from '../../services/proyect.service';
import { ProyectByUser } from '../../models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  fechaActual!: Date;
  nombreUsuario: string = '';
  foto: string = '';
  idUsuario!: number;
  proyectos: ProyectByUser[] = [];
  displayedColumns: string[] = ['nombre', 'descripcion', 'estado'];
  dataSource:ProyectByUser[] = []

  constructor(private httpServiceUser: LoginServicesService, private httpProyectService: ProyectService){
    let fecha = new Date();
    this.fechaActual = fecha;
    this.nombreUsuario = this.httpServiceUser.GetNameUser();
    this.foto = this.httpServiceUser.getImageLogin();
    this.idUsuario = this.httpServiceUser.getUserId();
  }

  ngOnInit(): void {
    this.GetProyect();
  }

  GetProyect(){
    this.httpProyectService.GetProyectByUser(this.idUsuario).subscribe({
      next:(res:any) => {
        this.proyectos = res.data;
        this.dataSource = this.proyectos
      },
    });
  }
}
