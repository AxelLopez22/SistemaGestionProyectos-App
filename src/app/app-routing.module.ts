import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckAuthGuard } from './auth/guard/check-auth.guard';
import { LoginGuard } from './auth/guard/login.guard';

const routes: Routes = [
  {path:'', redirectTo: 'panel', pathMatch:'full'},
  {path:'panel', loadChildren: () => import('../app/panel/panel.module').then(x => x.PanelModule), canActivate: [CheckAuthGuard]},
  {path:'auth', loadChildren: () => import('../app/auth/auth.module').then(x => x.AuthModule), canActivate: [LoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
