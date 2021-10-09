import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupRoutingModule } from './group-routing.module';
import { GroupLayoutComponent } from './group-layout/group-layout.component';
import { ServerOverviewComponent } from './server-overview/server-overview.component';

@NgModule({
  declarations: [GroupLayoutComponent, ServerOverviewComponent],
  imports: [CommonModule, RouterModule, GroupRoutingModule],
})
export class GroupModule {}
