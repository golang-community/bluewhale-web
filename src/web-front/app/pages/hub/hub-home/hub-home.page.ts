import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { HubService, LogService } from './../../../services';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-hub-home',
  templateUrl: './hub-home.html',
  styleUrls: ['./hub-home.css']
})
export class HubHomePage {

  public searchText: string;

  public pageSize: number = 10;
  public pageOptions: any;
  public totalCount: number;

  public images: Array<any>;
  public filterImages: Array<any>;
  public currentImages: Array<any>;

  public subscribers: Array<any> = [];

  constructor(
    public _route: ActivatedRoute,
    public _location: Location,
    public _router: Router,
    public _hubService: HubService) {

  }

  ngOnInit() {
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };
    let paramSub = this._route.params.subscribe((param) => {
      this.searchText = param['search'] || '';
      this.getImages('gdev');
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  public getImages(location: string) {
    this.images = [];
    this.currentImages = [];
    this._hubService.getImages(location)
      .then((data) => {
        this.images = data;
        this.totalCount = data.length;
        this.search();
      })
      .catch((err) => {
        console.error(`[${new Date()}] Get images from hub(${location}) failed. Err: ${JSON.stringify(err)}`);
        messager.error(err.errors ? err.errors[0].message : 'Get images failed.');
      });
  }

  public search() {
    let url = `/hub`;
    if (this.searchText) {
      url += `;search=${encodeURIComponent(this.searchText)}`;
      this.filterImages = this.images.filter((item: any) => {
        return item.indexOf(this.searchText) !== -1;
      });
    } else {
      this.filterImages = _.cloneDeep(this.images);
    }
    this.totalCount = this.filterImages.length;
    this.setPage(1);
    this._location.replaceState(url);
  }

  public setPage(pageIndex: number) {
    if (!this.filterImages) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentImages = this.filterImages.slice(start, end);
  }
}
