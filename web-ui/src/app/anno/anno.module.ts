import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';

import { AnnoRoutingModule } from './anno-routing.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, AnnoRoutingModule],
})
export class AnnoModule {}
