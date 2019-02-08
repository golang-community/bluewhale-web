import { Component, ViewChild, ElementRef, Renderer } from "@angular/core";
import { Router } from "@angular/router";
import {
  AuthService,
  EventNotifyService,
  SystemConfigService,
  EventType
} from "./../../services";

declare let $: any;
declare let messager: any;

@Component({
  selector: "hb-sidebar",
  templateUrl: "./sidebar.html",
  styleUrls: ["./sidebar.css"]
})
export class SideBarComponent {
  @ViewChild("mainSidebar")
  public mainSidebar: ElementRef;
  public sideBar: HTMLElement;

  public groups: Array<Object>;
  public userInfo: any;
  public config: any;

  public activeSubMenu: string = "";

  public subscribers: Array<any> = [];

  constructor(
    public _router: Router,
    public _renderer: Renderer,
    public _authService: AuthService,
    public _eventNotifyService: EventNotifyService,
    public _systemConfigService: SystemConfigService
  ) {}

  ngOnInit() {
    this.config = {};
    let configSubscriber = this._systemConfigService.ConfigSubject.subscribe(
      (data: any) => {
        this.config = data;
      }
    );
    this.subscribers.push(configSubscriber);

    this.userInfo = this._authService.getUserInfoFromCache();
    this._eventNotifyService.subscribe(EventType.SidebarMini, (state: any) => {
      if (window.innerWidth < 767) {
        state = !state;
      }
      if (state) {
        $(this.sideBar)
          .slimScroll({ destroy: true })
          .height("auto");
        this.sideBar.style.overflow = null;
      } else {
        this.fixSidebar();
      }
    });
    let currentUrl = this._router.url;
    if (currentUrl.startsWith("/account")) {
      this.activeSubMenu = "account";
    } else if (currentUrl.startsWith("/manage")) {
      this.activeSubMenu = "manage";
    }
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }

  ngAfterViewInit() {
    this.sideBar = this.mainSidebar.nativeElement.querySelector(".sidebar");
    $(window, ".wrapper").resize(() => {
      this.fixSidebar();
    });
    this.fixSidebar();
  }

  public fixSidebar() {
    $(this.sideBar)
      .slimScroll({ destroy: true })
      .height("auto");
    $(this.sideBar).slimscroll({
      height: $(window).height() - $(".main-header").height() + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }

  public toggleSubMenu(element: HTMLElement, subMenuName: string) {
    if (this.activeSubMenu === subMenuName) {
      this.activeSubMenu = "";
    } else {
      this.activeSubMenu = subMenuName;
    }
    let isActive = element.classList.contains("active");
    this._renderer.setElementClass(element, "active", !isActive);
  }
}
