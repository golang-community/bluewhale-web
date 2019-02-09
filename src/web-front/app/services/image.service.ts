import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';
import { GroupService } from './group.service';

@Injectable()
export class ImageService {
  public headers: any;

  constructor(private http: CusHttpService, public authService: AuthService, public groupService: GroupService) {
    this.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  }

  public buildReq(ip: string, hidenLoading: boolean = false, authToken: string): any {
    let useProxy: boolean = this.groupService.isIPEnableProxy(ip);
    let options: any = {
      disableLoading: hidenLoading,
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

  getImages(ip: string, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, false, authToken);
    let url: string = `${reqConfig.url}/images`;
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

  pullImage(ip: string, image: string, hidenLoading: boolean = false, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, hidenLoading, authToken);
    let url: string = `${reqConfig.url}/images`;
    let reqBody = {
      image: image
    };
    return new Promise((resolve, reject) => {
      this.http
        .post(url, reqBody, reqConfig.options)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  deleteImage(ip: string, id: string, authToken: string): Promise<any> {
    let reqConfig = this.buildReq(ip, false, authToken);
    let url: string = `${reqConfig.url}/images/${id}`;
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

  getImageInfoFromDB(name: string): Promise<any> {
    let url = `/api/images/${encodeURIComponent(name)}`;
    return new Promise((resolve, reject) => {
      this.http
        .get(url, { headers: this.headers })
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  saveImageInfoToDB(info: any): Promise<any> {
    let url = `/api/images`;
    return new Promise((resolve, reject) => {
      this.http
        .post(url, info, { headers: this.headers })
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }
}
