import {
  ANGLE_LEFT_SVG,
  ANGLE_RIGHT_SVG,
  MENU_BARS_SVG,
} from '../utilities/svg-icons';
import { MultiLevelPushMenuItem } from './multi-level-push-menu-item.model';

export class MultiLevelPushMenuOptions {
  /** JS array of menu items (if markup not provided) */
  public menu: MultiLevelPushMenuItem[] = [];

  /** Sliding layout. Cover replaces parents; overlap adds clickable ancestor rails. */
  public mode: 'cover' | 'overlap' = 'cover';

  /** Initialize menu in collapsed/expanded mode */
  public collapsed = false;

  /** Optional ID of the <nav> element and service command target. */
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

  /** Menu height as any valid CSS length. */
  public menuHeight: string | number = '100%';

  /** Text for 'Back' menu item */
  public backText = 'Back';

  /** CSS class for back menu item */
  public backItemClass = 'back-item';

  /** Icon used for back menu item - SVG content */
  public backItemIcon = ANGLE_LEFT_SVG;

  /** Icon used for menu items containing sub-items - SVG content */
  public groupIcon = ANGLE_RIGHT_SVG;

  /** Width of each ancestor rail as a number of pixels or CSS length. */
  public overlapWidth: string | number = 55;

  /** Legacy flag: `false` bypasses Angular Router interception for leaf links. */
  public preventItemClick = true;

  /** When true, group activation stops the original DOM event from bubbling. */
  public preventGroupItemClick = true;

  /** Visual and keyboard direction of the navigation. */
  public direction: 'ltr' | 'rtl' = 'ltr';

  /** Set to true to fully hide base level holder when collapsed */
  public fullCollapse = false;

  /** Swipe direction/device mode. `touchscreen`, `desktop` and `none` are legacy-compatible aliases. */
  public swipe: 'both' | 'left' | 'right' | 'touchscreen' | 'desktop' | 'none' =
    'both';

  /** Accessible label for the navigation landmark. */
  public ariaLabel = 'Main navigation';

  /** Collapse the menu after a leaf item successfully starts navigation. */
  public closeOnNavigation = false;

  /** Keep the active submenu path when the menu is collapsed and expanded. */
  public preserveActiveLevelOnCollapse = true;

  /** Maximum supported submenu depth. Guards against cyclic or malformed data. */
  public maxDepth = 50;

  /** Animation duration as milliseconds or a valid CSS time. */
  public animationDuration: string | number = 280;

  constructor(options?: Partial<MultiLevelPushMenuOptions>) {
    if (options) {
      // Apply provided options over defaults
      Object.assign(this, options);
    }
  }
}
