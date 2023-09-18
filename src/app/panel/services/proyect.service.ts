import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AddUserProyect, CreateProyect } from '../models/models';
import { environment } from 'src/environments/environment';

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

  GetProyectById(IdProyecto: number){
    return this.http.get(this.urlBase + `Proyecto/getProyectById/${IdProyecto}`);
  }

  agregarUsuarios(usuarios: AddUserProyect){
    return this.http.post(this.urlBase + 'ProyectoUsuarios/agregarUsuarios', usuarios);
  }

  getUserByProyect(IdProyect: number){
    return this.http.get(this.urlBase + `Proyecto/getUserByProyect/${IdProyect}`);
  }

  getLeaderProyect(IdProyect: number){
    return this.http.get(this.urlBase + `Proyecto/getLeaderProyect/${IdProyect}`);
  }

  updateStateProyect(IdProyect: number, IdState: number){
    return this.http.put(this.urlBase + `Proyecto/updateStateProyect/${IdProyect}/${IdState}`,{});
  }

  deleteUserToProyect(IdProyect: number, IdUsuario: number){
    return this.http.delete(this.urlBase + `ProyectoUsuarios/eliminarUsuarioProyecto/${IdProyect}/${IdUsuario}`);
  }
}
