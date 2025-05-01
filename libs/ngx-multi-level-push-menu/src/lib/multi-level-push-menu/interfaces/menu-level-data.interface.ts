import { MultiLevelPushMenuItem } from '../models';

/**
 * Represents the data structure for a menu level in the multi-level push menu
 */
export interface MenuLevelData {
  /** The DOM element representing this menu level */
  element: HTMLElement;
  /** The menu item data for this level */
  data: MultiLevelPushMenuItem;
  /** Optional parent element for nested levels */
  parent?: HTMLElement;
}
