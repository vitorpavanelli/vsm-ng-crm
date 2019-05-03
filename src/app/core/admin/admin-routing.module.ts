import { ResourceComponent } from './resource/resource.component';
import { RoutesService } from '../../shared/routes.service';
import { AccessComponent } from './access/access.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

const _ROUTES = RoutesService._ROUTES;

const routes: Routes = [
    { path: '', children: [
        { path: `${_ROUTES.admin.access.resource}`, component: AccessComponent },
        { path: `${_ROUTES.admin.menu.resource}`, component: ResourceComponent }
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
