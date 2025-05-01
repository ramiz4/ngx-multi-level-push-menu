import { MultiLevelPushMenuItem } from '../models';

/**
 * Event emitted when a menu item is clicked
 */
export interface MenuItemClickEvent {
  item: MultiLevelPushMenuItem;
  event: MouseEvent;
  isSubmenu: boolean;
}