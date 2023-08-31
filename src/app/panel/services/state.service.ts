import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  readonly UrlBase = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getStates(){
    return this.http.get(this.UrlBase + 'Estado/getState');
  }

  getStateByProyect(IdProyecto: number){
    return this.http.get(this.UrlBase + `Estado/getStateByProyect/${IdProyecto}`);
  }

  getPrioridades(){
    return this.http.get(this.UrlBase + 'Prioridades/listarPrioridades');
  }

  getStateByTask(IdTask: number){
    return this.http.get(this.UrlBase + `Estado/getStateByTask/${IdTask}`);
  }
}
