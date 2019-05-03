import { HttpResponse } from '@angular/common/http';
import { AuthenticatedUser } from './auth.service';
import { Observable, of, ConnectableObservable } from 'rxjs';
import { map, shareReplay, share, publishReplay } from 'rxjs/operators';
import { ApiService } from '../../../shared/api.service';
import { Injectable } from '@angular/core';
import { ResourceModel } from '../../admin/resource/service/resource.service';

export interface  AuthenticatedUserResponse {
    user: AuthenticatedUser;
    resources: ResourceModel[];
}

export interface AuthenticatedUser {
    id: number;
    name: string;
    matricula: number;
    email: string;
    admin: boolean;
    authenticationMethod: string;
    login: string;
    password: string;
    active: boolean;
    locked: boolean;
    lockingReason: string;
    accesses: Access[];
}

export interface Access {
    id: number;
    user: number;
    canWrite: boolean;
    role: string;
    resource: Resource;
}

export interface Resource {
    id: number;
    name: string;
    level: number;
    placement: number;
    path: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _APP_TOKEN = 'APP-TOKEN';
    private _authenticatedUserResponse: AuthenticatedUserResponse;

    constructor(private _apiService: ApiService<AuthenticatedUserResponse>) {}

    authenticatedUser(): Observable<AuthenticatedUserResponse> {
        if (this._authenticatedUserResponse) {
            return of(this._authenticatedUserResponse);
        }

        return this._apiService.getAuthenticatedUser().pipe(
            map(authenticatedUserResponse => {
                this._authenticatedUserResponse = authenticatedUserResponse;
                return this._authenticatedUserResponse;
            }),
            // shareReplay(1),
        );
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem(this._APP_TOKEN);
    }

    authenticate(username: string, password: string): Observable<any> {
        return this._apiService.authenticate(username, password);
    }

    storeToken(token: string): void {
        localStorage.setItem(this._APP_TOKEN, token);
    }

    getToken(): string {
        return localStorage.getItem(this._APP_TOKEN);
    }

    logout() {
        localStorage.removeItem(this._APP_TOKEN);
        this._authenticatedUserResponse = null;
        this._apiService.logout().subscribe(response => {
            console.log('bye :)');
            if (response instanceof HttpResponse) {
                console.log(response['body']);
            } else {
                console.log(response);
            }
        });
    }
}
