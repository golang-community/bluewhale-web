import { Component, Renderer } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ComposeService, GroupService, FileUploader } from '../../../../services';
import { Router, ActivatedRoute } from '@angular/router';

import * as jsYaml from 'js-yaml';
import * as fileSaver from 'file-saver';

declare let messager: any;

@Component({
  selector: 'hb-component-new',
  styleUrls: ['./compose-new.css'],
  templateUrl: './component-new.html'
})
export class ComponentNewPage {
  public form: FormGroup;
  public _editors: any = {};
  public configInfo: any;
  public composeDataError: any;
  public submitted: boolean = false;
  public ip: any;
  public groupInfo: any;
  public groupId: any;
  public inputValue: any;
  public isSaveCheck: boolean;
  public dockerEngineVersion: any;
  public subscribers: Array<any> = [];

  constructor(
    public _router: Router,
    public _fileUploader: FileUploader,
    public _route: ActivatedRoute,
    public _composeService: ComposeService,
    public _groupService: GroupService,
    public _renderer: Renderer,
    public _fb: FormBuilder
  ) {}

  public buildForm() {
    this.form = this._fb.group({
      Name: '',
      EnablePackageFile: 0,
      Data: '',
      EnableUploadYaml: 0
    });
  }

  aceLoaded(editor: any, env: string) {
    this._editors[env] = editor;
    editor.$blockScrolling = Infinity;
  }

  public changeValue() {}

  public readerFile(reader: any): any {
    let self = this;
    reader.onload = function(event: any) {
      self.form.controls['Data'].setValue(event.target.result);
    };
  }

  selectedFileOnChanged(value: any) {
    if (value) {
      if (event.target && value.target.files.length > 0) {
        let file = value.target.files[0];
        let reader = new FileReader();
        this.readerFile(reader);
        reader.readAsText(file);
      }
    }
  }

  ngOnInit() {
    let paramSub = this._route.params.subscribe(params => {
      this.ip = params['ip'];
      this.groupId = params['groupId'];
      this.dockerEngineVersion = params['serverversion'];
      // this.groupInfo = { ID: groupId };
      // this._groupService.getById(groupId)
      //   .then(data => {
      //     this.groupInfo = data;
      //   });
    });
    this.subscribers.push(paramSub);
    this.buildForm();
    this.configInfo = {
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
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  public showFullScreen(env: string, container: HTMLDivElement) {
    let isFullScreen = container.classList.contains('full-screen');
    let editor = this._editors[env];
    if (editor) {
      this._renderer.setElementStyle(document.body, 'overflow-y', isFullScreen ? 'auto' : 'hidden');
      this._renderer.setElementClass(container, 'full-screen', !isFullScreen);
      editor.resize();
    }
  }

  public showExample(value: any) {
    this._composeService.getComposeExample().then(data => {
      this.form.controls['Data'].setValue(data);
    });
  }

  public checkComposeData(isSave: any) {
    if (this.form.value.Data) {
      try {
        let doc = jsYaml.safeLoad(this.form.value.Data);
        if (doc) {
          this.composeDataError = 'succeed';
        } else {
          this.composeDataError = '';
        }
      } catch (e) {
        this.composeDataError = e.message;
      }
      if (isSave) {
        this.isSaveCheck = true;
      } else {
        this.isSaveCheck = false;
      }
    }
  }

  packageFileOnChanged(value: any) {
    if (value) {
      if (value.target && value.target.files.length > 0) {
        this.inputValue = value.target.files[0];
      } else {
        this.inputValue = '';
      }
    } else {
      this.inputValue = '';
    }
  }

  public onSubmit() {
    this.submitted = true;
    let form = this.form;
    if (form.invalid) return;
    this.checkComposeData(true);
    if (this.composeDataError && this.composeDataError !== 'succeed') return;
    if (this.inputValue && form.controls.EnablePackageFile.value) {
      this._fileUploader
        .upload(
          `http://${this.ip}:8500/dockerapi/v2/services/${form.controls.Name.value}/upload?filename=${
            this.inputValue.name
          }`,
          this.inputValue,
          { disableLoading: false }
        )
        .then((res: any) => {
          let config: any = {
            Name: form.value.Name,
            ComposeData: `${form.value.Data}`,
            packagefile: JSON.parse(res).PackageFile
          };
          this._composeService
            .addCompose(this.ip, JSON.parse(JSON.stringify(config)), '123456')
            .then(data => {
              this._router.navigate(['/group', this.groupId, this.ip, 'overview']);
            })
            .catch(err => messager.error(err.Detail || err));
        })
        .catch(err => {
          messager.error(err.message || 'Upload file failed');
        });
    } else {
      let config: any = {
        Name: form.value.Name,
        ComposeData: `${form.value.Data}`
      };
      this._composeService
        .addCompose(this.ip, JSON.parse(JSON.stringify(config)), '123456')
        .then(data => {
          this._router.navigate(['/group', this.groupId, this.ip, 'overview']);
        })
        .catch(err => messager.error(err.Detail || err));
    }
  }
}