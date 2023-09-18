import { Component, Input, OnInit } from '@angular/core';
import { ListarComentarios } from '../../models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() comments: ListarComentarios[] = [];
  constructor(private datePipe: DatePipe){

  }

  ngOnInit(): void {
    
  }

  formatDate(commentDate: any): string {
    // if (!(commentDate instanceof Date)) {
    //   console.log(commentDate);
    //   return '';
    // }
  
    const now = new Date();
    const diff = now.getTime() - new Date(commentDate).getTime();
  
    const minutes = Math.floor(diff / 60000); // Milisegundos a minutos
    const hours = Math.floor(minutes / 60); // Minutos a horas
    const days = Math.floor(hours / 24); // Horas a días
  
    if (minutes < 1) {
      return 'Hace un momento';
    } else if (minutes < 60) {
      return `Hace ${minutes === 1 ? '1 minuto' : `${minutes} minutos`}`;
    } else if (hours < 24) {
      return `Hace ${hours === 1 ? '1 hora' : `${hours} horas`}`;
    } else {
      return days === 1 ? 'Hace 1 día' : `Hace ${days} días`;
    }
  }
}
