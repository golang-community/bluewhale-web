import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { GroupService, ClusterService } from './../../../services';

declare let _: any;
declare let messager: any;

@Component({
	selector: 'cluster-node',
	templateUrl: 'cluster-node.html',
})

export class ClusterNodePage {

    public groupId: any;
    public ip: any;
    public groupInfo: any;
    public form: FormGroup;
    public nodeInfo: any = {};
    public submitted: boolean = false;

    public subscribers: Array<any> = [];

    constructor(
        public _fb: FormBuilder,
        public _clusterService: ClusterService,
        public _groupService: GroupService,
        public _route: ActivatedRoute,
        public _router: Router) {

      }

    ngOnInit(){
        let paramSub = this._route.params.subscribe(params => {
            this.groupId = params["groupId"];
            this.ip = params["ip"];
            this._groupService.getById(this.groupId)
            .then(data => {
              this.groupInfo = data;
              this._clusterService.getEnginesById(this.ip)
              .then(res => {
                this.nodeInfo = res.Data.Engine;
                this.buildForm(this.nodeInfo);
              })
            });
          });
          this.subscribers.push(paramSub);
    }

    public buildForm(data?: any){
        this.form = this._fb.group({
            Labels: this._fb.array([])
        })

        if (data.NodeLabels) {
          let control = <FormArray>this.form.controls['Labels'];
            for (let key in data.NodeLabels){
              control.push(this._fb.group({
                "Name": [`${key}`],
                "Value": [`${data.NodeLabels[key]}`]
              }));
            }
        }
    }

    public addLabel() {
        let control = <FormArray>this.form.controls['Labels'];
        control.push(this._fb.group({
          Name: [''],
          Value: ['']
        }));
      }

      public removeLabel(i: number) {
        let control = <FormArray>this.form.controls['Labels'];
        control.removeAt(i);
      }

      public onSubmit(form: any) {
        this.submitted = true;
        if (form.invalid) return;

        let formData = _.cloneDeep(this.form.value);
        let postLables = {};

        if (formData.Labels) {
          if (formData.Labels.length > 0) {
            formData.Labels.forEach((item: any) => {
              let key = item.Name;
              let value = item.Value;
              postLables[key] = value;
            })
          }
        }

        let postData =  {
          Server: this.ip,
          Labels: postLables
        }

        this._clusterService.setClusterNode(postData)
          .then((data) => {
            messager.success('save succeed');
          })
          .catch((err) => {
            messager.error(err || 'save failed');
          })
      }

    ngOnDestroy() {
        this.subscribers.forEach(item => item.unsubscribe());
      }

}
