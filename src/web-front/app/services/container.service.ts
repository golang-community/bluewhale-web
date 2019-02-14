import { Injectable } from '@angular/core';
import { CusHttpService } from './custom-http.service';
import { GroupService } from './group.service';
declare let _: any;
@Injectable()
export class ContainerService {
  constructor(private http: CusHttpService, public groupService: GroupService) {}

  public buildReq(ip: string, hidenLoading: boolean = false, authToken: string): any {
    let useProxy: boolean = this.groupService.isIPEnableProxy(ip);
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

  get(ip: string, hidenLoading: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/containers?all=true`;
    return new Promise((resolve, reject) => {
      this.http
        .get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  getDockerInfo(ip: string, hidenLoading: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/dockerinfo`;
    return new Promise((resolve, reject) => {
      this.http
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

  getById(ip: string, id: string, formatted: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, undefined, authToken);
    let url: string = `${reqConfig.url}/containers/${id}?originaldata=${!formatted}`;
    return new Promise((resolve, reject) => {
      this.http
        .get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  getLogs(ip: string, id: string, tail: number, since: string, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, undefined, authToken);
    let url: string = `${reqConfig.url}/containers/${id}/logs`;
    let queryString: Array<string> = [];
    if (tail) {
      queryString.push(`tail=${tail}`);
    }
    if (since) {
      queryString.push(`since=${since}`);
    }
    url = `${url}?${queryString.join('&')}`;
    return new Promise((resolve, reject) => {
      this.http
        .get(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  create(ip: string, config: any, hidenLoading: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/containers`;
    return new Promise((resolve, reject) => {
      this.http
        .post(url, config, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  delete(ip: string, id: string, forceDeletion: boolean, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, false, authToken);
    let url: string = `${reqConfig.url}/containers/${id}?force=false`;
    if (forceDeletion) {
      url = `${reqConfig.url}/containers/${id}?force=true`;
    }
    return new Promise((resolve, reject) => {
      this.http
        .delete(url, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  operate(ip: string, id: string, action: string, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, false, authToken);
    let url: string = `${reqConfig.url}/containers`;
    let data = {
      action: action,
      container: id
    };
    return new Promise((resolve, reject) => {
      this.http
        .put(url, data, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  rename(ip: string, id: string, newName: string, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, false, authToken);
    let url: string = `${reqConfig.url}/containers`;
    let data = {
      action: 'rename',
      container: id,
      newName: newName
    };
    return new Promise((resolve, reject) => {
      this.http
        .put(url, data, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  upgradeImage(
    ip: string,
    id: string,
    imageTag: string,
    hidenLoading: boolean = false,
    authToken: string
  ): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/containers`;
    let data = {
      action: 'upgrade',
      container: id,
      imagetag: imageTag
    };
    reqConfig.options.timeout = null;
    return new Promise((resolve, reject) => {
      this.http
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