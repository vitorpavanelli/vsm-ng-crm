import { map, share, shareReplay, tap } from 'rxjs/operators';
import { AuthenticatedUserResponse } from './../core/auth/service/auth.service';
import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface HttpResponseMessage {
  message: string;
  userId: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService<T> {
  static _LOCALHOST = 'http://localhost';
  static _REMOTE = '';

  options = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  findAll(resource: string, filter?: any): Observable<T[]> {
    if (filter) {
      return this.http.post<T[]>(resource, filter, this.options).pipe(
        map(response => {
        if (response instanceof HttpResponse) {
          return response.body;
        }

        return response;
      }));
    }

    return this.http.get<T[]>(resource, this.options).pipe(
      map(response => {
      if (response instanceof HttpResponse) {
        return response.body;
      }

      return response;
    }));
  }

  findOne(resource: string, filter?: any): Observable<T> {
    if (filter) {
      return this.http.post<T>(resource, filter, this.options).pipe(
        map(response => {
        if (response instanceof HttpResponse) {
          return response.body;
        }

        return response;
      }));
    }

    return this.http.get<T>(resource, this.options).pipe(
      map(response => {
      if (response instanceof HttpResponse) {
        return response.body;
      }

      return response;
    }));
  }

  save(item: any, resource: string): Observable<HttpResponseMessage> {
      return this.http.post<HttpResponseMessage>(resource, item, this.options).pipe(
        map(response => {
          if (response instanceof HttpResponse) {
            return response.body;
          }

          return response;
        }),
        // shareReplay(1),
      );
  }

  delete(resource: string): Observable<HttpResponseMessage> {
      return this.http.delete<HttpResponseMessage>(resource, this.options).pipe(
        map(response => {
          if (response instanceof HttpResponse) {
            return response.body;
          }

          return response;
        }),
        // shareReplay(1),
      );
  }

  getAuthenticatedUser(): Observable<AuthenticatedUserResponse> {
    return this.http.get<AuthenticatedUserResponse>(
      (environment.production ? ApiService._REMOTE : ApiService._LOCALHOST) + ':8080/api/user/authenticated',
       this.options).pipe(
        map(response => {
          if (response instanceof HttpResponse) {
            return response.body;
          }

          return response;
        }),
        // shareReplay(1),
      );
  }

  authenticate(username: string, password: string): Observable<any> {
    const data = {
      username: username,
      password: password
    };

    const optionsAux = this.options;
    optionsAux['observe'] = 'response';
    return this.http.post<any>((environment.production ? ApiService._REMOTE : ApiService._LOCALHOST) + ':8080/login', data, optionsAux);
  }

  logout() {
    return this.http.post<any>((environment.production ? ApiService._REMOTE : ApiService._LOCALHOST) + ':8080/logout', null, this.options);
  }
}
