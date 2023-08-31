import { Component, Input, OnInit } from '@angular/core';
import { Task } from '../../models/models';

@Component({
  selector: 'app-subtasks',
  templateUrl: './subtasks.component.html',
  styleUrls: ['./subtasks.component.scss']
})
export class SubtasksComponent implements OnInit{

  @Input() subTask: Task[] = [];
  
  displayedColumns: string[] = ['descripcion', 'fechaEntrega', 'estado', 'prioridad', 'responsable'];
  constructor(){}

  ngOnInit(): void {
  }
}
