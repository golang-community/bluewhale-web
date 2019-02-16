import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { CusHttpService } from './custom-http.service';

declare let _: any;

@Injectable()
export class SystemConfigService {
  public baseUrl: string;

  ConfigSubject = new ReplaySubject<any>(1);

  get Config(): any {
    return this._config;
  }
  set Config(value: any) {
    this._config = value;
    this.ConfigSubject.next(this._config);
  }
  public _config: any;

  constructor(public _http: CusHttpService) {
    this.baseUrl = `/api/admin/sys-config`;
  }

  openGet(): Promise<any> {
    return this.Config;
  }

  get(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.Config) {
        return resolve(this.Config);
      }
      this._http
        .get(this.baseUrl)
        .then(res => {
          let config = res.json();
          this.Config = config;
          resolve(config);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  save(config: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http
        .post(this.baseUrl + '/save', config)
        .then(res => {
          this.Config = _.cloneDeep(config);
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  notifyCenter(value: any, event: string) {
    if (!value) return;
    let url = `${value}/v1/cluster/event`;
    let body = {
      Event: event
    };
    this._http
      .post(url, body)
      .then(res => {})
      .catch(err => {});
  }
}
