import { LoginGuard } from './core/auth/service/login-guard.service';
import { AuthGuard } from './core/auth/service/auth-guard.service';
import { RoutesService } from './shared/routes.service';

import { DashboardComponent } from './core/dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './core/auth/login.component';
import { NotFoundComponent } from './core/not-found/not-found.component';

const routes: Routes = [
  {
    path: RoutesService._ROUTES.dashboard.resource,
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: RoutesService._ROUTES.crm.resource,
    loadChildren: './views/crm/crm.module#CrmModule',
    canLoad: [AuthGuard],
    canActivateChild: [AuthGuard]
  },
  {
    path: RoutesService._ROUTES.admin.resource,
    loadChildren: './core/admin/admin.module#AdminModule',
    canLoad: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: {'ROLE': 'ROLE_ADMIN'}
  },
  {
    path: RoutesService._ROUTES.login.resource,
    component: LoginComponent,
    canActivate: [LoginGuard]
  },
  {
    path: '',
    redirectTo: `/${RoutesService._ROUTES.dashboard.resource}`,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
