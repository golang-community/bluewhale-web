import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './../../../services';

declare let messager: any;

@Component({
  selector: 'hb-user-profile',
  templateUrl: './profile.html',
  // styleUrls: ['./profile.css']
})
export class UserProfilePage {

  public userInfo: any;

  constructor(
    public _router: Router,
    public _userService: UserService) {

  }

  ngOnInit() {
    this.getUserInfo();
  }

  public getUserInfo() {
    this._userService.getCurrentUser()
      .then(data => {
        this.userInfo = data;
      })
      .catch(err => {
        messager.error(err);
        this._router.navigate(['/']);
      });
  }

  public updateProfile(form: any) {
    if (form.invalid) return;
    this._userService.updateProfile(this.userInfo)
      .then(data => {
        messager.success('Updated.');
        this.getUserInfo();
      })
      .catch(err => {
        messager.error(err);
      });
  }
}
