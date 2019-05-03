import { AccessService } from './access/service/access.service';
import { ResourceComponent } from './resource/resource.component';
import { AdminRoutingModule } from './admin-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './../../shared/material.module';
import { AccessComponent } from './access/access.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    AdminRoutingModule
  ],
  declarations: [
    AccessComponent,
    ResourceComponent
  ],
  providers: [
    AccessService
  ]
})
export class AdminModule { }
