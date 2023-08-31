import { Component, Input, OnInit } from '@angular/core';
import { ListarComentarios } from '../../models/models';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() comments: ListarComentarios[] = [];
  constructor(){

  }

  ngOnInit(): void {
    
  }
}
