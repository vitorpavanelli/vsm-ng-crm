import { Access } from './../../admin/access/service/access.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanLoad,
  Route,
  UrlSegment,
  CanActivateChild
} from '@angular/router';
import { RoutesService } from 'src/app/shared/routes.service';
import { SnackBarService } from '../../service/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(private _authService: AuthService, private _router: Router, private _snackBarService: SnackBarService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this._authService.isAuthenticated()) {
      return this._checkAccess(state.url, false, (next.data ? next.data['ROLE'] : ''));
    }

    this._router.navigate([`/${RoutesService._ROUTES.login.resource}`]);
    return false;
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    if (this._authService.isAuthenticated()) {
      return this._checkAccess(`/${route.path}`, true, (route.data ? route.data['ROLE'] : ''));
    }

    this._router.navigate([`/${RoutesService._ROUTES.login.resource}`]);
    return false;
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }

  private _checkAccess(path: string, canLoad: boolean, role?: string): Observable<boolean> {
    return this._authService.authenticatedUser().pipe(
      map(authenticateduser => {
        if (`/${RoutesService._ROUTES.dashboard.resource}` === path) {
          return true;
        }

        if (authenticateduser.user.admin) {
          return true;
        }

        if (role === 'ROLE_ADMIN' && authenticateduser.user.admin) {
          return true;
        }

        // new users will problably have no accesses so we need to check
        if (authenticateduser.user.accesses) {
          let resource: Access;
          if (canLoad) {
            resource = authenticateduser.user.accesses.find(access => {
              return access.resource.path.indexOf(path) !== -1;
            });

         } else {
            resource = authenticateduser.user.accesses.find(access => {
              return `${access.resource.path}` === path;
            });
        }

          if (resource === undefined) {
            this._snackBarService.notifyAll('Access Denied');
            this._router.navigate([`/${RoutesService._ROUTES.dashboard.resource}`]);
            return false;
          }

          return true;
        }

        this._snackBarService.notifyAll('Access Denied');
        this._router.navigate([`/${RoutesService._ROUTES.dashboard.resource}`]);
        return false;
      })
    );
  }
}
