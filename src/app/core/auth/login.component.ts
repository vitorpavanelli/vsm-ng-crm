import { SnackBarService } from './../service/snackbar.service';
import { AuthHandler } from './service/auth-handler.service';
import { RoutesService } from 'src/app/shared/routes.service';
import { Router } from '@angular/router';
import { AuthService } from './service/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  hidePassword = true;
  form: FormGroup;

  constructor(private _authService: AuthService, private _fb: FormBuilder,
    private _route: Router, private _authHandler: AuthHandler, private _snackBarService: SnackBarService) { }

  ngOnInit() {
    this.form = this._fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.isLoading = true;
    this._authService.authenticate(this.form.value.login, this.form.value.password).subscribe(
      (response: HttpResponse<any>) => {
        const token = response.headers.get('Authorization');
        if (token) {
          this._authService.storeToken(token);
          this._authHandler.notifyAll();
          this._route.navigate([`/${RoutesService._ROUTES.dashboard.resource}`]);

        } else {
          this._snackBarService.notifyAll('Authentication provided failed!');
        }

        this.isLoading = false;
      },
      error => {
        if (error.status === 403) {
          this._snackBarService.notifyAll('Authentication provided failed!');

        } else {
          this._snackBarService.notifyAll('Authentication service failed. Please, open a Helpdesk ticket.');
        }

        this.isLoading = false;
      }
    );
  }
}
