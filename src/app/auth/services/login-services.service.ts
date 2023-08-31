import { Injectable } from '@angular/core';
import { Login } from '../models/models';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginServicesService {

  readonly baseUrl = environment.baseUrl
  //baseUrl: string = "https://localhost:7015/api/";

  constructor(private http: HttpClient, private jwt: JwtHelperService) { }

  logout():void{
    localStorage.removeItem('user-info')
  }

  GetUserLogin(){
    let token = this.jwt.decodeToken();
    let user = token.Nombre;
    return user;
  }

  getRoles(){
    let token = this.jwt.decodeToken();
    let roles = token.Rol;

    return roles;
  }

  GetNameUser(){
    let token = this.jwt.decodeToken();
    let user = token.Nombre + ' ' + token.Apellidos;
    return user;
  }

  getImageLogin(){
    let token = this.jwt.decodeToken();
    let img = token.foto;
    return img;
  }

  getUserId(){
    let token = this.jwt.decodeToken();
    let Id = token.IdUsuario;
    return Id;
  }

  login(user: Login){
    return this.http.post(this.baseUrl + 'Login', user);
  }

  saveToken(token:string):void{
    localStorage.setItem('token', token)
  }

  isAuthenticated():boolean{
    // @ts-ignore
    return localStorage.getItem('token');
  }

  getUsernameAuthenticated():string{
    const user_info = JSON.parse( localStorage.getItem('user-info') || '{}' );
    return user_info;
  }
}
