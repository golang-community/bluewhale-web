import { Component, ViewChild, ElementRef } from '@angular/core';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { ActivatedRoute, Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { GroupService, MostUsedService } from './../../../services';

declare let $: any;
declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-group-layout',
  templateUrl: './group-layout.html',
  styleUrls: ['./group-layout.css'],
  animations: [
    trigger('groupMenuState', [
      state('inactive', style({
        height: 0,
        display: 'block'
      })),
      state('active', style({
        height: '*',
        display: 'block'
      })),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out'))
    ])
  ]
})
export class GroupLayoutPage {

  @ViewChild('groupTreePanel')
  public groupTreePanel: ElementRef;

  public selectedGroupId: any;
  public groups: Array<any>;

  public routerEventSubscriber: any;

  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    public _mostUsedService: MostUsedService) {
      console.log(_route)
  }

  ngOnInit() {
    this.groups = this._route.snapshot.data['groups'];
    if (this.groups.length > 0) {
      this.selectedGroupId = this.groups[0].ID;
    }
    let guidRex = /^[0-9a-z]{8,8}-[0-9a-z]{4,4}-[0-9a-z]{4,4}-[0-9a-z]{4,4}-[0-9a-z]{12,12}$/;
    this.routerEventSubscriber = this._router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        $('body').scrollTop(0);
        let currentUrl = this._router.url.toLowerCase();
        let paths = currentUrl.split('/');
        for (let path of paths) {
          if (!path) continue;
          if (guidRex.test(path)) {
            this.selectedGroupId = path;
            break;
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.routerEventSubscriber.unsubscribe();
  }

  ngAfterViewInit() {
    if (!this.groups || this.groups.length === 0) return;
    $(window, ".wrapper").resize(() => {
      this.fixGroupTreePanel();
    });
    this.fixGroupTreePanel();
  }

  public addToMostUsed(groupId: any, server: any) {
    let add = server.Name || server.IP;
    this._mostUsedService.add(add, groupId);
    //重置serverTab
    sessionStorage.removeItem('serverTab');
  }

  public fixGroupTreePanel() {
    let panel = this.groupTreePanel.nativeElement;
    $(panel).slimScroll({ destroy: true }).height("auto");
    $(panel).slimscroll({
      height: ($(window).height() - $(".main-header").height()) + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }

  public toggleMenus(groupId: any) {
    if (this.selectedGroupId === groupId) {
      this.selectedGroupId = null;
    } else {
      this.selectedGroupId = groupId;
    }
  }
}
