import { HttpResponseMessage } from './../../../../shared/api.service';
import { environment } from './../../../../../environments/environment';
import { ApiService } from '../../../../shared/api.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export interface ResourceModel {
    id: number;
    name: string;
    level: number;
    placement: number;
    path?: string;
    parent: number;
    resources?: ResourceModel[];
}

@Injectable()
export class ResourceService {
    private _ADMIN_MENU = (environment.production ? ApiService._REMOTE : ApiService._LOCALHOST) + ':8080/api/admin/resource';
    private _LIST_RESOURCE = `${this._ADMIN_MENU}/tree`;
    private _SAVE_RESOURCE = `${this._ADMIN_MENU}/save`;
    private _DELETE_RESOURCE = `${this._ADMIN_MENU}/delete`;

    constructor(private apiService: ApiService<ResourceModel>) {}

    findAll(): Observable<ResourceModel[]> {
        return this.apiService.findAll(this._LIST_RESOURCE);
    }

    save(item: any): Observable<HttpResponseMessage> {
        return this.apiService.save(item, this._SAVE_RESOURCE);
    }

    delete(id: number): Observable<HttpResponseMessage> {
        return this.apiService.delete(this._DELETE_RESOURCE + '/' + id);
    }
}
