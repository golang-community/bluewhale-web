import { Component } from '@angular/core';
import { UserService } from './../../../../services';

declare let messager: any;
declare let _: any;

@Component({
  selector: 'hb-manage-user-list',
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css']
})
export class ManageUserListPage {
  public users: Array<any>;

  public searchWord: string;
  public totalCount: number = 0;
  public pageSize: number = 10;
  public pageIndex: number = 1;
  public pageOptions: any;

  public delTarget: any;
  public deleteUserModalOptions: any;

  public resetTarget: any;
  public resetPasswordModalOptions: any;

  constructor(public _userService: UserService) {}

  ngOnInit() {
    let modalOptions = {
      show: false,
      title: 'WARN',
      hideCloseBtn: true
    };
    this.resetPasswordModalOptions = _.cloneDeep(modalOptions);
    this.deleteUserModalOptions = _.cloneDeep(modalOptions);
    this.pageOptions = {
      boundaryLinks: false,
      directionLinks: true,
      hidenLabel: true
    };
    this.setPage(1);
  }

  public setPage(pageIndex: number) {
    this.pageIndex = pageIndex;
    this._userService
      .getAll(pageIndex, this.pageSize, this.searchWord)
      .then(data => {
        this.totalCount = data.total_rows;
        this.users = data.rows;
      })
      .catch(err => {
        messager.error(err);
      });
  }

  public search(keyWord: string) {
    this.searchWord = keyWord;
    this.setPage(1);
  }

  public showResetPasswordModal(target: any) {
    this.resetTarget = target;
    this.resetPasswordModalOptions.show = true;
  }

  public resetPassword() {
    if (!this.resetTarget) return;
    this.resetPasswordModalOptions.show = false;
    this._userService
      .resetPassword(this.resetTarget.id)
      .then(res => {
        messager.success('Reset password succeed.');
        this.resetTarget = null;
      })
      .catch(err => {
        messager.error(err);
      });
  }

  public showDeleteModal(target: any) {
    this.delTarget = target;
    this.deleteUserModalOptions.show = true;
  }

  public delUser() {
    if (!this.delTarget) return;
    this.deleteUserModalOptions.show = false;
    this._userService
      .remove(this.delTarget.id)
      .then(res => {
        this.delTarget = null;
        messager.success('Deleted.');
        if (this.users.length === 1 && this.pageIndex > 1) {
          this.pageIndex--;
        }
        this.setPage(this.pageIndex);
      })
      .catch(err => {
        messager.error(err);
      });
  }
}
