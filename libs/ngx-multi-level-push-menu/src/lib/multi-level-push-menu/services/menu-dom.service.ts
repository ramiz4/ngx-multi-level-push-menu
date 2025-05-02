import { Injectable, Renderer2 } from '@angular/core';
import { MultiLevelPushMenuItem, MultiLevelPushMenuOptions } from '../models';
import { MenuUtils } from '../utilities/menu-utils';

/**
 * Convert menuWidth to string to ensure consistent usage
 */
/**
 * Checks if a string contains a valid CSS unit
 */
function hasValidCssUnit(value: string): boolean {
  const cssUnits = [
    'px',
    'em',
    'rem',
    '%',
    'vh',
    'vw',
    'vmin',
    'vmax',
    'cm',
    'mm',
    'in',
    'pt',
    'pc',
    'ex',
    'ch',
  ];
  return cssUnits.some((unit) => value.endsWith(unit));
}

/**
 * Convert menuWidth to string to ensure consistent usage
 */
function ensureMenuWidthString(value: string | number): string {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  if (!hasValidCssUnit(value)) {
    return `${value}px`;
  }
  return value;
}

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
    menuWidth: string | number
  ): void {
    const menuWidthStr = ensureMenuWidthString(menuWidth);
    renderer.setStyle(
      contentElement,
      'left',
      `calc(${menuWidthStr} + ${CONTENT_PADDING}px)`
    );
    renderer.setStyle(
      contentElement,
      'width',
      `calc(100% - (${menuWidthStr} + ${CONTENT_PADDING}px))`
    );
  }

  /**
   * Pushes the content element by the specified amount
   */
  public pushContent(
    renderer: Renderer2,
    contentElement: HTMLElement,
    amount: number,
    menuWidth: string | number
  ): void {
    if (!contentElement) return;

    const menuWidthStr = ensureMenuWidthString(menuWidth);
    const menuWidthPx = MenuUtils.parseSize(menuWidthStr);
    const totalPush = menuWidthPx + amount + CONTENT_PADDING;

    renderer.setStyle(contentElement, 'left', `${totalPush}px`);
    renderer.setStyle(contentElement, 'width', `calc(100% - ${totalPush}px)`);
  }

  /**
   * Checks if a string is SVG content by looking for opening and closing SVG tags
   */
  private isSvgContent(iconContent: string): boolean {
    return (
      typeof iconContent === 'string' &&
      iconContent.trim().startsWith('<svg') &&
      iconContent.trim().endsWith('</svg>')
    );
  }

  /**
   * Creates an icon element - either an SVG element or a CSS icon (i tag)
   */
  private createIconElement(
    renderer: Renderer2,
    iconContent: string
  ): HTMLElement {
    if (this.isSvgContent(iconContent)) {
      // Create span to hold the SVG
      const iconSpan = renderer.createElement('span');
      renderer.addClass(iconSpan, 'svg-icon');
      
      // Use innerHTML to set the SVG content
      iconSpan.innerHTML = iconContent;
      return iconSpan;
    } else {
      // For backward compatibility - create a CSS icon
      const iconElement = renderer.createElement('i');
      
      // Add CSS classes
      iconContent.split(' ').forEach((className) => {
        if (className) renderer.addClass(iconElement, className);
      });
      
      return iconElement;
    }
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

    // Add level specific class to create visual hierarchy
    const level = levelHolder.getAttribute('data-level');
    if (level && parseInt(level, 10) > 0) {
      renderer.addClass(title, 'submenu-title');
    }

    // Create a span element to contain title text for better overflow handling
    const titleTextSpan = renderer.createElement('span');
    renderer.appendChild(
      titleTextSpan,
      renderer.createText(menuData.title || '')
    );
    renderer.appendChild(title, titleTextSpan);

    // Add title icon if exists
    if (menuData.icon) {
      this.appendTitleIcon(
        renderer,
        title,
        menuData.icon,
        options,
        titleClickHandler,
        level !== null && parseInt(level, 10) > 0
      );
    } else {
      // Add default icon if no icon is provided
      this.appendTitleIcon(
        renderer,
        title,
        options.titleIcon,
        options,
        titleClickHandler,
        level !== null && parseInt(level, 10) > 0
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
    iconContent: string,
    options: MultiLevelPushMenuOptions,
    clickHandler: (event: MouseEvent) => void,
    isSubmenu = false
  ): void {
    if (isSubmenu) {
      // Create <div> wrapper for submenu title icon
      const divWrapper = renderer.createElement('div');
      renderer.addClass(divWrapper, 'menu-icon-container');

      // Create icon element
      const titleIcon = this.createIconElement(renderer, iconContent);
      
      // Append icon to wrapper
      renderer.appendChild(divWrapper, titleIcon);
      renderer.appendChild(titleElement, divWrapper);
    } else {
      // Create <button> wrapper for main title icon (clickable)
      const buttonWrapper = renderer.createElement('button');
      renderer.addClass(buttonWrapper, 'menu-icon-container');
      renderer.addClass(buttonWrapper, 'mainmenu-button');

      // Add accessibility attributes
      renderer.setAttribute(buttonWrapper, 'type', 'button');
      renderer.setAttribute(buttonWrapper, 'aria-label', 'Toggle menu');

      // Create icon element
      const titleIcon = this.createIconElement(renderer, iconContent);
      
      // Append to button
      renderer.appendChild(buttonWrapper, titleIcon);

      // Add click listener
      renderer.listen(buttonWrapper, 'click', clickHandler);
      renderer.appendChild(titleElement, buttonWrapper);
    }
  }

  /**
   * Appends an icon to a menu item
   */
  public appendItemIcon(
    renderer: Renderer2,
    anchor: HTMLElement,
    iconContent: string,
    isRtl: boolean
  ): void {
    // Create the icon element
    const itemIcon = this.createIconElement(renderer, iconContent);
    
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
    groupIconContent: string,
    isRtl: boolean
  ): HTMLElement {
    // Create the icon element
    const groupIcon = this.createIconElement(renderer, groupIconContent);

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
    iconContent: string,
    isRtl: boolean
  ): void {
    // Create the icon element
    const backIcon = this.createIconElement(renderer, iconContent);

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
