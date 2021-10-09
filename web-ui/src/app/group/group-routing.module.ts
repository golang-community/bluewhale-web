import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupLayoutComponent } from './group-layout/group-layout.component';
import { ServerOverviewComponent } from './server-overview/server-overview.component';

const routes: Routes = [
  { path: '', component: GroupLayoutComponent, children: [{ path: 'xxx', component: ServerOverviewComponent }] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupRoutingModule {}
