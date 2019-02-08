import { Component } from '@angular/core';
import { DashboardService, LogService, MostUsedService, SystemConfigService } from './../../services';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.css'],
  templateUrl: './dashboard.html'
})

export class DashboardPage {

  public dashboardInfo: any = {};
  public logs: Array<any>;
  public mostUsedServers: Array<any>;
  public systemConfig: any;

  public subscribers: Array<any> = [];
  constructor(
    public _dashboardService: DashboardService,
    public _logService: LogService,
    public _mostUsedService: MostUsedService,
    public _systemConfigService: SystemConfigService) {

  }

  ngOnInit() {
    let systemSubscriber = this._systemConfigService.ConfigSubject.subscribe(data => {
      this.systemConfig = data;
    });
    this.subscribers.push(systemSubscriber);
    this._logService.getLog('', 10, 1).then((data) => {
      this.logs = data.rows;
    }).catch((err) => {
      console.error('Get top logs error', err);
    });

    this.mostUsedServers = this._mostUsedService.get();
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }
}
