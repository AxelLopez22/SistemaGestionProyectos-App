import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UsuariosService } from '../../services/usuarios.service';
import { AddUsuariosProyectComponent } from '../../shared/add-usuarios-proyect/add-usuarios-proyect.component';

@Component({
  selector: 'app-proyecto',
  templateUrl: './proyecto.component.html',
  styleUrls: ['./proyecto.component.scss']
})
export class ProyectoComponent implements OnInit {

  constructor(private dialog: MatDialog, private httpUserServices: UsuariosService){}

  ngOnInit(): void {

  }

  openModal() {
    const dialogRef: MatDialogRef<any> = this.dialog.open( AddUsuariosProyectComponent , {
      width: '750px',
      //height: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal cerrado', result);

    });
  }
}
