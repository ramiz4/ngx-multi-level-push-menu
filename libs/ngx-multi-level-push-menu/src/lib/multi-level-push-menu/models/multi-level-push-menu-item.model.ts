export class MultiLevelPushMenuItem<TData = unknown> {
  constructor(
    public title?: string,
    public id?: string,
    public name?: string,
    public icon?: string,
    public link?: string,
    public items?: Array<MultiLevelPushMenuItem<TData>>,
    public disabled?: boolean,
    public ariaLabel?: string,
    public target?: '_self' | '_blank' | '_parent' | '_top' | string,
    public rel?: string,
    public data?: TData,
  ) {}
}
