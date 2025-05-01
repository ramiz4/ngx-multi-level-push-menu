export class MultiLevelPushMenuOptions {
  /** JS array of menu items (if markup not provided) */
  public menu: MultiLevelPushMenuItem[] = [];

  /** Menu sliding mode: overlap/cover */
  public mode = 'cover';

  /** Initialize menu in collapsed/expanded mode */
  public collapsed = false;

  /** ID of <nav> element */
  public menuID?: string;

  /** Wrapper CSS class */
  public wrapperClass?: string;

  /** CSS class for inactive wrappers */
  public menuInactiveClass?: string;

  /** Wrapper width (integer, '%', 'px', 'em') */
  public menuWidth: string | number = '300px';

  /** Menu title default icon */
  public titleIcon = 'fa fa-bars';

  /** Menu height (integer, '%', 'px', 'em') */
  public menuHeight?: string;

  /** Text for 'Back' menu item */
  public backText = 'Back';

  /** CSS class for back menu item */
  public backItemClass = 'back-item';

  /** FontAwesome icon used for back menu item */
  public backItemIcon = 'fa fa-angle-right';

  /** FontAwesome icon used for menu items containing sub-items */
  public groupIcon = 'fa fa-angle-left';

  /** Width in px of menu wrappers overlap */
  public overlapWidth = '55';

  /** Set to false if you do not need event callback functionality per item click */
  public preventItemClick = true;

  /** Set to false if you do not need event callback functionality per group item click */
  public preventGroupItemClick = true;

  /** Set to 'rtl' for reverse sliding direction */
  public direction = 'ltr';

  /** Set to true to fully hide base level holder when collapsed */
  public fullCollapse = false;

  /** Direction to enable swipe: 'both', 'left', 'right' */
  public swipe: 'both' | 'left' | 'right' = 'both';

  constructor(options?: Partial<MultiLevelPushMenuOptions>) {
    if (options) {
      // Apply provided options over defaults
      Object.assign(this, options);
    }
  }
}

export class MultiLevelPushMenu {
  constructor(
    public title?: string,
    public id?: string,
    public icon?: string,
    public items?: Array<MultiLevelPushMenuItem>
  ) { }
}

export class MultiLevelPushMenuItem {
  constructor(
    public title?: string,
    public id?: string,
    public name?: string,
    public icon?: string,
    public link?: string,
    public items?: Array<MultiLevelPushMenuItem>
  ) { }
}
