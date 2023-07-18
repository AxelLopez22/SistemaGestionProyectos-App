import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginServicesService } from '../services/login-services.service';

@Injectable({
  providedIn: 'root'
})
export class CheckAuthGuard implements CanActivate {

  constructor(private servicesLogin: LoginServicesService, private router: Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(!this.servicesLogin.isAuthenticated()){
        this.router.navigate(['auth']);
        return false;
      }
    return true;
  }

}
