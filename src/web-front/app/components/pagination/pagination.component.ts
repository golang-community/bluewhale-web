import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'hb-pagination',
  templateUrl: './pagination.html',
  styleUrls: ['./padination.css']
})

export class PaginationComponent {
  @Input()
  public set maxSize(value: number) {
    this._maxSize = value || 10;
    this.updateTotalPages();
  }
  public get maxSize(): number {
    return this._maxSize;
  }

  @Input()
  public set pageSize(value: number) {
    this._pageSize = value || 10;
    this.updateTotalPages();
  }
  public get pageSize(): number {
    return this._pageSize;
  }

  @Input()
  public set totalCount(value: number) {
    this._totalCount = value || 0;
    this.updateTotalPages();
  }
  public get totalCount(): number {
    return this._totalCount;
  }

  @Input()
  public set currentPage(value: number) {
    value = value || 1;
    const _temp = this._currentPage;
    this._currentPage = value < 1 ? 1 : value > this.totalPages ? this.totalPages : value;
    if (_temp === this._currentPage) {
      return; //avoid dead circulation
    }
    if (this._inited) {
      this.onSelectPage.next(value);
    }
  }
  public get currentPage(): number {
    return this._currentPage;
  }

  @Input()
  public disabled: boolean = false;

  @Input()
  public options: any = {};

  @Output()
  public onSelectPage: EventEmitter<any>;

  protected _maxSize: number;
  protected _pageSize: number;
  protected _totalCount: number;
  protected _currentPage: number;
  protected _inited: boolean = false;
  public totalPages: number;
  public pages: Array<number> = [];
  public showPrevMoreBtn: boolean = false;
  public showNextMoreBtn: boolean = false;

  constructor() {
    this.onSelectPage = new EventEmitter();
  }

  ngOnInit() {
    this._inited = true;
    this.options.directionLinks = this.options.directionLinks || true;
    this.options.boundaryLinks = this.options.boundaryLinks !== undefined ? this.options.boundaryLinks : false;
    this.updateTotalPages();
  }

  public updateTotalPages(): void {
    if (!this._inited) return;
    let pageCount: number;
    if (this.totalCount !== undefined) {
      let pageSize = this.pageSize < 1 ? 1 : this.pageSize;
      pageCount = Math.ceil(this.totalCount / this.pageSize);
      pageCount = pageCount > 1 ? pageCount : 1;
    }
    if (this.totalPages < 1) {
      pageCount = 1;
    }
    this.totalPages = pageCount;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.currentPage = this.currentPage || 1;
    this.pages = this.getPages(this.currentPage, this.totalPages);    
  }

  public getPages(currentPage: number, totalPage: number): Array<number> {
    let pages: Array<number> = [];
    let maxSize = this.maxSize;
    if (currentPage > totalPage) {
      currentPage = totalPage;
    }
    if (maxSize > totalPage) {
      maxSize = totalPage;
    }
    let beginPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
    let endPage = beginPage + maxSize - 1;
    if (endPage > totalPage) {
      endPage = totalPage;
      beginPage = endPage - maxSize + 1;
    }
    for (let i = beginPage; i <= endPage; i++) {
      pages.push(i);
    }
    this.showPrevMoreBtn = beginPage > 1;
    this.showNextMoreBtn = endPage < totalPage;
    return pages;
  }

  public setPage(pageIndex: number, updateCurrentPage: boolean = true): void {
    if (pageIndex < 1) {
      pageIndex = 1;
    }
    if (pageIndex > this.totalPages) {
      pageIndex = this.totalCount;
    }
    if (updateCurrentPage) {
      this.currentPage = pageIndex;
    }
    this.pages = this.getPages(pageIndex, this.totalPages);
  }

  public pageUp(): void {
    let pageIndex = this.currentPage - 1;
    this.setPage(pageIndex);
  }

  public pageDown(): void {
    let pageIndex = this.currentPage + 1;
    this.setPage(pageIndex);
  }

  public prevMore(): void {
    let pageIndex = this.pages[0] - 1;
    this.setPage(pageIndex);
  }

  public nextMore(): void {
    let pageIndex = this.pages[this.pages.length - 1] + 1
    this.setPage(pageIndex);
  }
}
