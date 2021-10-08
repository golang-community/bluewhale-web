import { Module } from '@nestjs/common';

import { AccountController } from './controllers/account.controller';
import { FaqController } from './controllers/faq.controller';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './services/group.service';

const controllers = [AccountController, FaqController, GroupController];
const services = [GroupService];

@Module({
  imports: [],
  controllers,
  providers: services,
})
export class AppModule {}
