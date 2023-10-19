export interface sidaNav{
  icon: string,
  route: string,
  label: string
}

export interface projectSideNav{
  idProyecto: number,
  nombre: string,
  descripcion: string
}

export interface UserSelect{
  idUsuario: number,
  nombresCompleto: string,
  foto: string
}

export interface CreateProyect{
  nombre: string,
  descripcion: string,
  fechaFin: Date,
  idUsuario: number
}

export interface ProyectByUser{
  idProyecto: number,
  nombre: string,
  descripcion: string,
  estado: boolean
}

export interface ProyectUser{
  idProyecto: number,
  nombre: string,
  descripcion: string,
  estado: string
}

export interface AddUserProyect{
  idproyecto: number,
  idUsuario: number[]
}

export interface UserLeaderProyect{
  idUsuario: number,
  nombresCompleto: string | undefined
}

export interface Estados{
  idEstado: number,
  nombre: string
}

export interface Task {
  idTarea: number;
  nombre: string;
  descripcion: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  estado?: string;
  idTareaPadre?: number | undefined;
  responsable: string;
  urlArchivo?: string;
  prioridad?: string;
  subTareas: Task[];
}

export interface Prioridades{
  idPrioridad: number,
  nombre: string
}

export interface CreateSubTask{
  nombre: string,
  descripcion: string,
  fechaFin: Date,
  idProyecto: number,
  idUsuario: any,
  idPrioridad: any,
  idUsuarioCreador: number,
  idArchivo?: number | null
}

export interface CreateTask{
  nombre: string,
  descripcion: string,
  fechaFin: Date,
  idProyecto: number,
  idUsuario: number,
  idPrioridad: number,
  idUsuarioCreador: number,
  idArchivo?: number | null,
  subTareas: CreateSubTask[]
}

export interface AgregarComentario{
  descripcion: string,
  idUsuario: number,
  idTarea: number,
  idArchivo?: number | null
}

export interface ListarComentarios{
  idComentario: number,
  descripcion: string,
  usuario: string,
  foto: string,
  fecha: Date,
  idTarea: number
}

export interface TareasEstados{
  idTarea: number,
  descripcion: string,
  fechaFin: Date,
  prioridad: string
}

export interface UpdateStateTask{
  idTarea: number,
  idUsuario: number,
  idEstado: number
}

export interface TaskFilter {
  searchText: string;
}

export interface TaskHistory{
  usuario: string,
  estados: string,
  fecha: Date
}

export interface TaskState{
  idTarea: number,
  tarea: string,
  fechaEntrega: Date,
  prioridad: string,
  encargado: string,
  foto: string,
  idEstado: number
}

export interface TaskByUser{
  idTarea: number,
  nombre: string,
  estado: string,
  prioridad: string,
  fechaFin: Date
}

export interface MencionarUsuario {
  idTarea: number,
  idUsuarioMencionado: number,
  idUsuarioMencion: number
}

export interface ListaRoles{
  idRol: number,
  nombre: string
}

export interface createUser {
  Nombres: string,
  Apellidos: string,
  Correo: string,
  Contrasenia: string,
  foto: File
}

export interface asignarRol{
  idRol: number,
  idUsuario: number
}