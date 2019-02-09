import { Component, ViewChild, ElementRef } from '@angular/core';
import { CusHttpService } from './../../../../services';
import { ComposeService, ContainerService } from '../../../../services';
import { Router, ActivatedRoute } from '@angular/router';
import * as fileSaver from 'file-saver';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-server-detail',
  templateUrl: './server-detail.html',
  styleUrls: ['./server-detail.css']
})
export class ServerDetailPage {
  @ViewChild('logPanel')
  public logPanel: ElementRef;

  public service: any;
  public containerBasicInfo: Array<any> = [];
  public activedTab: string;
  public instances: any;
  public composeDataConfig: any;
  public _editors: any = {};
  public ip: any;
  public subscribers: Array<any> = [];
  public serviceName: any;
  public container: any;
  public containerId: any;
  public groupId: any;
  public logsViewModalOptions: any = {};
  public logs: Array<any>;
  public deleteContainerModalOptions: any = {};

  constructor(
    public _router: Router,
    public _route: ActivatedRoute,
    public _composeService: ComposeService,
    public _containerService: ContainerService,
    public _http: CusHttpService
  ) {}

  ngOnInit() {
    this.service = {};
    this.container = {};
    let modalCommonOptions = {
      show: false,
      title: 'WRAN',
      closable: false
    };
    let paramSub = this._route.params.subscribe(params => {
      this.ip = params['ip'];
      this.serviceName = params['serviceName'];
      this.groupId = params['groupId'];
    });
    this.subscribers.push(paramSub);
    this.deleteContainerModalOptions = _.cloneDeep(modalCommonOptions);
    this.getService();
    this.composeDataConfig = {
      // SystemId: this.systemId,
      ConfigKey: '',
      Description: '',
      ConfigValue: '',
      SandboxValue: '',
      _prdMode: 'json',
      _sandMode: 'yaml',
      _prdEnableCanary: false,
      _sandEnableCanary: false
    };
    this.logsViewModalOptions = {
      size: 'lg',
      show: false,
      title: '',
      hideFooter: true,
      closable: false,
      logs: []
    };
  }

  public getService() {
    this._composeService
      .getServiceByOne(this.ip, this.serviceName, undefined, '123456')
      .then(res => {
        this.service = res;
        this.activedTab = this.service.Containers[0].Name;
        this.containerId = this.service.Containers[0].Id;
        this.getContainerInfo(this.containerId);
        // let data = res.json();
      })
      .catch(err => {
        messager.error(err);
        this._router.navigate(['/cluster', this.groupId, 'overview']);
      });
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  public getContainerInfo(id: any) {
    this._containerService
      .getById(this.ip, id, undefined, '123456')
      .then(data => {
        this.container = data;
        let stateText = '';
        if (this.container.State.Running) {
          stateText = 'Running';
        } else {
          stateText = 'Stopped';
        }
        if (this.container.State.Restarting) {
          stateText = 'Restarting';
        }
        if (this.container.State.Paused) {
          stateText = 'Paused';
        }
        if (this.container.State.Dead) {
          stateText = 'Dead';
        }
        this.container.State.StateText = stateText;
        this.container.formettedPortsBindings =
          this.container.NetworkSettings.Ports || this.container.HostConfig.PortBindings;
      })
      .catch(err => {
        messager.error(err.Detail || 'Get containers failed.');
        this._router.navigate(['/group', this.groupId, this.ip, 'overview']);
      });
  }

  public aceLoaded(editor: any, env: string) {
    this._editors[env] = editor;
    editor.$blockScrolling = Infinity;
  }

  public downloadComposeData() {
    let content = this.service.ComposeData;
    let blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    fileSaver.saveAs(blob, `${this.serviceName}.yml`);
  }

  public changeTab(tab: string, id: string) {
    this.activedTab = tab;
    this.getContainerInfo(id);
  }

  public getStatusCls(status: any) {
    let cls = 'success';
    if (status.Dead || !status.Running) {
      cls = 'danger';
    }
    if (status.Paused || status.Restarting) {
      cls = 'yellow';
    }
    return cls;
  }

  public getContainerStatus(status: any) {
    let cls = 'success';
    if (status.indexOf('Paused') !== -1 || status.indexOf('Restarting') !== -1 || status === 'Created') {
      cls = 'warning';
    }
    if (status.startsWith('Exited')) {
      cls = 'danger';
    }
    return cls;
  }

  public getContainerCommand() {
    return `${this.container.Path} ${this.container.Args.join(' ')}`;
  }

  public showLogsView(instance: any) {
    this.logsViewModalOptions.selectedInstance = {
      ip: this.ip,
      container: instance.Id.substr(0, 12)
    };
    this.logsViewModalOptions.tailNum = 100;
    this.logsViewModalOptions.title = `Logs for ${instance.Name} on ${this.ip}`;
    this.getLogs();
    this.logsViewModalOptions.show = true;
  }

  public operate(action: string) {
    this._composeService
      .ComposeOperate(this.ip, this.service.Name, action, '123456')
      .then(data => {
        messager.success('succeed');
        this.getService();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  public showDeleteModal(event: any) {
    if (event && event.target.classList.contains('disable')) {
      event.stopPropagation();
      return;
    }
    this.deleteContainerModalOptions.show = true;
  }

  public deleteService() {
    let name = this.serviceName;
    this._composeService
      .removeService(this.ip, name, undefined, '123456')
      .then(data => {
        messager.success('succeed');
        this.deleteContainerModalOptions.show = false;
        this._router.navigate(['/group', this.groupId, this.ip, 'overview']);
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  public getLogs() {
    let instance = this.logsViewModalOptions.selectedInstance;
    this._containerService
      .getLogs(instance.ip, instance.container, this.logsViewModalOptions.tailNum, undefined, '123456')
      .then(data => {
        this.logs = data || [];
        if (this.logs.length > 0) {
          setTimeout(() => {
            $(this.logPanel.nativeElement).animate(
              { scrollTop: this.logPanel.nativeElement.scrollHeight },
              '500',
              'swing'
            );
          }, 500);
        }
      })
      .catch(err => {
        this.logs = [];
        messager.error(err);
      });
  }

  public tailNumChanged(value: any) {
    this.logsViewModalOptions.tailNum = value;
    this.getLogs();
  }

  public getStatusText(status: any) {
    let stateText = '';
    if (status.Running) {
      stateText = 'Running';
    } else {
      stateText = 'Stopped';
    }
    if (status.Restarting) {
      stateText = 'Restarting';
    }
    if (status.Paused) {
      stateText = 'Paused';
    }
    if (status.Dead) {
      stateText = 'Dead';
    }
    return stateText;
  }
}
