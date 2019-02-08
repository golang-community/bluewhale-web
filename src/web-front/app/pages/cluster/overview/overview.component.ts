import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GroupService,
  ContainerService,
  LogService,
  ClusterService,
  HubService,
  ImageService
} from './../../../services';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'overview',
  templateUrl: 'overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class ClusterOverviewPage {
  public pullImageName: string;
  public newTag: string;
  public groupInfo: any = {};
  public containerFilter: string;
  public containers: Array<any> = [];
  public filterContainers: Array<any> = [];
  public filterContainerDone: boolean;
  public currentContainers: Array<any> = [];
  public containerPageOption: any;
  public containerPageIndex: number = 1;
  public pageSize: number = 15;

  public activedTab: string = 'containers';
  public allInstanceIp: Array<any> = [];
  public ip: any;
  public images: Array<any> = [];
  public filterImages: Array<any> = [];
  public filterImageDone: boolean;
  public imageFilter: string;
  public currentImages: Array<any> = [];
  public imagePageIndex: number = 1;

  public nodePageIndex: number = 1;
  public currentNodes: Array<any> = [];
  public serverStatus: any = {};

  public filterNodeDone: boolean;
  public filterNodes: Array<any> = [];
  public nodeFilter: string;

  public pullImageModalOptions: any = {};
  public rmImageTarget: any;
  public rmImageModalOptions: any = {};

  public rmContainerTarget: any;
  public rmContainerModalOptions: any = {};
  public reAssignTarget: any;
  public reAssignConfirmModalOptions: any = {};

  public selectTag: string;
  public candidateTags: Array<any> = [];

  public upgradeContainerTarget: any;
  public upgradeContainerModalOptions: any = {};

  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    public _containerService: ContainerService,
    public _groupService: GroupService,
    public _imageService: ImageService,
    public _logService: LogService,
    public _clusterService: ClusterService,
    public _hubService: HubService
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
    this.upgradeContainerModalOptions = _.cloneDeep(modalCommonOptions);
    this.upgradeContainerModalOptions.title = 'Upgrade';
    this.upgradeContainerModalOptions.hideFooter = true;

    this.pullImageModalOptions = _.cloneDeep(modalCommonOptions);
    this.pullImageModalOptions.hideFooter = true;
    this.pullImageModalOptions.title = 'Pull Docker Image';

    this.rmImageModalOptions = _.cloneDeep(modalCommonOptions);

    this.reAssignConfirmModalOptions = _.cloneDeep(modalCommonOptions);

    this._route.params.forEach(params => {
      this.allInstanceIp = [];
      let groupId = params['groupId'];
      this.groupInfo.ID = groupId;
      this._groupService.getById(groupId).then(data => {
        this.groupInfo = data;
        this.activedTab = 'containers';
        this.getContainers();
        this.showServerStatus(true);
      });
    });
  }

  public getContainers() {
    this._clusterService
      .getClusterContainers(this.groupInfo.ID)
      .then(data => {
        data = data.Data.Containers || [];
        this.containers = _.sortBy(data, 'Config.Name');
        this.containers.forEach(item => {
          item.Containers = item.Containers || [];
          item.Containers = _.sortBy(item.Containers, ['IP', 'HostName']);
          item.IpTables = {};
          item.Running = 0;
          item.Stopped = 0;
          item.Containers.forEach((subItem: any) => {
            if (!item.IpTables[subItem.IP]) item.IpTables[subItem.IP] = { Running: 0, Stopped: 0 };
            let stateText = '';
            if (subItem.Container.Status.Running) {
              stateText = 'Running';
              item.IpTables[subItem.IP].Running++;
              item.Running++;
            } else {
              stateText = 'Stopped';
              item.IpTables[subItem.IP].Stopped++;
              item.Stopped++;
            }
            if (subItem.Container.Status.Restarting) {
              stateText = 'Restarting';
            }
            if (subItem.Container.Status.Paused) {
              stateText = 'Paused';
            }
            if (subItem.Container.Status.Dead) {
              stateText = 'Dead';
            }
            subItem.Container.Status.StatusText = stateText;
          });
        });
        this.filterContainer();
      })
      .catch(err => {
        messager.error(err.message || 'Get containers failed');
      });
  }

  public showServerStatus(silent: boolean = false) {
    this.serverStatus.Status = [];
    this._clusterService
      .getServerStatus(this.groupInfo.ID, silent, this.groupInfo)
      .then(data => {
        this.serverStatus.Status = data.Data.Engines;
        let unHealth = _.findIndex(this.serverStatus.Status, (x: any) => x.StateText !== 'Healthy');
        this.serverStatus.isHealth = unHealth === -1;
        this.filterNode();
      })
      .catch(err => {
        if (!silent) {
          messager.error(err);
        }
      });
  }

  public getAllInstanceIp() {
    if (this.allInstanceIp.length === 0) {
      this._clusterService
        .getServerStatus(this.groupInfo.ID, false, this.groupInfo)
        .then(data => {
          this.serverStatus.Status = data.Data.Engines;
          this.serverStatus.Status.forEach((container: any) => {
            let hasRepeated = !this.allInstanceIp.find((ip: any) => ip == container.IP || ip == container.HostName);
            if (hasRepeated) {
              this.allInstanceIp.push(container.IP || container.HostName);
            }
          });
          this.allInstanceIp = _.sortBy(this.allInstanceIp);
        })
        .catch(err => {
          messager.error(err || 'Get server info failed');
        });
    }
  }

  public changeTab(tab: string) {
    this.activedTab = tab;
    if (tab === 'containers' && this.containers.length === 0) {
      this.getContainers();
    }
    // if (tab === 'images' && this.images.length === 0) {
    //   this.getImages();
    // }
    // if (tab === 'service' && this.serviceInfo.length === 0) {
    //   this.getService();
    // }
  }

  public getImages(ip: any) {
    this.activedTab = 'images';
    this.ip = ip;
    this._imageService
      .getImages(ip, '123456')
      .then(data => {
        this.images = [];
        data.forEach((item: any) => {
          let isDuplicatedImage = item.RepoTags && item.RepoTags.length > 1;
          (item.RepoTags || []).forEach((repo: any) => {
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
          return regex.test(item.Config.Name);
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

  public getStatsCls(status: any) {
    let cls = 'success';
    if (status.Dead || !status.Running) {
      cls = 'danger';
    }
    if (status.Paused || status.Restarting) {
      cls = 'yellow';
    }
    return cls;
  }

  public operate(container: any, action: string) {
    this._clusterService
      .operate(container.MetaId, action)
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(
          `${action} container ${container.Config.Name} on ${this.groupInfo.Name}`,
          'Cluster',
          this.groupInfo.ID
        );
        this.getContainers();
      })
      .catch(err => {
        messager.error(err);
      });
  }

  public showReAssignConfirm(target: any) {
    this.reAssignTarget = target;
    this.reAssignConfirmModalOptions.show = true;
  }

  public reAssign() {
    messager.error('not implement');
  }

  public showRmContainerModal(container: any) {
    this.rmContainerTarget = container;
    this.rmContainerModalOptions.show = true;
  }

  public rmContainer() {
    this.rmContainerModalOptions.show = false;
    let name = this.rmContainerTarget.Config.Name;
    this._clusterService
      .deleteContainer(this.rmContainerTarget.MetaId)
      .then(data => {
        this._logService.addLog(`Deleted container ${name} on ${this.groupInfo.Name}`, 'Cluster', this.groupInfo.ID);
        this.getContainers();
      })
      .catch(err => {
        messager.error(err);
      });
  }

  public showUpgradeModal(target: any) {
    this.upgradeContainerTarget = target;
    this.selectTag = '';
    this.upgradeContainerModalOptions.formSubmitted = false;
    this.upgradeContainerModalOptions.show = true;
  }

  public upgrade(form: any) {
    this.upgradeContainerModalOptions.formSubmitted = true;
    if (form.invalid) return;
    let newImage = `${this.upgradeContainerTarget.Config.Image.split(':')[0]}:${form.value.newTag}`;
    this._clusterService
      .upgradeImage(this.upgradeContainerTarget.MetaId, form.value.newTag)
      .then(res => {
        messager.success('succeed');
        this.upgradeContainerModalOptions.show = false;
        this._logService.addLog(
          `Upgrade container ${this.upgradeContainerTarget.Config.Name} from ${
            this.upgradeContainerTarget.Config.Image
          } to ${newImage} on ${this.groupInfo.Name}`,
          'Cluster',
          this.groupInfo.ID
        );
        this.getContainers();
      })
      .catch(err => messager.error(err));
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
      this.setImagePage(1);
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
      .pullImage(this.ip, imageName, undefined, '123546')
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(`Pulled image ${imageName} on ${this.ip}`, 'Image', this.groupInfo.ID, this.ip);
        this.pullImageModalOptions.show = false;
        this.getImages(this.ip);
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
      .deleteImage(this.ip, id, '123456')
      .then(data => {
        messager.success('succeed');
        this._logService.addLog(
          `Deleted image ${this.rmImageTarget._repo} on ${this.ip}`,
          'Image',
          this.groupInfo.ID,
          this.ip
        );
        this.getImages(this.ip);
      })
      .catch(err => {
        messager.error(err.Detail || err);
      });
  }

  public filterNodeTimeout: any;
  public filterNode(value?: any) {
    this.nodeFilter = value || '';
    if (this.filterNodeTimeout) {
      clearTimeout(this.filterNodeTimeout);
    }
    this.filterNodeTimeout = setTimeout(() => {
      let keyWord = this.nodeFilter;
      if (!keyWord) {
        this.filterNodes = this.serverStatus.Status;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterNodes = this.serverStatus.Status.filter((item: any) => {
          return regex.test(`${item.Name} - ${item.IP}`);
        });
      }
      this.setNodePage(this.nodePageIndex);
      this.filterNodeDone = true;
    }, 100);
  }

  public setNodePage(pageIndex: number) {
    this.nodePageIndex = pageIndex;
    if (!this.filterNodes) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentNodes = this.filterNodes.slice(start, end);
  }
}
