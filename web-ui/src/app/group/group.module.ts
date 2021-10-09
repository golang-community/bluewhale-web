import { NgModule } from '@angular/core';
import { GroupRoutingModule } from './group-routing.module';
import { GroupLayoutComponent } from './group-layout/group-layout.component';
import { ServerOverviewComponent } from './server-overview/server-overview.component';
import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [GroupLayoutComponent, ServerOverviewComponent],
  imports: [SharedModule, GroupRoutingModule],
})
export class GroupModule {}
