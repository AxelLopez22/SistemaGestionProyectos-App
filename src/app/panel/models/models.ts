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
