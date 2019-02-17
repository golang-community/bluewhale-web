import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SystemConfigService } from './../../../services';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-system-config',
  templateUrl: './system-config.html',
  styleUrls: ['./system-config.css']
})
export class SystemConfigPage {
  public config: any = {};

  constructor(public _router: Router, public _systemConfig: SystemConfigService) {}

  ngOnInit() {
    this._systemConfig
      .get()
      .then(data => {
        this.config = _.cloneDeep(data);
      })
      .catch(err => {
        messager.error(err);
        this._router.navigate(['/']);
      });
  }

  public enablePrivateRegistryChange(value: any) {
    this.config.EnablePrivateRegistry = value;
    if (!value) {
      this.config.PrivateRegistry = '';
    }
  }

  public save(form: any) {
    if (this.config.EnablePrivateRegistry && form.controls.privateRegistry.invalid) return;
    if (this.config.EnableClusterMode && form.controls.humpbackCenterAPI.invalid) return;
    this._systemConfig
      .save(this.config)
      .then(res => {
        messager.success('Updated.');
      })
      .catch(err => {
        messager.error(err);
      });
  }
}
