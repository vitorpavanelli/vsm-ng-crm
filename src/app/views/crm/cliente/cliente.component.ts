import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Cliente } from './../service/cliente.model';
import { ClienteService } from './../service/cliente.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { merge, of as observableOf } from 'rxjs';
import { SnackBarService } from 'src/app/core/service/snackbar.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['id', 'nome', 'idade', 'genero', 'cpf', 'email'];
  data: Cliente[] = [];

  resultsLength = 0;
  isLoadingResults = true;  
  form: FormGroup;

  isEditing = false;

  constructor(private _service: ClienteService, private _fb: FormBuilder, private _snackBar: SnackBarService) { }

  ngOnInit() {

    merge(this.paginator.page).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this._service.getClientes(this.paginator.pageIndex);
      }),
      map(data => {
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

  private _newForm(cliente?: Cliente) {
    this.form = this._fb.group({
      id: [cliente ? cliente.id : ''],
      nome: [cliente ? cliente.nome : '', Validators.required],
      idade: [cliente ? cliente.idade : '', Validators.required],
      genero: [cliente ? cliente.genero : '', Validators.required],
      cpf: [cliente ? cliente.cpf : '', Validators.required],
      email: [cliente ? cliente.email : '', Validators.required]
    });
  }

  onAdd() {
    this.isEditing = true;
    this._newForm();
  }

  onEdit(cliente: Cliente) {
    this.isEditing = true;
    this._newForm(cliente);
  }

  onCancel() {
    this.form.reset();
    this.isEditing = false;
  }

  onSave() {
    const data = this.form.value;

    this._service.saveCliente(JSON.stringify(data)).subscribe(response => {
      if (response.status === 'SUCCESS') {
        this._snackBar.notifyAll('Cliente Salvo!');
        if (this.paginator.pageIndex === 0) {
          this.isLoadingResults = true;
          this._service.getClientes(this.paginator.pageIndex).subscribe(data => {
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
