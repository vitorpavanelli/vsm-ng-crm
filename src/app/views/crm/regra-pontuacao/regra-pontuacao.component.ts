import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RegraPontuacao } from './../service/cliente.model';
import { ClienteService } from './../service/cliente.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatDatepickerInputEvent } from '@angular/material';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { merge, of as observableOf } from 'rxjs';
import { SnackBarService } from 'src/app/core/service/snackbar.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-regra-pontuacao',
  templateUrl: './regra-pontuacao.component.html',
  styleUrls: ['./regra-pontuacao.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class RegraPontuacaoComponent implements OnInit {
  private _inicio: string;
  private _fim: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['id', 'valorInicio', 'valorFim', 'inicio', 'fim', 'pontos'];
  data: RegraPontuacao[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  form: FormGroup;
  
  isEditing = false;

  constructor(private _service: ClienteService, private _fb: FormBuilder, private _snackBar: SnackBarService,
    private _datePipe: DatePipe) { }

  ngOnInit() {
    this._newForm();

    merge(this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._service.getRegras(this.paginator.pageIndex);
      }),
      map(data => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.resultsLength = data.totalElements;
        return data.content;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        return observableOf([]);
      })
    ).subscribe(data => this.data = data);
  }

  private _newForm(regraPontuacao?: RegraPontuacao) {
    this.form = this._fb.group({
      id: [regraPontuacao ? regraPontuacao.id : ''],
      valorInicio: [regraPontuacao ? regraPontuacao.valorInicio : '', Validators.required],
      valorFim: [regraPontuacao ? regraPontuacao.valorFim : '', Validators.required],
      inicio: [{value: regraPontuacao ? regraPontuacao.inicio : '', disabled: true}, Validators.required],
      fim: [{value: regraPontuacao ? regraPontuacao.fim : '', disabled: true}, Validators.required],
      pontos: [regraPontuacao ? regraPontuacao.pontos : '', Validators.required]
    });
  }

  inicioDate(event: MatDatepickerInputEvent<Date>) {
    this._inicio = this._datePipe.transform(event.value, 'yyyy-MM-dd');
  }

  fimDate(event: MatDatepickerInputEvent<Date>) {
    this._fim = this._datePipe.transform(event.value, 'yyyy-MM-dd');
  }

  onAdd() {
    this.isEditing = true;
    this._newForm();
  }

  onEdit(regraPontuacao: RegraPontuacao) {
    this.isEditing = true;
    this._inicio = regraPontuacao.inicio;
    this._fim = regraPontuacao.fim;
    this._newForm(regraPontuacao);
  }

  onCancel() {
    this.form.reset();
    this.isEditing = false;
  }

  onSave() {
    const data = this.form.value;
    data.inicio = this._inicio;
    data.fim = this._fim;

    this._service.saveRegra(JSON.stringify(data)).subscribe(response => {
      if (response.status === 'SUCCESS') {
        this._snackBar.notifyAll('Regra Salva!');
        if (this.paginator.pageIndex === 0) {
          this.isLoadingResults = true;
          this._service.getRegras(this.paginator.pageIndex).subscribe(data => {
            this.isLoadingResults = false;
            this.resultsLength = data.totalElements;
            this.data = data.content;
          });
        } else {
          this.paginator.firstPage();
        }

      } else {
        this._snackBar.notifyAll('Erro ao salvar!');
      }
    });
  }
}
