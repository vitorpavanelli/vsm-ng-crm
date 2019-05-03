import { RoutesService } from './routes.service';
import { Router } from '@angular/router';
import { SnackBarService } from './../core/service/snackbar.service';
import { AuthService } from './../core/auth/service/auth.service';
import { LoaderService } from '../core/loader/service/loader.service';
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpHeaders,
  HttpXsrfTokenExtractor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiInterceptorService implements HttpInterceptor {

  constructor(private _loaderService: LoaderService, private _authService: AuthService,
    private _tokenExtractor: HttpXsrfTokenExtractor, private _snackBarService: SnackBarService, private _router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this._authService.getToken();

    let cloned: HttpRequest<any> = null;

    if (token) {
      let header: HttpHeaders;
      if (this._tokenExtractor.getToken() as string) {
        header = new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token,
          'X-XSRF-TOKEN': this._tokenExtractor.getToken() as string
        });

      } else {
        header = new HttpHeaders({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token
        });
      }

      cloned = req.clone({
         headers: header
       });

    } else {
      const header = new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      });

      cloned = req.clone({
         headers: header
       });
    }

    this._loaderService.show();

    return next.handle(cloned).pipe(tap(
      (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            const refreshedToken = event.headers.get('Authorization');
            if (refreshedToken) {
              this._authService.storeToken(refreshedToken);
            }

            if (event.status === 403) {
              this._snackBarService.notifyAll('Access Denied');
              if (event.url.indexOf('/login') === -1) {
                if (refreshedToken) {
                  this._router.navigate([`/${RoutesService._ROUTES.dashboard.resource}`]);

                } else {
                  this._authService.logout();
                  this._router.navigate([`/${RoutesService._ROUTES.login.resource}`]);
                }
              }

            } else if (event.status === 0) {
              this._snackBarService.notifyAll('Error contacting server. Please, open a Helpdesk ticket.');
              if (event.url.indexOf('/login') === -1) {
                this._router.navigate([`/${RoutesService._ROUTES.dashboard.resource}`]);
              }
            }

            this._loaderService.hide();
          }
        },
        (err: HttpErrorResponse) => {
          const refreshedToken = err.headers.get('Authorization');
          if (refreshedToken) {
            this._authService.storeToken(refreshedToken);
          }

          if (err.status === 403) {
            this._snackBarService.notifyAll('Access Denied');

          } else if (err.status === 0) {
            this._snackBarService.notifyAll('Error contacting server. Please, open a Helpdesk ticket.');

          } else {
            this._snackBarService.notifyAll(err.statusText);
          }

          if (err.url.indexOf('/login') === -1) {
            if (refreshedToken) {
              this._router.navigate([`/${RoutesService._ROUTES.dashboard.resource}`]);

            } else {
              this._authService.logout();
              this._router.navigate([`/${RoutesService._ROUTES.login.resource}`]);
            }
          }

          this._loaderService.hide();
        }
    ));
  }
}
