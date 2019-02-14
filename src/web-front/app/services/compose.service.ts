import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';
import { GroupService } from './group.service';

declare let _: any;

@Injectable()
export class ComposeService {
  public systemConfig: any;
  public groups: any = {};
  public baseUrl: string;

  constructor(private _http: CusHttpService, public _groupService: GroupService, public _authService: AuthService) {}

  public buildReq(ip: string, hidenLoading: boolean = false, authToken: string): any {
    let useProxy: boolean = this._groupService.isIPEnableProxy(ip);
    let options: any = {
      disableLoading: hidenLoading,
      timeout: 1 * 60 * 1000,
      headers: {}
    };
    if (useProxy) {
      options.headers['x-proxy-ip'] = ip;
    }
    if (authToken) {
      options.headers['Authorization'] = authToken;
    }
    let url: string = `http://${ip}:8500/dockerapi/v2`;
    let req = {
      url: url,
      options: options
    };
    return req;
  }

  getService(ip: string, hidenLoading: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/services`;
    return new Promise((resolve, reject) => {
      this._http
        .get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          let errData = JSON.parse(JSON.stringify(err));
          reject(errData.json ? errData.json() : errData);
        });
    });
  }

  getServiceByOne(ip: string, name: any, hidenLoading: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/services/${name}`;
    return new Promise((resolve, reject) => {
      this._http
        .get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  getAgentInfo(ip: string, hidenLoading: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/ping`;
    return new Promise((resolve, reject) => {
      this._http
        .get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          let errData = JSON.parse(JSON.stringify(err));
          reject(errData.json ? errData.json() : errData);
        });
    });
  }

  getComposeExample(): Promise<any> {
    let url: string = `api/groups/getComposeExample`;
    return new Promise((resolve, reject) => {
      this._http
        .get(url)
        .then(res => {
          resolve(JSON.parse(JSON.stringify(res))._body);
        })
        .catch(err => {
          let errData = JSON.parse(JSON.stringify(err));
          reject(errData.json ? errData.json() : errData);
        });
    });
  }

  getDockerVersion(ip: string, hidenLoading: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/dockerversion`;
    return new Promise((resolve, reject) => {
      this._http
        .get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          let errData = JSON.parse(JSON.stringify(err));
          reject(errData.json ? errData.json() : errData);
        });
    });
  }

  removeService(ip: string, name: any, hidenLoading: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/services/${name}`;
    return new Promise((resolve, reject) => {
      this._http
        .delete(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  addCompose(ip: string, data: any, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, undefined, authToken);
    let url: string = `${reqConfig.url}/services`;
    return new Promise((resolve, reject) => {
      this._http
        .post(url, data, reqConfig.options)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  ComposeOperate(ip: string, name: string, action: string, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, false, authToken);
    let url: string = `${reqConfig.url}/services`;
    let data = {
      Name: name,
      Action: action
    };
    return new Promise((resolve, reject) => {
      this._http
        .put(url, data, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }
}