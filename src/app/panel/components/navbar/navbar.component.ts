import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoginServicesService } from 'src/app/auth/services/login-services.service';
import { CreateProyectComponent } from '../../shared/create-proyect/create-proyect.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Output() menuClicked = new EventEmitter<boolean>();
  username: string = "";
  foto: string = "";
  roles: string[] = [];
  constructor(private spinner:NgxSpinnerService, private httpService: LoginServicesService, private router:Router,
    private dialog: MatDialog){}

  ngOnInit(): void {
    this.username = this.httpService.GetUserLogin();
    this.foto = this.httpService.getImageLogin();
    this.roles = this.httpService.getRoles();
  }

  logout(){
    this.spinner.show();
    localStorage.removeItem('token');
    localStorage.removeItem('selectedTabIndex');
    setTimeout(() => {
      this.spinner.hide();
      this.httpService.logout();
      this.router.navigateByUrl("auth/login");
    }, 2000);
  }

  onSearchInputChange(event: Event) {
    //console.log(event.target);
  }

  shouldShowButton(): boolean {
    return this.roles.includes('Administrador') //|| this.roles.includes('Lider de Proyecto');
  }

  openModal() {
    const dialogRef: MatDialogRef<any> = this.dialog.open(CreateProyectComponent, {
      width: '750px',
      //height: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('Modal cerrado', result);

    });
  }


}
