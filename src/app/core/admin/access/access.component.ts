import { SnackBarService } from './../../service/snackbar.service';
import { AuthService, AuthenticatedUser } from './../../auth/service/auth.service';
import { AccessService, Usuario } from './service/access.service';
import { ResourceModel } from './../resource/service/resource.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../resource/service/resource.service';
import { of, Subscription } from 'rxjs';
import { debounceTime, tap, switchMap, finalize, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatCheckboxChange } from '@angular/material';

export class NodeInfo {
  index: number;
  path: string;
  parent: string;
  hasChildren: boolean;
}

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss']
})
export class AccessComponent implements OnInit {
  private _resourceCounter: Map<string, NodeInfo> = null;
  ssoForm: FormGroup;
  isLoadingSSO = false;

  form: FormGroup;
  hidePassword = true;
  isEditing = false;
  hasUserId = false;
  isAdd = false;

  dataSource: ResourceModel[];
  user: Usuario;
  selectedUser: Usuario;
  
  filteredUserSSO: Usuario[];
  ssoAutoCompleteSubscription$: Subscription;
  authenticatedUser: AuthenticatedUser;

  constructor(private accessService: AccessService, private resourceService: ResourceService, 
    private fb: FormBuilder, private _authService: AuthService, private _snackBar: SnackBarService) {}

  ngOnInit() {
    this._authService.authenticatedUser().subscribe(
      (response) => {
        this.authenticatedUser = response.user;
        if (this.authenticatedUser.admin) {
          this.resourceService.findAll().subscribe(data => this.dataSource = data);

        } else {
          const data = response.resources.slice();
          const adminIndex = data.findIndex(item => item.path === '/admin');
          if (adminIndex !== -1) {
            data.splice(adminIndex, 1);
          }
          this.dataSource = data;
        }
      }
    );

    this.user = null;
    this._initSSOAutocomplete();
  }

  private _initSSOAutocomplete() {
    this.ssoForm = this.fb.group({
      user: null
    });

    this.ssoAutoCompleteSubscription$ = this.ssoForm.get('user').valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      tap(() => this.isLoadingSSO = true),
      switchMap(value => {
        if (value !== '' && value.length >= 3) {
          return this.accessService.getUsersSSO(value).pipe(
            finalize(() => this.isLoadingSSO = false)
          );

        } else {
          this.isLoadingSSO = false;
          return of(null);
        }
      })
    ).subscribe(users => this.filteredUserSSO = users);
  }

  private _reset() {
    this.form.reset();
    this.form = null;
    this.user = null;
    this.selectedUser = null;    
    this.isEditing = false;
    this.hasUserId = false;
    this._resourceCounter = null;
  }

  private _AccessForm(node: ResourceModel): FormGroup {
    let access = null;
    if (this.selectedUser.accesses) {
      access = this.selectedUser.accesses.find(obj => obj.resource.path === node.path);
    }

    return this.fb.group({
        id: [access ? access.id : null],
        role: [access ? access.role : 'USER'],
        canWrite: [access ? access.canWrite : false],
        checked: [!!access],
        resource: this.fb.group({
          id: [access ? access.resource.id : node.id],
          path: node.path,
        })
      });
  }

  private _initAccessForm(node: ResourceModel[], accesses: FormArray, parent: string) {
    for (const item of node) {
      const nodeInfo = {
        index: this._resourceCounter.size,
        path: item.path,
        parent: parent,
        hasChildren: !!item.resources
      };
      this._resourceCounter.set(item.path, nodeInfo);
      accesses.insert(this._resourceCounter.size, this._AccessForm(item));

      if (item.resources) {
        this._initAccessForm(item.resources, accesses, item.path);
      }
    }
  }

  private _newForm(user: Usuario) {
    this.form = this.fb.group({
      id: [user.id],
      name: [user.name, Validators.required],
      email: [user.email],
      login: [user.login, Validators.required],
      password: [''],
      active: [user.active],
      locked: [user.locked],
      lockingReason: [user.lockingReason],
      admin: [user.admin],
      accesses: this.fb.array([])
    });

    this._resourceCounter = new Map();
    const accesses = <FormArray>this.form.controls.accesses;
    this._initAccessForm(this.dataSource, accesses, null);
  }

  getResourceIndex(path: string): number {
    return this._resourceCounter.get(path).index;
  }

  hasChildren(item: ResourceModel): boolean {
    return !!item.resources;
  }

  displayFnSSO(user: Usuario) {
    if (user) {
      return user.name;
    }
  }

  isUserSelectedSSO(): boolean {
    return this.user != null;
  }

  onSelectedUserSSO(event: MatAutocompleteSelectedEvent) {
    this.user = event.option.value;
  }

  private _resetAutocomplete() {
    this.ssoAutoCompleteSubscription$.unsubscribe();
    this.user = null;
    this.ssoForm.reset();
    this._initSSOAutocomplete();
  }

  onEdit() {
    this.accessService.getUserDetail(this.user.id).subscribe(data => {
      this.hasUserId = true;
      this.isEditing = true;
      this.selectedUser = data;
      this._newForm(this.selectedUser);
      this._resetAutocomplete();
    });
  }

  onCancel() {
    this._reset();
  }

  onSave() {
    const data = this.form.value;
    data.accesses = data.accesses.filter(access => access.checked);
    this.accessService.save(JSON.stringify(data)).subscribe(response => {
      if (response.userId) {
        this.hasUserId = true;
        this.form.patchValue({'id': response.userId});
      }

      if (response.status === 'SUCCESS') {
        this._snackBar.notifyAll('Usuário Salvo!');
      }
    });
  }

  onCheckboxStatusChange(node: ResourceModel, event: MatCheckboxChange) {
    this._checkChildren(node, event.checked);
    this._checkParent(node, event.checked);
  }

  private _checkChildren(node: ResourceModel, isChecked: boolean) {
    const selectedNodeInfo: NodeInfo = this._resourceCounter.get(node.path);
    let nextParentNodeInfo: NodeInfo  = selectedNodeInfo;
    if (selectedNodeInfo.hasChildren) {
      for (let i = (selectedNodeInfo.index + 1); i < (<FormArray>this.form.value.accesses).length; i++) {
        const currentUINode: FormGroup = <FormGroup>(<FormArray>this.form.controls.accesses).at(i);
        const currentNodeInfo = this._resourceCounter.get(currentUINode.value.resource.path);
        if (nextParentNodeInfo.path === currentNodeInfo.parent || selectedNodeInfo.path === currentNodeInfo.parent) {
          if (currentNodeInfo.hasChildren) {
            nextParentNodeInfo = currentNodeInfo;
          }
          currentUINode.patchValue({checked: isChecked});
        }

        if (!currentNodeInfo.parent) {
          break;
        }
      }
    }
  }

  private _checkParent(node: ResourceModel, isChecked: boolean) {
    let selectedNodeInfo: NodeInfo = this._resourceCounter.get(node.path);
    if (selectedNodeInfo.parent) {
      for (let i = (selectedNodeInfo.index - 1); i <= (<FormArray>this.form.value.accesses).length; i--) {
        const currentUINode: FormGroup = <FormGroup>(<FormArray>this.form.controls.accesses).at(i);
        const currentNodeInfo = this._resourceCounter.get(currentUINode.value.resource.path);
        if (selectedNodeInfo.parent === currentNodeInfo.path) {
          selectedNodeInfo = currentNodeInfo;
          if (isChecked || !this._haveSiblingsChecked(selectedNodeInfo)) {
            currentUINode.patchValue({checked: isChecked});
          }
        }

        if (!selectedNodeInfo.parent) {
          break;
        }
      }
    }
  }

  private _haveSiblingsChecked(selectedNodeInfo: NodeInfo): boolean {
    let checkedCount = 0;
    for (let i = (selectedNodeInfo.index + 1); i < (<FormArray>this.form.value.accesses).length; i++) {
      const currentUINode: FormGroup = <FormGroup>(<FormArray>this.form.controls.accesses).at(i);
      const currentNodeInfo = this._resourceCounter.get(currentUINode.value.resource.path);
      if (selectedNodeInfo.path !== currentNodeInfo.parent) {
        break;
      }

      if (currentUINode.value.checked) {
        checkedCount++;
      }
    }

    if (checkedCount >= 1) {
      return true;
    }

    return false;
  }
}
