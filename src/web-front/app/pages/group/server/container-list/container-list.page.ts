import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ContainerService, GroupService, ImageService, LogService, ComposeService } from './../../../../services';
import * as fileSaver from 'file-saver';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-container-list',
  templateUrl: './container-list.html',
  styleUrls: ['./container-list.css']
})
export class ContainerListPage {
  public pullImageName: string;
  public groupInfo: any;
  public ip: any;
  public containers: Array<any> = [];
  public filterContainers: Array<any> = [];
  public filterContainerDone: boolean;
  public containerFilter: string;
  public currentContainers: Array<any> = [];
  public containerPageIndex: number = 1;

  public images: Array<any> = [];
  public filterImages: Array<any> = [];
  public filterImageDone: boolean;
  public imageFilter: string;
  public currentImages: Array<any> = [];
  public imagePageIndex: number = 1;

  public serviceInfo: Array<any> = [];
  public filterServiceDone: boolean;
  public filterServices: Array<any> = [];
  public serviceFilter: string;
  public currentServices: Array<any> = [];
  public servicePageIndex: number = 1;
  public hasFailedContainer: boolean = false;

  public subscribers: Array<any> = [];

  public activedTab: string = 'containers';

  public pageSize: number = 20;
  public containerPageOption: any;

  public rmContainerTarget: any;
  public rmContainerModalOptions: any = {};
  public rmServiceTarget: any;
  public rmServiceModalOptions: any = {};
  public forceDeletion: boolean = false;
  public pullImageModalOptions: any = {};
  public rmImageTarget: any;
  public rmImageModalOptions: any = {};
  public agentInvalid: boolean = false;
  public dockerEngineVersion: string;
  public serverInfo: { ip: string; authToken: string };

  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    public _containerService: ContainerService,
    public _composeService: ComposeService,
    public _groupService: GroupService,
    public _imageService: ImageService,
    public _logService: LogService
  ) {}

  ngOnInit() {
    this.containerPageOption = {
      boundaryLinks: false,
      directionLinks: true,
      hidenLabel: true
    };
    let modalCommonOptions = {
      title: 'WARN',
      show: false,
      closable: false
    };
    this.rmContainerModalOptions = _.cloneDeep(modalCommonOptions);
    this.rmServiceModalOptions = _.cloneDeep(modalCommonOptions);
    this.pullImageModalOptions = _.cloneDeep(modalCommonOptions);
    this.pullImageModalOptions.hideFooter = true;
    this.pullImageModalOptions.title = 'Pull Docker Image';
    this.rmImageModalOptions = _.cloneDeep(modalCommonOptions);
    let paramSub = this._route.params.subscribe(params => {
      let groupId = params['groupId'];
      this.ip = params['ip'];
      this.groupInfo = { ID: groupId };
      this._groupService
        .getById(groupId)
        .then(data => {
          this.groupInfo = data;
          const findServer = this.groupInfo.Servers.find((x: any) => x.IP === this.ip);
          if (findServer) {
            this.serverInfo = { ip: findServer.IP, authToken: findServer.authToken };
            this.init();
          }
        })
        .catch(err => {
          messager.error(err);
          this._router.navigate(['/group']);
        });
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  public init() {
    this.containers = [];
    this.filterContainers = [];
    this.filterContainerDone = false;
    this.currentContainers = [];

    this.images = [];
    this.filterImages = [];
    this.filterImageDone = false;
    this.currentImages = [];

    this.serviceInfo = [];
    this.filterServices = [];
    this.filterServiceDone = false;
    this.currentServices = [];

    if (sessionStorage.getItem('serverTab') == 'service') {
      this.activedTab = 'service';
      this.getService();
    } else {
      this.activedTab = 'containers';
      this.getContainers();
    }
  }

  public changeTab(tab: string) {
    this.activedTab = tab;
    if (tab === 'containers' && this.containers.length === 0) {
      this.getContainers();
    }
    if (tab === 'images' && this.images.length === 0) {
      this.getImages();
    }
    if (tab === 'service' && this.serviceInfo.length === 0) {
      this.getService();
    }
    this.agentInvalid = false;
    sessionStorage.setItem('serverTab', tab);
  }

  public getContainers() {
    this.agentInvalid = false;
    this._containerService
      .get(this.ip, undefined, this.serverInfo.authToken)
      .then(data => {
        this.containers = _.sortBy(data, 'Names');
        this.containers = this.containers.filter((item: any) => {
          if (
            (item.Names[0] && item.Names[0].startsWith('/CLUSTER-')) ||
            (item.Labels &&
              typeof item.Labels == 'object' &&
              JSON.stringify(item.Labels) !== '{}' &&
              item.Labels['com.docker.compose.service'])
          ) {
            return false;
          }
          return true;
        });
        this.filterContainer();
      })
      .catch(err => {
        messager.error(err.message || 'Get containers failed');
      });
  }

  public getService() {
    this._composeService
      .getAgentInfo(this.ip, undefined, this.serverInfo.authToken)
      .then(data => {
        if (data.AppVersion >= '1.3.3') {
          this.agentInvalid = false;
          this._composeService
            .getDockerVersion(this.ip, undefined, '123456')
            .then(data => {
              this.dockerEngineVersion = data.ServerVersion.Version;
            })
            .catch(err => {
              messager.error(err.message || 'Get services failed');
            });
          this._composeService
            .getService(this.ip, undefined, this.serverInfo.authToken)
            .then(data => {
              this.serviceInfo = _.sortBy(data, 'Name');
              this.serviceInfo.forEach(item => {
                item.Containers = item.Containers || [];
                item.Containers = _.sortBy(item.Containers, 'Name');
              });
              this.filterService();
            })
            .catch(err => {
              messager.error(err.message || 'Get services failed');
            });
        } else {
          this.agentInvalid = true;
        }
      })
      .catch(err => {
        messager.error(err.message || 'Server is no response');
      });
  }

  public getContainerStatus(status: any) {
    let cls = 'success';
    if (status.indexOf('Paused') !== -1 || status.indexOf('Restarting') !== -1 || status === 'Created') {
      cls = 'warning';
      this.hasFailedContainer = true;
    } else {
      //是否存在失败的container
      this.hasFailedContainer = false;
    }
    if (status.startsWith('Exited')) {
      cls = 'danger';
      this.hasFailedContainer = true;
    } else {
      this.hasFailedContainer = false;
    }
    return cls;
  }

  public filterContainerTimeout: any;
  public filterContainer(value?: any) {
    this.containerFilter = value || '';
    if (this.filterContainerTimeout) {
      clearTimeout(this.filterContainerTimeout);
    }
    this.filterContainerTimeout = setTimeout(() => {
      let keyWord = this.containerFilter;
      if (!keyWord) {
        this.filterContainers = this.containers;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterContainers = this.containers.filter(item => {
          return regex.test(item.Names[0]);
        });
      }
      this.setContainerPage(this.containerPageIndex);
      this.filterContainerDone = true;
    }, 100);
  }

  public setContainerPage(pageIndex: number) {
    this.containerPageIndex = pageIndex;
    if (!this.filterContainers) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentContainers = this.filterContainers.slice(start, end);
  }

  public getStatsCls(status: string) {
    let cls = 'success';
    if (status.indexOf('Paused') !== -1 || status.indexOf('Restarting') !== -1 || status === 'Created') {
      cls = 'warning';
    }
    if (status.startsWith('Exited')) {
      cls = 'danger';
    }
    return cls;
  }

  public operate(container: any, action: string) {
    let id = container.Id.substring(0, 14);
    let name = container.Names[0].substring(1);
    this._containerService
      .operate(this.ip, id, action, this.serverInfo.authToken)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`${action}ed container ${name} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        this.getContainers();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  public showRmContainerModal(container: any) {
    this.rmContainerTarget = container;
    this.rmContainerModalOptions.show = true;
  }

  public enableForceDeletion(value: any) {
    this.forceDeletion = value.target.checked;
  }

  public rmContainer() {
    let id = this.rmContainerTarget.Id.substring(0, 14);
    let name = this.rmContainerTarget.Names[0].substring(1);
    this._containerService
      .delete(this.ip, id, this.forceDeletion, this.serverInfo.authToken)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`Deleted container ${name} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        this.rmContainerModalOptions.show = false;
        this.getContainers();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  public getImages() {
    this._imageService
      .getImages(this.ip, this.serverInfo.authToken)
      .then(data => {
        this.images = [];
        let index = data.findIndex((item: any) => item.RepoTags == null);
        if (index > -1) {
          data.splice(index, 1);
        }
        data.forEach((item: any) => {
          let isDuplicatedImage = item.RepoTags.length > 1;
          item.RepoTags.forEach((repo: any) => {
            let temp = {
              _repo: repo,
              Id: item.Id,
              Name: repo.split(':')[0],
              Tag: repo.split(':')[1],
              VirtualSize: (item.VirtualSize / 1024 / 1024).toFixed(),
              Created: item.Created * 1000,
              isDuplicatedImage: isDuplicatedImage
            };
            this.images.push(temp);
          });
        });
        this.images = _.sortBy(this.images, 'Name');
        this.filterImage();
      })
      .catch(err => {
        messager.error(err.Detail || 'Get images failed');
      });
  }

  public filterImageTimeout: any;
  public filterImage(value?: any) {
    this.imageFilter = value || '';
    if (this.filterImageTimeout) {
      clearTimeout(this.filterImageTimeout);
    }
    this.filterImageTimeout = setTimeout(() => {
      let keyWord = this.imageFilter;
      if (!keyWord) {
        this.filterImages = this.images;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterImages = this.images.filter(item => {
          return regex.test(item.Name);
        });
      }
      this.setImagePage(this.imagePageIndex);
      this.filterImageDone = true;
    }, 100);
  }

  public setImagePage(pageIndex: number) {
    this.imagePageIndex = pageIndex;
    if (!this.filterImages) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentImages = this.filterImages.slice(start, end);
  }

  public filterServiceTimeout: any;
  public filterService(value?: any) {
    this.serviceFilter = value || '';
    if (this.filterServiceTimeout) {
      clearTimeout(this.filterServiceTimeout);
    }
    this.filterServiceTimeout = setTimeout(() => {
      let keyWord = this.serviceFilter;
      if (!keyWord) {
        this.filterServices = this.serviceInfo;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterServices = this.serviceInfo.filter(item => {
          return regex.test(item.Name);
        });
      }
      this.setServicePage(this.servicePageIndex);
      this.filterServiceDone = true;
    }, 100);
  }

  public setServicePage(pageIndex: number) {
    this.servicePageIndex = pageIndex;
    if (!this.filterServices) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentServices = this.filterServices.slice(start, end);
  }

  public showPullImageModal() {
    this.pullImageModalOptions.formSubmitted = false;
    this.pullImageModalOptions.show = true;
  }

  public pullImage(form: any) {
    this.pullImageModalOptions.formSubmitted = true;
    if (form.invalid) return;
    let imageName = form.value.pullImageName;
    if (!imageName) {
      messager.error('Image name cannot be empty or null');
      return;
    }
    let regex = new RegExp('^[0-9a-zA-Z-_:./]+$');
    if (!regex.test(imageName)) {
      messager.error('Image name cannot contain any special character');
      return;
    }
    this.pullImageModalOptions.show = false;
    this._imageService
      .pullImage(this.ip, imageName, undefined, this.serverInfo.authToken)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`Pulled image ${imageName} on ${this.ip}`, 'Image', this.groupInfo.ID, this.ip);
        this.pullImageModalOptions.show = false;
        this.getImages();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  public showRmImageModal(image: any) {
    this.rmImageTarget = image;
    this.rmImageModalOptions.show = true;
  }

  public rmImage() {
    let id = this.rmImageTarget.Id.substring(0, 14);
    if (this.rmImageTarget.isDuplicatedImage) {
      id = this.rmImageTarget._repo;
    }
    this.rmImageModalOptions.show = false;
    this._imageService
      .deleteImage(this.ip, id, this.serverInfo.authToken)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(
          `Deleted image ${this.rmImageTarget._repo} on ${this.ip}`,
          'Image',
          this.groupInfo.ID,
          this.ip
        );
        this.getImages();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  public serviceOperate(service: any, action: any) {
    this._composeService
      .ComposeOperate(this.ip, service.Name, action, '123456')
      .then(data => {
        messager.success('succeed');
        // this._logService.addLog(`${action}ed container ${name} on ${this.ip}`, 'Container', this.groupInfo.ID, this.ip);
        this.getService();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  public showRmServiceModal(service: any) {
    this.rmServiceTarget = service;
    this.rmServiceModalOptions.show = true;
  }

  public rmService() {
    let name = this.rmServiceTarget.Name;
    this._composeService
      .removeService(this.ip, name, undefined, '123456')
      .then(data => {
        messager.success('succeed');
        this.rmServiceModalOptions.show = false;
        this.getService();
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  public downloadComposeData(item: any) {
    let content = item.ComposeData;
    let blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    fileSaver.saveAs(blob, `${item.Name}.yml`);
  }

  copyId(cIdInput: HTMLInputElement) {
    if (cIdInput) {
      cIdInput.select();
      document.execCommand('Copy');
      messager.success('Copied');
    }
  }
}
