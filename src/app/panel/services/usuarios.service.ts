import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AddUserProyect } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  readonly UrlBase = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getUsuarios(){
    return this.http.get(this.UrlBase + 'Usuarios/obtenerUsuarios')
  }
}
