import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './../../services';
import { IUserLogin } from './../../interfaces';

declare let messager: any;

@Component({
  selector: 'login',
  styleUrls: ['./login.css'],
  templateUrl: './login.html'
})

export class LoginPage {

  public user: IUserLogin;
  public isLogin: boolean;
  public returnUrl: string;

  public subscribers: Array<any> = [];

  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    public _authService: AuthService) {

  }

  ngOnInit() {
    this.user = {
      UserID: '',
      Password: '',
      RememberMe: false
    };
    let paramSub = this._route.params.subscribe(param => {
      this.returnUrl = param['returnUrl'] || '/';
    });
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }

  public login(form: any) {
    if (form.invalid) return;
    this.isLogin = true;
    this._authService.login(this.user)
      .then(data => {
        messager.success("Login succeed!");
        this._router.navigateByUrl(this.returnUrl);
      })
      .catch(err => {
        this.isLogin = false;
        messager.error(err);
      });
  }
}
