import { Injectable } from '@angular/core';
import { CusHttpService } from './custom-http.service';
import { SystemConfigService } from './system-config.service';

@Injectable()
export class ClusterService {

  public systemConfig: any;

  constructor(
    public _http: CusHttpService,
    public _systemConfigService: SystemConfigService) {
    this._systemConfigService.ConfigSubject.forEach(data => {
      this.systemConfig = data;
    });
  }

  getClusterContainers(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/${id}/collections`;
      this._http.get(url)
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => reject(err.json ? err.json() : err))
    });
  }

  getClusterContainer(metaId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/collections/${metaId}`;
      this._http.get(url)
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => reject(err.json ? err.json() : err))
    });
  }

  getContainerMataInfo(metaId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/collections/${metaId}/base`;
      this._http.get(url)
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => reject(err.json ? err.json() : err))
    });
  }

  addContainer(container: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/collections`;
      this._http.post(url, container)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => reject(err.json ? err.json() : err));
    });
  }

  updateContainer(container: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/collections`;
      this._http.put(url, container)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => reject(err.json ? err.json() : err));
    });
  }

  operate(metaId: string, action: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/collections/action`;
      let body = {
        MetaId: metaId,
        Action: action
      };
      this._http.put(url, body)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => reject(err.json ? err.json() : err));
    });
  }

  upgradeImage(metaId: string, newTag: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/collections/upgrade`;
      let body = {
        MetaId: metaId,
        ImageTag: newTag
      }
      this._http.put(url, body)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => reject(err.json ? err.json() : err));
    });
  }

  deleteContainer(metaId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/collections/${metaId}`;
      this._http.delete(url)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => reject(err.json ? err.json() : err));
    });
  }

  getServerStatus(groupId: string, hidenLoading: boolean = false, groupInfo: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/${groupId}/engines`;
      this._http.get(url)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => reject(err.json ? err.json() : err));
    });
  }

  setClusterNode(postData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/nodelabels`;
      this._http.put(url, postData)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => reject(err.json ? err.json() : err));
    })
  }

  getEnginesById(ip: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.systemConfig.HumpbackCenterAPI}/v1/groups/engines/${ip}`;
      this._http.get(url)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => reject(err.json ? err.json() : err));
    })
  }
}
