import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddUserProyect, asignarRol, createUser } from '../models/models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  readonly UrlBase = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getUsuarios(){
    return this.http.get(this.UrlBase + 'Usuarios/obtenerUsuarios')
  }

  getRoles(){
    return this.http.get(this.UrlBase + 'Usuarios/ListarRoles');
  }

  crearUsuario(user: FormData){
    return this.http.post(this.UrlBase + 'Login/createUser', user);
  }

  asignarRol(user: asignarRol){
    return this.http.post(this.UrlBase + 'Usuarios/asignarRol', user);
  }
}
