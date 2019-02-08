import { ContainerListPage } from './container-list/container-list.page';
import { ContainerDetailPage } from './container-detail/container-detail.page';
import { ServerDetailPage } from './server-detail/server-detail.page';
import { ContainerNewPage } from './container-new/container-new.page';
import { ComponentNewPage } from './component-new/component-new.page';
import { ContainerClonePage } from './container-clone/container-clone.page';
import { ContainerMonitorPage } from './container-monitor/container-monitor.page';
import { ContainerLogPage } from './container-log/container-log.page';

export * from './container-list/container-list.page';
export * from './container-detail/container-detail.page';
export * from './server-detail/server-detail.page';
export * from './container-new/container-new.page';
export * from './component-new/component-new.page';
export * from './container-clone/container-clone.page';
export * from './container-monitor/container-monitor.page';
export * from './container-log/container-log.page';

export const SERVERPAGES: Array<any> = [
  ContainerListPage,
  ContainerDetailPage,
  ServerDetailPage,
  ContainerNewPage,
  ComponentNewPage,
  ContainerClonePage,
  ContainerMonitorPage,
  ContainerLogPage
]
