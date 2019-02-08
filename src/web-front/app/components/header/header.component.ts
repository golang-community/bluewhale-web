import { Component, Renderer } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, EventNotifyService, EventType } from './../../services';

declare let messager: any;

@Component({
  selector: 'hb-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {

  public userInfo: any;
  public logoutModalOptions: any = {};

  constructor(
    public _renderer: Renderer,
    public _router: Router,
    public _authService: AuthService,
    public _eventNotifyService: EventNotifyService) {

  }

  ngOnInit() {
    this.userInfo = this._authService.getUserInfoFromCache();
    this.logoutModalOptions = {
      show: false,
      title: 'Info',
      hideCloseBtn: true
    };
  }

  public toggleSidebar() {
    let bodyEle = document.body;
    let isMini = bodyEle.classList.contains('sidebar-collapse');
    this._renderer.setElementClass(bodyEle, 'sidebar-collapse', !isMini);
    this._renderer.setElementClass(bodyEle, 'sidebar-open', !isMini);
    this._eventNotifyService.notifyDataChanged(EventType.SidebarMini, !isMini);
  }

  public showLogoutModal() {
    this.logoutModalOptions.show = true;
  }

  public logout() {
    this._authService.logout()
      .then(res => {
        this._router.navigate(['/login']);
      })
      .catch(err => {
        messager.error(err);
      });
  }
}
