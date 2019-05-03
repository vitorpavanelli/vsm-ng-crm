import { Observable } from 'rxjs';
import { ApiService, HttpResponseMessage } from './../../../../shared/api.service';
import { environment } from './../../../../../environments/environment';
import { Injectable } from '@angular/core';

export interface Usuario {
    id: number;
    name: string;
    email: string;
    admin: boolean;
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

@Injectable()
export class AccessService {
    private _API_SSO = (environment.production ? ApiService._REMOTE : ApiService._LOCALHOST) + ':8080/api';
    private _ADMIN_USER = `${this._API_SSO}/admin/user`;
    private _ADMIN_SAVE = `${this._API_SSO}/admin/user/save`;
    private _ADMIN_LIST = `${this._API_SSO}/admin/user/list`;
    private _ADMIN_USER_BY_LOGIN = `${this._API_SSO}/admin/user/check`;

    constructor(private apiService: ApiService<any>) {}

    getUsersSSO(nome: string): Observable<Usuario[]> {
        return this.apiService.findAll(`${this._ADMIN_LIST}/${nome}`);
    }

    getUserDetail(id: number): Observable<Usuario> {
        return this.apiService.findOne(`${this._ADMIN_USER}/${id}`);
    }

    isExistingUser(login: string): Observable<HttpResponseMessage> {
        return this.apiService.findOne(`${this._ADMIN_USER_BY_LOGIN}/${login}`);
    }

    save(data: any): Observable<HttpResponseMessage> {
        return this.apiService.save(data, this._ADMIN_SAVE);
    }
}
