import { RegraPontuacao } from './../service/cliente.model';
import { ClienteService } from './../service/cliente.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { merge, of as observableOf } from 'rxjs';


@Component({
  selector: 'app-regra-pontuacao',
  templateUrl: './regra-pontuacao.component.html',
  styleUrls: ['./regra-pontuacao.component.scss']
})
export class RegraPontuacaoComponent implements OnInit {

  displayedColumns: string[] = ['id', 'valorInicio', 'valorFim', 'inicio', 'fim', 'pontos'];
  data: RegraPontuacao[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _service: ClienteService) { }

  ngOnInit() {

    merge(this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._service.getRegras(this.paginator.pageIndex);
      }),
      map(data => {
        // Flip flag to show that loading has finished.
        this.isLoadingResults = false;
        this.isRateLimitReached = false;
        this.resultsLength = data.totalElements;

        return data.content;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        // Catch if the GitHub API has reached its rate limit. Return empty data.
        this.isRateLimitReached = true;
        return observableOf([]);
      })
    ).subscribe(data => this.data = data);
  }


}
