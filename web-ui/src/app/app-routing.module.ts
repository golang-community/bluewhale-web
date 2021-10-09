import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./anno/anno.module').then((m) => m.AnnoModule) },
  {
    path: '',
    component: MainLayoutComponent,
    children: [{ path: 'group', loadChildren: () => import('./group/group.module').then((m) => m.GroupModule) }],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
