import { MultiLevelPushMenuItem } from './multi-level-push-menu-item.model';

export class MultiLevelPushMenu {
  constructor(
    public title?: string,
    public id?: string,
    public icon?: string,
    public items?: Array<MultiLevelPushMenuItem>
  ) { }
}