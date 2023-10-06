import { Component, OnInit } from '@angular/core';
import { LoginServicesService } from 'src/app/auth/services/login-services.service';
import { ProyectService } from '../../services/proyect.service';
import { ProyectByUser, TareasEstados } from '../../models/models';
import { TaskService } from '../../services/task.service';
import { environment } from 'src/environments/environment';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

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
  displayedColumns: string[] = ['nombre', 'estado'];
  displayedColumnsTask: string[] = ['descripcion', 'fechaFin', 'prioridad']
  dataSource:ProyectByUser[] = []
  tareasProximas: TareasEstados[] = []
  tareasRetrasadas: TareasEstados[] = []
  tareasFinalizadas: TareasEstados[] = []
  cantTareasProximas!: number;
  cantTareasRetrasadas!: number;
  //cantTareasFinalizadas!: number;
  ids: string[] = [];
  cantTareasFin!: number | undefined
  readonly baseUrl = environment.baseUrlHub;
  private connection!: HubConnection;

  constructor(private httpServiceUser: LoginServicesService, private httpProyectService: ProyectService, 
    private httpTaskService:TaskService){
    
    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hub/group`)
      .build();

    this.connection.on("ConextionId", (idConection) => {
      let Conextion = idConection;
      //localStorage.setItem("IdConection", Conextion);
    })

    let fecha = new Date();
    this.fechaActual = fecha;
    this.nombreUsuario = this.httpServiceUser.GetNameUser();
    this.foto = this.httpServiceUser.getImageLogin();
    this.idUsuario = this.httpServiceUser.getUserId();
  }

  ngOnInit(): void {
    this.connection.start()
      .then(_ => {
        console.log('Connection Started');
      }).catch(error => {
        return console.error(error);
      });

    this.GetProyect();
    this.TareasProximas();
    this.TareasFinalizadas();
    this.TareasRetrasadas();


  }

  GetProyect(){
    this.httpProyectService.GetProyectByUser(this.idUsuario).subscribe({
      next:(res:any) => {
        this.proyectos = res.data;
        this.dataSource = this.proyectos
        setTimeout(() => {
          this.obtenerIdsProyect(this.proyectos);
        }, 3000);
        
      },
    });
    
    //
  }

  obtenerIdsProyect(proyectos: ProyectByUser[]){
    proyectos.forEach((element:ProyectByUser) => {
      this.ids.push(element.idProyecto.toString());
      this.connection.invoke('AgregarAlGrupo', element.idProyecto.toString(), this.idUsuario);
    });
  }

  TareasProximas(){
    this.httpTaskService.obtenerTareasProximas(this.idUsuario).subscribe({
      next:(res: any) => {
        if(res.success == true){
          this.tareasProximas = res.data;
          this.cantTareasProximas = this.tareasProximas.length;
        } else {
          this.tareasProximas = []
        }
      },
    });
  }

  TareasRetrasadas(){
    this.httpTaskService.obtenerTareasRetrasadas(this.idUsuario).subscribe({
      next: (res: any) => {
        if(res.success == true){
          this.tareasRetrasadas = res.data
          this.cantTareasRetrasadas = this.tareasRetrasadas.length;
        } else {
          this.tareasRetrasadas = []
        }
      },
    });
  }

  TareasFinalizadas(){
    this.httpTaskService.obtenerTareasFinalizadas(this.idUsuario).subscribe({
      next:(res: any) => {
        if(res.success == true){
          this.tareasFinalizadas = res.data
          this.cantTareasFin = this.tareasFinalizadas.length

          
        } else {
          this.tareasFinalizadas = []
          this.cantTareasFin = 0
        }
      },
    });
  }
}
