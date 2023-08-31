import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login } from '../models/models';
import { LoginServicesService } from '../services/login-services.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  hide = true;
 
  
  
  constructor(private fb: FormBuilder, private route: Router, private httpService: LoginServicesService, private spinner: NgxSpinnerService,
    private toastr: ToastrService){
      

    this.loginForm = this.fb.group({
      email: fb.control('', [Validators.required]),
      password: fb.control('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15)
      ])
    });

    
  }

  ngOnInit(): void {
  }

  login(){
    let user:Login = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    }
    
    this.httpService.login(user).subscribe({
      next:(res: any) => {
        this.spinner.show();
        if(res.success === true){
          this.spinner.show();
          
          this.httpService.saveToken(res.data.token);
          //localStorage.setItem("user-info", JSON.stringify(user.));
          setTimeout(() => {
            this.spinner.hide();
            this.route.navigate(['panel/home']);
          }, 1500);
        }
      },
      error:(err) => {
        this.showAlert(false, err.mensaje)
      },
    });

  }

  showAlert(isSuccess:boolean,mensaje:string){
    isSuccess === true ? this.toastr.success(`${mensaje}`,"",{
        timeOut: 2000,
        closeButton: true,
        progressBar: true,
        progressAnimation: 'decreasing',
        easing: 'ease-in',
        easeTime: 300
      } ): this.toastr.error(`${mensaje}`,"",{
      timeOut: 2000,
      closeButton: true,
      progressBar: true,
      progressAnimation: 'decreasing',
      easing: 'ease-in',
      easeTime: 300
    } )
  }
}
