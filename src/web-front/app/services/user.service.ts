import { Injectable } from '@angular/core';
import { CusHttpService } from './custom-http.service';

@Injectable()
export class UserService {
  public baseUrl: string;

  constructor(public _http: CusHttpService) {
    this.baseUrl = '/api/admin/users';
  }

  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/account/me`;
      this._http
        .get(url)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  getAll(pageIndex: number, pageSize: number = 10, search?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.baseUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}&t=${new Date().valueOf()}`;
      if (search) {
        url = `${url}&q=${search}`;
      }
      this._http
        .get(url)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  getById(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.baseUrl}/${userId}`;
      this._http
        .get(url)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  createUser(userInfo: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/admin/users`;
      this._http
        .post(url, userInfo)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  updateProfile(profile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/account/update`;
      this._http
        .put(url, profile)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  updateUserInfo(userInfo) {
    return new Promise((resolve, reject) => {
      let url = `/api/admin/users/${userInfo.id}`;
      this._http
        .put(url, userInfo)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = {
        UserID: userId,
        OldPassword: oldPassword,
        NewPassword: newPassword
      };
      let url = `/api/account/change-password`;
      this._http
        .put(url, body)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  resetPassword(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/admin/users/${userId}/reset-pwd`;
      this._http
        .post(url, null)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  remove(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/admin/users/${userId}`;
      this._http
        .delete(url)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }
}
