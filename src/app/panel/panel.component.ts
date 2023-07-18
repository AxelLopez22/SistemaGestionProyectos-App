import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {

  breakpoint!: boolean;

  constructor(){
    this.breakpoint = (window.innerWidth <= 1000) ? true : false;
  }

  ngOnInit(): void {

  }

  onResize(event: any) {
    this.breakpoint = (event.target.innerWidth <= 1000) ? true : false;
  }
}
