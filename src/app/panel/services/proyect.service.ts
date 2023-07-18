import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CreateProyect } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ProyectService {

  readonly urlBase = environment.baseUrl;
  //urlBase = "https://localhost:7015/api/";

  constructor(private http: HttpClient) { }

  GetProyectByUser(IdUsuario: number){
    return this.http.get(this.urlBase + `Proyecto/getProyectsByUser/${IdUsuario}`);
  }

  CreateProyect(proyect: CreateProyect){
    return this.http.post(this.urlBase + 'Proyecto/crearProyecto', proyect);
  }
}
