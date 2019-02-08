import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { ContainerService, GroupService, LogService, ClusterService } from './../../../services';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-cluster-container-edit',
  templateUrl: './container-edit.html',
  styleUrls: ['./container-edit.css']
})
export class ClusterContainerEditPage {

  public groupInfo: any;
  public selectedGroup: any;
  public selectedGroupId: any;
  public clusterGroups: Array<any>;
  public isNew: boolean;
  public isClone: boolean;
  public isEdit: boolean;
  public metaId: string;

  public form: FormGroup;
  public submitted: boolean = false;

  public subscribers: Array<any> = [];

  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    public _fb: FormBuilder,
    public _containerService: ContainerService,
    public _groupService: GroupService,
    public _clusterService: ClusterService,
    public _logService: LogService) {

  }

  ngOnInit() {
    this.isNew = !!this._route.snapshot.data['IsNew'];
    this.isClone = !!this._route.snapshot.data['IsClone'];
    this.isEdit = !!this._route.snapshot.data['IsEdit'];
    let paramSub = this._route.params.subscribe(params => {
      let groupId = params["groupId"];
      this.metaId = params["metaId"];
      this.groupInfo = { ID: groupId };
      this._groupService.get(false, 'cluster')
        .then(data => {
          this.groupInfo = _.find(data, (item: any) => item.ID === groupId);
          this.clusterGroups = data;
          this.selectedGroupId = '';
          if (this.isNew) {
            this.buildForm({});
          } else {
            this._clusterService.getContainerMataInfo(this.metaId)
              .then(res => {
                let containerConfig = res.Data.MetaBase;
                this.buildForm(containerConfig);
              })
              .catch(err => {
                messager.error(err);
                this._router.navigate(['/cluster', groupId, 'overview']);
              });
          }
        });
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  public buildForm(data?: any) {
    this.form = this._fb.group({
      Name: [{ value: (data.Name || ''), disabled: (this.isEdit) }],
      Image: [(data.Image || '')],
      Command: [data.Command || ''],
      HostName: [data.HostName || ''],
      NetworkMode: [data.NetworkMode || 'host'],
      RestartPolicy: [data.RestartPolicy || 'no'],
      Ports: this._fb.array([]),
      Volumes: this._fb.array([]),
      Envs: this._fb.array([]),
      Links: this._fb.array([]),
      EnableLogFile: data.LogConfig ? (data.LogConfig.Type ? 1 : 0) : 0,
      Labels: this._fb.array([]),
      Ulimits: this._fb.array([]),
      LogDriver: data.LogConfig ? (data.LogConfig.Type  || 'json-file') : 'json-file',
      LogOpts: this._fb.array([]),
      Dns: [data.Dns],
      CPUShares: data.CPUShares === 0 ? '' : data.CPUShares,
      Memory: data.Memory === 0 ? '' : data.Memory,
      IsRemoveDelay: (data.IsRemoveDelay === true || data.IsRemoveDelay === undefined) ? true : false,
      WebHooks: this._fb.array([]),
      Instances: [data.Instances ? data.Instances : (data.Instances === 0 ? 0 : '')],
      Constraints: this._fb.array([])
    });

    if (!this.isNew) {
      if (data.RestartPolicy === 'on-failure') {
        let tempCtrl = new FormControl(data.RestartRetryCount);
        this.form.addControl('RestartRetryCount', tempCtrl);
      }

      if (data.NetworkMode !== 'host' && data.Ports.length > 0) {
        let portsCtrl = <FormArray>this.form.controls['Ports'];
        data.Ports.forEach((item: any) => {
          portsCtrl.push(this._fb.group({
            PrivatePort: [item.PrivatePort],
            Type: [item.Type || 'tcp'],
            PublicPort: [item.PublicPort === 0 ? '' : item.PublicPort],
            IP: [item.Ip]
          }))
        });
      }

      if (data.Volumes) {
        let volumeCtrl = <FormArray>this.form.controls['Volumes'];
        data.Volumes.forEach((item: any) => {
          volumeCtrl.push(this._fb.group({
            ContainerVolume: item.ContainerVolume,
            HostVolume: item.HostVolume
          }));
        });
      }

      if (data.Links) {
        let control = <FormArray>this.form.controls['Links'];
        data.Links.forEach((item: any) => {
          control.push(this._fb.group({
            "Value": [item]
          }));
        })
      }

      if (data.Labels) {
        let control = <FormArray>this.form.controls['Labels'];
          for (let key in data.Labels){
            control.push(this._fb.group({
              "Value": [`${key}:${data.Labels[key]}`]
            }));
          }
      }

      if (data.Ulimits) {
        let control = <FormArray>this.form.controls['Ulimits'];
        data.Ulimits.forEach((item: any) => {
          control.push(this._fb.group({
            "Name": [item['Name']],
            "Soft": [item['Soft']],
            "Hard": [item['Hard']]
          }));
        })
      }

      if (data.Env && data.Env.length > 0) {
        let envCtrl = <FormArray>this.form.controls['Envs'];
        data.Env.forEach((item: any) => {
          envCtrl.push(this._fb.group({
            "Value": [item]
          }));
        });
      }

      if (data.WebHooks && data.WebHooks.length > 0) {
        let hooksCtrl = <FormArray>this.form.controls['WebHooks'];
        data.WebHooks.forEach((item: any) => {
          hooksCtrl.push(this._fb.group({
            Url: item.Url,
            SecretToken: item.SecretToken
          }));
        });
      }

      if (data.Placement) {
        if(data.Placement.Constraints && data.Placement.Constraints.length > 0){
          let equalRegExp = new RegExp('==');
          let NotEqualRegExp = new RegExp('!=');
          let constraintsCtrl = <FormArray>this.form.controls['Constraints'];
          data.Placement.Constraints.forEach((item: any) => {
            let constraintArr, name, equal, value;
            if(equalRegExp.test(item)){
              constraintArr = item.split('==');
              equal = '==';
            }
            if(NotEqualRegExp.test(item)){
              constraintArr = item.split('!=');
              equal = '!=';
            }
            name = constraintArr[0];
            value = constraintArr[1];
            constraintsCtrl.push(this._fb.group({
              Name: [name],
              Equal: [equal],
              Value: [value]
            }));
          });
        }
      }

      if(data.LogConfig){
        if(data.LogConfig.Config){
          let cloneOptsArr = [];
          for(let key in data.LogConfig.Config){
            cloneOptsArr.push(`${key}=${data.LogConfig.Config[key]}`)
          }
          let control = <FormArray>this.form.controls['LogOpts'];
          cloneOptsArr.forEach((item: any) => {
            control.push(this._fb.group({
              "Value": [item]
            }));
          })
        }
      }

      if (this.isClone) {
        this.form.controls['Name'].setValue('');
      }
    }else{
      let control = <FormArray>this.form.controls['LogOpts'];
      control.push(this._fb.group({
        "Value": ['max-size=10m']
      }));
      control.push(this._fb.group({
        "Value": ['max-file=3']
      }));
    }

    let restartSub = this.form.controls['RestartPolicy'].valueChanges.subscribe(value => {
      if (value === 'on-failure') {
        let control = new FormControl('');
        this.form.addControl('RestartRetryCount', control);
      } else {
        this.form.removeControl('RestartRetryCount');
      }
    });
    this.subscribers.push(restartSub);

    let logConfigSub = this.form.controls['EnableLogFile'].valueChanges.subscribe(value => {
      if(value){
        let logDriverCtrol = new FormControl('json-file');
        this.form.addControl('LogDriver', logDriverCtrol);

        let logOptsCtrl = this._fb.array([]);
        this.form.addControl('LogOpts', logOptsCtrl);
      }else{
        this.form.removeControl('LogDriver');
        this.form.removeControl('LogOpts');
      }
    })
    this.subscribers.push(logConfigSub);

    let networkModeSub = this.form.controls['NetworkMode'].valueChanges.subscribe(value => {
      if (value === 'host') {
        this.form.removeControl('HostName');
        this.form.removeControl('Ports');
      } else {
        let hostNameCtrl = new FormControl('');
        this.form.addControl('HostName', hostNameCtrl);

        let portBindingCtrl = this._fb.array([]);
        this.form.addControl('Ports', portBindingCtrl);
      }
      if (value === "custom") {
        let networkNameCtrl = new FormControl('');
        this.form.addControl('NetworkName', networkNameCtrl);
      } else {
        this.form.removeControl('NetworkName');
      }
    });
    this.subscribers.push(networkModeSub);
  }

  public selectedGroupChange(id: string) {
    this.selectedGroupId = id;
    this.selectedGroup = _.find(this.clusterGroups, (item: any) => item.ID === id);
  }

  public addPortBinding() {
    let control = <FormArray>this.form.controls['Ports'];
    control.push(this._fb.group({
      PrivatePort: [''],
      Type: ['tcp'],
      PublicPort: [''],
      IP: ['0.0.0.0']
    }));
  }

  public removePortBinding(i: number) {
    let control = <FormArray>this.form.controls['Ports'];
    control.removeAt(i);
  }

  public addVolumeBinding() {
    let control = <FormArray>this.form.controls['Volumes'];
    control.push(this._fb.group({
      ContainerVolume: [''],
      HostVolume: ['']
    }));
  }

  public removeVolumeBinding(i: number) {
    let control = <FormArray>this.form.controls['Volumes'];
    control.removeAt(i);
  }

  public addEnv() {
    let control = <FormArray>this.form.controls['Envs'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  public removeEnv(i: number) {
    let control = <FormArray>this.form.controls['Envs'];
    control.removeAt(i);
  }

  public addLink() {
    let control = <FormArray>this.form.controls['Links'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  public removeLink(i: number) {
    let control = <FormArray>this.form.controls['Links'];
    control.removeAt(i);
  }

  public addLogOpt() {
    let control = <FormArray>this.form.controls['LogOpts'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  public removeLogOpt(i: number) {
    let control = <FormArray>this.form.controls['LogOpts'];
    control.removeAt(i);
  }

  public addLabel() {
    let control = <FormArray>this.form.controls['Labels'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  public removeLabel(i: number) {
    let control = <FormArray>this.form.controls['Labels'];
    control.removeAt(i);
  }

  public addUlimit() {
    let control = <FormArray>this.form.controls['Ulimits'];
    control.push(this._fb.group({
      Name: [''],
      Soft: [''],
      Hard: ['']
    }));
  }

  public removeUlimit(i: number) {
    let control = <FormArray>this.form.controls['Ulimits'];
    control.removeAt(i);
  }

  public removeWebhook(index: number) {
    let hooksCtrl = <FormArray>this.form.controls['WebHooks'];
    hooksCtrl.removeAt(index);
  }

  public addWebhook() {
    let hooksCtrl = <FormArray>this.form.controls['WebHooks'];
    hooksCtrl.push(this._fb.group({
      Url: '',
      SecretToken: ''
    }));
  }

  public addConstraint() {
    let constraintsCtrl = <FormArray>this.form.controls['Constraints'];
    constraintsCtrl.push(this._fb.group({
      Name: [''],
      Equal: ['=='],
      Value: ['']
    }));
  }

  public removeConstraint(index: number) {
    let constraintsCtrl = <FormArray>this.form.controls['Constraints'];
    constraintsCtrl.removeAt(index);
  }

  public onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    let formData = _.cloneDeep(this.form.value);

    let optsObj = {};
    let postLables = {};
    let constraintsData = [];
    if(this.form.controls.EnableLogFile.value){
      let optsArr = (formData.LogOpts || []).map((item: any) => item.Value);
      optsArr.forEach((item: any) => {
        let splitArr = item.split('=');
        optsObj[splitArr[0]] = splitArr[1];
      })
    }

    if (formData.Labels) {
      if (formData.Labels.length > 0) {
        formData.Labels.forEach((item: any) => {
          let key = item.Value.split(":")[0];
          let value = item.Value.split(":")[1];
          postLables[key] = value;
        })
      }
    }

    if (formData.WebHooks.length > 0) {
      let temp = {};
      let duplicates: Array<any> = [];
      formData.WebHooks.forEach((item: any) => {
        let url = item.Url.toLowerCase();
        if (!temp[url]) temp[url] = 0;
        temp[url]++;
        if (temp[url] === 2) {
          duplicates.push(item.Url);
        }
      });
      if (duplicates.length > 0) {
        messager.error(`You cann't add duplicate url [${duplicates}] to webhook.`);
        return;
      }
    }

    if(formData.Constraints){
      constraintsData =  formData.Constraints.map((item: any) => {
        return `${item.Name}${item.Equal}${item.Value}`;
      })
    }

    let customerPort = _.findIndex(formData.Ports, (item: any) => {
      return item.PublicPort > 0;
    });

    if (this.isClone && !this.selectedGroup) {
      messager.error('Target group cannot be null');
      return;
    }

    let config: any = {
      WebHooks: formData.WebHooks,
      Instances: formData.Instances,
      Option:{
        IsRemoveDelay: !!formData.IsRemoveDelay
      },
      Placement: {
        Constraints: constraintsData
      }
    };
    if (this.isNew || this.isClone || this.isEdit) {
      let containerConfig: any = {
        Name: this.form.controls.Name.value,
        Image: formData.Image,
        Command: formData.Command,
        HostName: formData.HostName,
        NetworkMode: formData.NetworkMode === 'custom' ? formData.NetworkName : formData.NetworkMode,
        RestartPolicy: formData.RestartPolicy,
        RestartRetryCount: formData.RestartRetryCount,
        Ports: (formData.Ports || []).map((item: any) => {
          item.PublicPort = item.PublicPort || 0;
          return item;
        }),
        Volumes: formData.Volumes,
        Env: (formData.Envs || []).map((item: any) => item.Value),
        Dns: formData.Dns,
        Links: [],
        Labels: postLables || {},
        CPUShares: formData.CPUShares || 0,
        Memory: formData.Memory || 0
      };
      if(this.form.controls.EnableLogFile.value){
        containerConfig.LogConfig = {
          Type: formData.LogDriver,
          Config: optsObj
        }
      }
      if (formData.Ulimits.length > 0) {
        containerConfig.Ulimits = formData.Ulimits;
      }
      config.Config = containerConfig;
      if(this.isNew || this.isClone) {
        config.GroupId = this.isClone ? this.selectedGroupId : this.groupInfo.ID;
        let postGroupInfo = this.isClone ? this.selectedGroup : this.groupInfo;
        this._clusterService.addContainer(config)
          .then(res => {
            messager.success('Create Succeed!');
            this._router.navigate(['/cluster', this.groupInfo.ID, 'overview']);
          })
          .catch(err => messager.error(err));
      } else {
        config.MetaId = this.metaId;
        this._clusterService.updateContainer(config)
          .then(res => {
            messager.success('Update Succeed!');
            this._router.navigate(['/cluster', this.groupInfo.ID, 'containers', this.metaId, 'info']);
          })
          .catch(err => messager.error(err));
      }
    }
  }
}
