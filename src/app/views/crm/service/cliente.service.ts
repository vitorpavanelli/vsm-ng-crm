import { Observable } from 'rxjs';
import { Cliente, RegraPontuacao } from './cliente.model';
import { ApiService, HttpResponseMessage } from './../../../shared/api.service';
import { environment } from './../../../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable()
export class ClienteService {
    private _PORTAL_CRM_CLIENTE = (environment.production ? ApiService._REMOTE : ApiService._LOCALHOST) + ':8081/api/crm/cliente';
    private _SAVE_CLIENTE = `${this._PORTAL_CRM_CLIENTE}/save`;
    private _LIST_CLIENTE = `${this._PORTAL_CRM_CLIENTE}/all`;

    private _PORTAL_CRM_REGRA = `${this._PORTAL_CRM_CLIENTE}/pontuacao`;
    private _SAVE_REGRA = `${this._PORTAL_CRM_REGRA}/save`;
    private _LIST_REGRA = `${this._PORTAL_CRM_REGRA}/all`;

    constructor(private apiService: ApiService<any>) { }

    getClientes(page: number): Observable<Cliente[]> {
        return this.apiService.findAll(`${this._LIST_CLIENTE}/${page}`);
    }

    getCliente(id: number): Observable<Cliente> {
        return this.apiService.findOne(`${this._PORTAL_CRM_CLIENTE}/${id}`);
    }

    saveCliente(data: any): Observable<HttpResponseMessage> {
        return this.apiService.save(data, this._SAVE_CLIENTE);
    }

    getRegras(page: number): Observable<RegraPontuacao[]> {
        return this.apiService.findAll(`${this._LIST_REGRA}/${page}`);
    }

    getRegra(id: number): Observable<RegraPontuacao> {
        return this.apiService.findOne(`${this._PORTAL_CRM_REGRA}/${id}`);
    }

    saveRegra(data: any): Observable<HttpResponseMessage> {
        return this.apiService.save(data, this._SAVE_REGRA);
    }
}
