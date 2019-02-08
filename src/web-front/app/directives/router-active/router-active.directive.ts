import { Directive, ElementRef, Input, Renderer } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Subscription } from "rxjs";

@Directive({
  selector: "[hb-router-active]"
})
export class RouterActiveDirective {
  @Input("hb-router-active")
  mRouterActive: any;

  public subscription: Subscription;

  constructor(
    public el: ElementRef,
    public renderer: Renderer,
    public router: Router
  ) {}

  ngOnInit() {
    this.mRouterActive = this.mRouterActive || {};
    this.subscription = this.router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        this.update();
      }
    });
  }

  ngAfterContentInit() {
    this.update();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public update() {
    let currentUrl = this.router.url.toLowerCase();
    if (!this.mRouterActive.url) { return; }
    let addCls = false;
    if (this.mRouterActive.fullMatch && this.mRouterActive.url === currentUrl) {
      addCls = true;
    }
    if (
      !this.mRouterActive.fullMatch &&
      currentUrl.startsWith(this.mRouterActive.url)
    ) {
      addCls = true;
    }
    if (this.mRouterActive.cls) {
      this.renderer.setElementClass(
        this.el.nativeElement,
        this.mRouterActive.cls,
        addCls
      );
    }
  }
}
