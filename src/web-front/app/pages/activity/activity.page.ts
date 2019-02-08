import { Component } from '@angular/core';
import { GroupService, LogService } from './../../services';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-activity',
  templateUrl: './activity.html',
  styleUrls: ['./activity.css']
})
export class ActivityPage {

  public groups: Array<any> = [];
  public servers: Array<any> = [];
  public logs: Array<any> = [];

  public selectedGroupId: string = '';
  public selectedServer: string = '';
  public selectedType: string = '';

  public pageOptions: any;
  public pageSize: number = 20;
  public totalCount: number;

  constructor(
    public _groupService: GroupService,
    public _logService: LogService) {

  }

  ngOnInit() {
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };

    this._groupService.get()
      .then(data => {
        this.groups = data;
      })
      .catch(err => {
        messager.error(err.message || 'Get group info failed.');
      });

    this.setPage(1);
  }

  public getLogs(pageIndex: number) {
    let group = this.selectedGroupId ? (this.selectedGroupId === 'All' ? '' : this.selectedGroupId) : '';
    let type = this.selectedType ? (this.selectedType === 'All' ? '' : this.selectedType) : '';
    let server = '';
    this._logService.getLog(type, this.pageSize, pageIndex, group, server)
      .then(data => {
        this.totalCount = data.total_rows;
        this.logs = data.rows;
      })
      .catch(err => {
        messager.error(err.message || 'Get logs info failed.');
      });
  }

  public selectedGroupChange(value: any) {
    this.selectedGroupId = value || '';
    this.setPage(1);
  }

  public selectedTypeChange(value: any) {
    this.selectedType = value || '';
    this.setPage(1);
  }

  public search() {
    this.setPage(1);
  }

  public setPage(pageIndex: number) {
    this.getLogs(pageIndex);
  }
}
