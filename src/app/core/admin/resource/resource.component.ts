import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { ResourceModel, ResourceService } from './service/resource.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent implements OnInit {
  @ViewChild('nameInput') nameInput: ElementRef;

  treeControl = new NestedTreeControl<ResourceModel>(node => node.resources);
  dataSource = new MatTreeNestedDataSource<ResourceModel>();

  form: FormGroup;
  isEditing = false;
  isAdd = false;

  constructor(
    private resourceService: ResourceService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this._initData();
  }

  hasChild = (_: number, node: ResourceModel) => !!node.resources && node.resources.length > 0;

  private _initData() {
    this.resourceService.findAll().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  private _reset() {
    this.form.reset();
    this.isEditing = false;
  }

  private _newForm(item?: ResourceModel) {
    this.form = this.formBuilder.group({
      id: [item.id],
      parent: [item.parent],
      level: [item.level, Validators.required],
      placement: [item.placement, Validators.required],
      name: [item.name, Validators.required],
      path: [item.path, Validators.required]
    });
  }

  onAdd(currentNode?: ResourceModel) {
    this.isEditing = true;
    this.isAdd = true;
    let node: ResourceModel = null;
    if (currentNode) {
      // Adding leaf node starting from root node
      let placement = 1;
      if (currentNode.resources) {
        placement = currentNode.resources.length + 1;
      }

      node = {
        id: null,
        parent: currentNode.id,
        level: currentNode.level + 1,
        placement: placement,
        name: '',
        path: `${currentNode.path}/`
      };
    } else {
      // Adding new root node
      let lastNode = null;
      if (this.dataSource.data.length > 0) {
        lastNode = this.dataSource.data[this.dataSource.data.length - 1];
      }

      node = {
        id: null,
        parent: null,
        level: 1,
        placement: lastNode ? lastNode.placement + 1 : 1,
        name: '',
        path: ''
      };
    }

    this._newForm(node);

    // we need to wait till view initialize component to focus it
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.nativeElement.focus();
      }
    }, 50);
  }

  onEdit(item?: ResourceModel) {
    this.isEditing = true;
    this.isAdd = false;
    this._newForm(item);
  }

  onCancel() {
    this._reset();
  }

  onSave() {
    const resource = {
      id: null,
      level: this.form.controls.level.value,
      name: this.form.controls.name.value,
      placement: this.form.controls.placement.value,
      path: this.form.controls.path.value
    };

    if (this.form.controls.id.value !== '') {
      resource.id = this.form.controls.id.value;
    }

    if (this.form.controls.parent.value !== null) {
      resource['parent'] = {
        id: this.form.controls.parent.value
      };
    }

    this.resourceService.save(resource).subscribe(response => {
      this.isEditing = false;
      this._reset();
      this._initData();
    });
  }
}
