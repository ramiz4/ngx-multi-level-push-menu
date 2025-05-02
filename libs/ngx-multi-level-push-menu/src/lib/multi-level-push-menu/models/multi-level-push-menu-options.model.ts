import { MultiLevelPushMenuItem } from './multi-level-push-menu-item.model';
import { ANGLE_LEFT_SVG, ANGLE_RIGHT_SVG, MENU_BARS_SVG } from '../utilities/svg-icons';

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

  /** Menu title default icon - SVG content */
  public titleIcon = MENU_BARS_SVG;

  /** Menu height (integer, '%', 'px', 'em') */
  public menuHeight?: string;

  /** Text for 'Back' menu item */
  public backText = 'Back';

  /** CSS class for back menu item */
  public backItemClass = 'back-item';

  /** Icon used for back menu item - SVG content */
  public backItemIcon = ANGLE_RIGHT_SVG;

  /** Icon used for menu items containing sub-items - SVG content */
  public groupIcon = ANGLE_LEFT_SVG;

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
