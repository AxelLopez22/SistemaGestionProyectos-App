import { Component, OnInit } from '@angular/core';
import { sidenavdata } from '../../models/dataSideNav';
import { projectSideNav } from '../../models/models';
import { ProyectService } from '../../services/proyect.service';
import { LoginServicesService } from 'src/app/auth/services/login-services.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  sideNavContent = sidenavdata
  proyectos: projectSideNav[] = [];
  usuarioId!: number;
  constructor(private httpService: ProyectService, private userService: LoginServicesService){}

  ngOnInit(): void {
    this.sideNavContent = sidenavdata
    this.usuarioId = this.userService.getUserId();
    this.getProyects(this.usuarioId);

  }

  getProyects(IdUsuario: number){
    this.httpService.GetProyectByUser(IdUsuario).subscribe({
      next:(res: any) => {
        this.proyectos = res.data;
      },
      error:(err) => {

      },
    });
  }
}
