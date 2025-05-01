import { MultiLevelPushMenuItem } from '../multi-level-push-menu.model';

/**
 * Event emitted when a menu item is clicked
 */
export interface MenuItemClickEvent {
  item: MultiLevelPushMenuItem;
  event: MouseEvent;
  isSubmenu: boolean;
}