import { SnackBarService } from './service/snackbar.service';
import { RoutesService } from './../shared/routes.service';

import { AuthHandler } from './auth/service/auth-handler.service';
import { AuthService, AuthenticatedUser } from './auth/service/auth.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ResourceModel } from './admin/resource/service/resource.service';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSidenav } from '@angular/material';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss']
})
export class CoreComponent implements OnInit, OnDestroy {

  @ViewChild('sidenav')
  private _sidenav: MatSidenav;

  private _subscription: Subscription;
  private _snackBarSubscription: Subscription;
  private _resourceItems: ResourceModel[];
  private _MENU_ITEMS_CONTROLLER = new Object();
  
  selectedMenu: Object;
  authenticatedUser: AuthenticatedUser;

  constructor(private _router: Router, private _authService: AuthService,
    private _authHandler: AuthHandler, private _snackbar: MatSnackBar, private _snackBarService: SnackBarService) {

  }

  ngOnInit() {
    this._subscription = this._authHandler.onAuthenticationSuccess().subscribe(() => {
        this._authService.authenticatedUser().subscribe(response => {
          this.authenticatedUser = response.user;
          this._loadData(response.resources);
        });
      }
    );

    this._snackBarSubscription = this._snackBarService.onMessageReceived().subscribe(message => {
      this._openSnackBar(message);
    });

    if (this._authService.isAuthenticated()) {
      this._authHandler.notifyAll();
    }
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }

    if (this._snackBarSubscription) {
      this._snackBarSubscription.unsubscribe();
    }
  }

  private _openSnackBar(message: string) {
    this._snackbar.open(message, 'DISMISS', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }

  private _loadData(data: ResourceModel[]) {
    if (data) {
      this._resourceItems = data;
      for (const item of  this._resourceItems) {
        if (item.resources) {
          for (const menu of item.resources) {
            if (!!menu.resources && menu.resources.length > 0) {
              this._MENU_ITEMS_CONTROLLER[menu.path] = true;
            }
          }
        }
      }

      this.selectedMenu = this._MENU_ITEMS_CONTROLLER;
    }
  }

  onNestedMenuClick(selectedRoute: string) {
    this.selectedMenu[selectedRoute] = !this.selectedMenu[selectedRoute];
  }

  isOpenMenu(selectedRoute: string): boolean {
    return this.selectedMenu[selectedRoute];
  }

  menuItems() {
    return this._resourceItems;
  }

  isRoute(route: string) {
    return (this._router.url.indexOf(route) !== -1);
  }

  hasSubMenu(item: ResourceModel): boolean {
    return !!item.resources;
  }

  isAuthenticated(): boolean {
    return this._authService.isAuthenticated();
  }

  onLogout() {
    if (this._sidenav.opened) {
      this._sidenav.close();
    }

    this._authService.logout();
    this._router.navigate([RoutesService._ROUTES.login.resource]);
  }
}
