import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// Ng-Zorro
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

const NgZorroModules = [NzMenuModule, NzIconModule, NzLayoutModule];

@NgModule({
  imports: [CommonModule, RouterModule, ...NgZorroModules],
  exports: [CommonModule, RouterModule, ...NgZorroModules],
})
export class SharedModule {}
