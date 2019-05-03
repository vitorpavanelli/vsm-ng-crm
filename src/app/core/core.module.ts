import { ReactiveFormsModule } from '@angular/forms';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './auth/login.component';
import { ResourceService } from './admin/resource/service/resource.service';
import { ApiInterceptorService } from '../shared/api.interceptor';
import { LoaderComponent } from './loader/loader.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppRoutingModule } from './../app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClientXsrfModule } from '@angular/common/http';
import { MaterialModule } from './../shared/material.module';
import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponent } from './core.component';
import { CustomErrorHandler } from './error/custom-error.handler';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    // HttpClientXsrfModule.withOptions({
    //   cookieName: 'XSRF-TOKEN',
    //   headerName: 'X-XSRF-TOKEN'
    // }),
    BrowserAnimationsModule,
    MaterialModule,
    AppRoutingModule
  ],
  declarations: [
    CoreComponent,
    LoaderComponent,
    LoginComponent,
    NotFoundComponent,
    DashboardComponent
  ],
  exports: [
    CoreComponent
  ],
  providers: [
    ResourceService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptorService,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandler
    }
  ]
})
export class CoreModule { }
