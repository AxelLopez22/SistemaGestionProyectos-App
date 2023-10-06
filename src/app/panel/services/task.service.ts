import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AgregarComentario, CreateSubTask, CreateTask, UpdateStateTask } from '../models/models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  readonly urlBase = environment.baseUrl;
  
  constructor(private http: HttpClient) { }

  getTaskByProyect(IdProyect: number){
    return this.http.get(this.urlBase + `Tareas/obtenerTareasByProyect/${IdProyect}`);
  }

  AddFileTask(file: FormData){
    return this.http.post(this.urlBase + 'Tareas/guardarArchivoTarea', file);
  }

  CreateTask(tasks:CreateTask){
    return this.http.post(this.urlBase + 'Tareas/crearTarea', tasks);
  }

  getTaskById(idProyect: number, idTarea: number){
    return this.http.get(this.urlBase + `Tareas/obtenerTareasById/${idProyect}/${idTarea}`);
  }

  obtenerEncargadoTarea(idTarea: number){
    return this.http.get(this.urlBase + `Tareas/obtenerEncargadoTarea/${idTarea}`);
  }

  agregarComentario(comentario: AgregarComentario){
    return this.http.post(this.urlBase + 'Comentarios/agregarComentario', comentario);
  }

  obtenerComentarios(idTarea: number){
    return this.http.get(this.urlBase + `Comentarios/${idTarea}`);
  }

  obtenerTareasProximas(idUsuario: number){
    return this.http.get(this.urlBase + `Tareas/tareasProximasEntregar/${idUsuario}`);
  }

  obtenerTareasFinalizadas(idUsuario: number){
    return this.http.get(this.urlBase + `Tareas/tareasFinalizadas/${idUsuario}`);
  }

  obtenerTareasRetrasadas(idUsuario: number){
    return this.http.get(this.urlBase + `Tareas/tareasRetrasadas/${idUsuario}`);
  }

  updateStateTask(model: UpdateStateTask){
    return this.http.put(this.urlBase + 'Tareas/cambiarEstadoTarea', model);
  }

  agregarSubTareas(idTarea: number, subTareas: CreateSubTask[]){
    return this.http.post(this.urlBase + `Tareas/agregarSubTareas/${idTarea}`, subTareas);
  }

  validarEstadoTarea(idTarea: number){
    return this.http.post(this.urlBase + `Tareas/validarTarea/${idTarea}`,{});
  }

  mostrarTareasPorEstado(idProyecto: number){
    return this.http.get(this.urlBase + `Tareas/tareasPorEstados/${idProyecto}`);
  }

  mostrarTareasPorUsuario(idUsuario:number){
    return this.http.get(this.urlBase + `Tareas/tareasPorUsuario/${idUsuario}`);
  }

  obtenerDescripcionTarea(idTarea: number){
    return this.http.get(this.urlBase + `Tareas/descripcionTarea/${idTarea}`);
  }
}
