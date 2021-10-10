import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsProviderModule } from './icons-provider.module';

// Ng-Zorro
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

const NgZorroModules = [NzMenuModule, NzIconModule, NzLayoutModule, NzPopoverModule, NzAvatarModule, NzDropDownModule];

@NgModule({
  imports: [CommonModule, RouterModule, IconsProviderModule, ...NgZorroModules],
  exports: [CommonModule, RouterModule, IconsProviderModule, ...NgZorroModules],
})
export class SharedModule {}
