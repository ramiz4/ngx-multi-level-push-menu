import { ANGLE_LEFT_SVG, ANGLE_RIGHT_SVG, MENU_BARS_SVG } from '../utilities/svg-icons';
import { MultiLevelPushMenuItem } from './multi-level-push-menu-item.model';

export class MultiLevelPushMenuOptions {
  /** JS array of menu items (if markup not provided) */
  public menu: MultiLevelPushMenuItem[] = [];

  /**
   * Menu sliding mode: overlap/cover
   * 
   *  - `overlap` - menus are stacked on top of each other and visible at the same time
   *  - `cover` - menus are stacked on top of each other and only one is visible at a time
   * 
   * 
   * **Note:** `overlap` mode is not supported in mobile view
   * 
   * and will be automatically set to 'cover' if the screen width is less than 768px
   * 
   * 
   * **Issue:** `overlap` mode does not work as expected.
   * 
   * Consider using `cover` mode for a more reliable experience.
   * 
   * 
   * We are working on a fix for this issue.
   * */
  public mode: 'cover' | 'overlap' = 'cover';

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

  /** Menu title */
  public title?: string;

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

  /**
   * Direction of the menu:
   * 
   *  - `ltr` - left to right 
   *  - `rtl` - right to left
   *  - TODO: `auto` - auto-detect based on the browser's language setting
   * 
   * **Issue:** `rtl` mode does not work as expected.
   * 
   * We are working on a fix for this issue.
   */
  public direction: 'ltr' | 'rtl' = 'ltr';

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
