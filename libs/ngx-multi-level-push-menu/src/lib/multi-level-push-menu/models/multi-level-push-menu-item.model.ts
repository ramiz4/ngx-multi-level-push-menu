export class MultiLevelPushMenuItem {
  constructor(
    public title?: string,
    public id?: string,
    public name?: string,
    public icon?: string,
    public link?: string,
    public items?: Array<MultiLevelPushMenuItem>
  ) {}
}
