import { NgModule } from '@angular/core';

import { SharedModule } from '../shared.module';
import { AnnoRoutingModule } from './anno-routing.module';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [LoginComponent],
  imports: [SharedModule, AnnoRoutingModule],
})
export class AnnoModule {}
