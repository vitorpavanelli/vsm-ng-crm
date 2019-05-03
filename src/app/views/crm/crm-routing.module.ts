import { RegraPontuacaoComponent } from './regra-pontuacao/regra-pontuacao.component';
import { ClienteComponent } from './cliente/cliente.component';
import { RoutesService } from 'src/app/shared/routes.service'; 
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const _ROUTES = RoutesService._ROUTES;

const routes: Routes = [
    {path: '', children: [
        {path: _ROUTES.crm.cliente.resource, component: ClienteComponent},
        {path: _ROUTES.crm.cliente.regrapontuacao.resource, component: RegraPontuacaoComponent}
    ]}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CrmRoutingModule {}
