import { Injectable, Renderer2 } from '@angular/core';
import {
  MultiLevelPushMenuItem,
  MultiLevelPushMenuOptions,
} from '../multi-level-push-menu.model';
import { MenuUtils } from '../utilities/menu-utils';

// Content padding constant
const CONTENT_PADDING = 20;

@Injectable()
export class MenuDomService {
  /**
   * Sets the content position and width based on the menu width
   */
  public setContentPositionAndWidth(
    renderer: Renderer2,
    contentElement: HTMLElement,
    menuWidth: string
  ): void {
    renderer.setStyle(
      contentElement,
      'left',
      `calc(${menuWidth} + ${CONTENT_PADDING}px)`
    );
    renderer.setStyle(
      contentElement,
      'width',
      `calc(100% - (${menuWidth} + ${CONTENT_PADDING}px))`
    );
  }

  /**
   * Pushes the content element by the specified amount
   */
  public pushContent(
    renderer: Renderer2,
    contentElement: HTMLElement,
    amount: number,
    menuWidth: string
  ): void {
    if (!contentElement) return;

    const menuWidthPx = MenuUtils.parseSize(menuWidth);
    const totalPush = menuWidthPx + amount + CONTENT_PADDING;

    renderer.setStyle(contentElement, 'left', `${totalPush}px`);
    renderer.setStyle(contentElement, 'width', `calc(100% - ${totalPush}px)`);
  }

  /**
   * Creates and appends a level title to a level holder
   */
  public appendLevelTitle(
    renderer: Renderer2,
    levelHolder: HTMLElement,
    menuData: MultiLevelPushMenuItem,
    options: MultiLevelPushMenuOptions,
    titleClickHandler: (event: MouseEvent) => void
  ): void {
    const title = renderer.createElement('h2');
    renderer.addClass(title, 'title');
    renderer.appendChild(title, renderer.createText(menuData.title || ''));

    // Add title icon if exists
    if (menuData.icon) {
      this.appendTitleIcon(
        renderer,
        title,
        menuData.icon,
        options,
        titleClickHandler
      );
    }

    renderer.appendChild(levelHolder, title);
  }

  /**
   * Creates and appends an icon to a title element
   */
  private appendTitleIcon(
    renderer: Renderer2,
    titleElement: HTMLElement,
    iconClasses: string,
    options: MultiLevelPushMenuOptions,
    clickHandler: (event: MouseEvent) => void
  ): void {
    const titleIcon = renderer.createElement('i');

    // Add icon classes
    iconClasses.split(' ').forEach((className) => {
      if (className) renderer.addClass(titleIcon, className);
    });

    // Add positioning classes
    renderer.addClass(
      titleIcon,
      options.direction === 'rtl' ? 'floatLeft' : 'floatRight'
    );
    renderer.addClass(titleIcon, 'cursorPointer');

    // Apply styles
    const floatDirection = options.direction === 'rtl' ? 'left' : 'right';
    renderer.setStyle(titleIcon, 'float', floatDirection);
    renderer.setStyle(titleIcon, 'cursor', 'pointer');

    // Add click listener
    renderer.listen(titleIcon, 'click', clickHandler);

    renderer.appendChild(titleElement, titleIcon);
  }

  /**
   * Appends an icon to a menu item
   */
  public appendItemIcon(
    renderer: Renderer2,
    anchor: HTMLElement,
    iconClasses: string,
    isRtl: boolean
  ): void {
    const itemIcon = renderer.createElement('i');

    // Add icon classes
    iconClasses.split(' ').forEach((className) => {
      if (className) renderer.addClass(itemIcon, className);
    });

    renderer.addClass(itemIcon, 'anchor-icon');

    // Set float direction based on RTL setting
    const floatDirection = isRtl ? 'left' : 'right';
    renderer.setStyle(itemIcon, 'float', floatDirection);

    renderer.appendChild(anchor, itemIcon);
  }

  /**
   * Creates a group icon for submenu items
   */
  public createGroupIcon(
    renderer: Renderer2,
    groupIconClass: string,
    isRtl: boolean
  ): HTMLElement {
    const groupIcon = renderer.createElement('i');

    // Add icon classes
    groupIconClass.split(' ').forEach((className) => {
      if (className) renderer.addClass(groupIcon, className);
    });

    // Add positioning styles
    renderer.setStyle(groupIcon, 'float', isRtl ? 'right' : 'left');
    renderer.setStyle(
      groupIcon,
      'padding',
      isRtl ? '0 0 0 .6em' : '0 .6em 0 0'
    );

    return groupIcon;
  }

  /**
   * Creates and appends a back icon to a back anchor
   */
  public appendBackIcon(
    renderer: Renderer2,
    backAnchor: HTMLElement,
    iconClasses: string,
    isRtl: boolean
  ): void {
    const backIcon = renderer.createElement('i');

    // Add icon classes
    iconClasses.split(' ').forEach((className) => {
      if (className) renderer.addClass(backIcon, className);
    });

    // Set float based on direction
    const floatDirection = isRtl ? 'left' : 'right';
    renderer.setStyle(backIcon, 'float', floatDirection);

    renderer.appendChild(backAnchor, backIcon);
  }

  /**
   * Clears a menu container
   */
  public clearMenu(renderer: Renderer2, menuContainer: HTMLElement): void {
    if (!menuContainer) return;

    while (menuContainer.firstChild) {
      renderer.removeChild(menuContainer, menuContainer.firstChild);
    }
  }
}
