import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, GroupService } from './../../../../services';

declare let messager: any;

@Component({
  selector: 'hb-manage-group-list',
  templateUrl: './group-list.html',
  styleUrls: ['./group-list.css']
})
export class ManageGroupListPage {
  public groups: Array<any>;
  public delTarget: any;
  public isAdmin: boolean = false;
  public deleteGroupModalOptions: any = {};

  public filterGroups: Array<any> = [];
  public filterCondition: string;
  public currentGroups: Array<any>;

  public pageSize: number = 10;
  public pageOptions: any;

  constructor(public _router: Router, public _groupService: GroupService, public _authService: AuthService) {}

  ngOnInit() {
    this.deleteGroupModalOptions = {
      show: false,
      title: 'WARN',
      hideCloseBtn: true
    };
    this.pageOptions = {
      boundaryLinks: false,
      directionLinks: true,
      hidenLabel: true
    };
    this.groups = [];
    let currentUser = this._authService.getUserInfoFromCache();
    this.isAdmin = currentUser.IsAdmin;
    this.getGroups();
  }

  public getGroups() {
    this._groupService
      .getForManage(this.isAdmin)
      .then(data => {
        this.groups = data;
        this.search(this.filterCondition);
      })
      .catch(err => {
        messager.error(err.message || err);
        this._router.navigate(['/']);
      });
  }

  public searchTimeout: any;
  public search(value?: any) {
    this.filterCondition = value || '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      let keyWord = this.filterCondition;
      if (!keyWord) {
        this.filterGroups = this.groups;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterGroups = this.groups.filter(item => {
          return regex.test(item.Name);
        });
      }
      this.setPage(1);
    }, 100);
  }

  public setPage(pageIndex: number) {
    if (!this.filterGroups) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentGroups = this.filterGroups.slice(start, end);
  }

  public showDeleteModal(group: any) {
    this.delTarget = group;
    this.deleteGroupModalOptions.show = true;
  }

  public delGroup() {
    if (!this.delTarget) return;
    this.deleteGroupModalOptions.show = false;
    this._groupService
      .remove(this.delTarget.ID)
      .then(res => {
        messager.success('Succeed.');
        this._groupService.clear();
        this.getGroups();
      })
      .catch(err => {
        messager.error(err);
      });
  }
}
