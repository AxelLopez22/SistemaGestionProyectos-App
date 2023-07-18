import { Component, OnInit } from '@angular/core';
import { Observable, map, startWith } from 'rxjs';
import { UserSelect } from '../../models/models';
import { FormControl, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-add-usuarios-proyect',
  templateUrl: './add-usuarios-proyect.component.html',
  styleUrls: ['./add-usuarios-proyect.component.scss']
})
export class AddUsuariosProyectComponent implements OnInit {

  stateCtrl = new FormControl('');
  filteredStates!: Observable<UserSelect[]>;
  listUser: UserSelect[] = [];

  constructor(private httpUserServices: UsuariosService){
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map(state => (state ? this._filterStates(state) : this.listUser.slice())),
    );
  }

  ngOnInit(): void {
    this.getUsuarios();
  }

  getUsuarios(){
    this.httpUserServices.getUsuarios().subscribe({
      next:(res:any) => {
        this.listUser = res.data
      },
    });
  }

  private _filterStates(value: string): UserSelect[] {
    const filterValue = value.toLowerCase();
    return this.listUser.filter(state => state.nombresCompleto.toLowerCase().includes(filterValue));
  }
}
