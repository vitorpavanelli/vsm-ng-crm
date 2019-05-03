import { RegraPontuacaoComponent } from './regra-pontuacao/regra-pontuacao.component';
import { MaterialModule } from './../../shared/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ClienteComponent } from './cliente/cliente.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CrmRoutingModule } from './crm-routing.module';
import { ClienteService } from './service/cliente.service';


@NgModule({
    declarations: [
        ClienteComponent,
        RegraPontuacaoComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MaterialModule,
        CrmRoutingModule
    ],
    providers: [
        ClienteService
    ]
})
export class CrmModule { }
