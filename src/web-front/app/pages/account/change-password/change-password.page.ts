import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './../../../services';

declare let messager: any;

@Component({
  selector: 'hb-change-password',
  templateUrl: './change-password.html',
  // styleUrls: ['./change-password.css']
})
export class ChangePasswordPage {

  public userInfo: any;
  public submitted: boolean = false;

  public passwordModel: any = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  constructor(
    public _router: Router,
    public _userService: UserService) {

  }

  ngOnInit() {
    this._userService.getCurrentUser()
      .then(data => {
        this.userInfo = data;
      })
      .catch(err => {
        messager.error(err);
      });
  }

  public changePassword(form: any) {
    this.submitted = true;
    if (form.invalid) return;
    this.submitted = false;
    this._userService.changePassword(this.userInfo.UserID, this.passwordModel.oldPassword, this.passwordModel.newPassword)
      .then(data => {
        form.reset();
        messager.success('Updated.')
      })
      .catch(err => {
        messager.error(err);
        form.reset();
      });
  }
}
