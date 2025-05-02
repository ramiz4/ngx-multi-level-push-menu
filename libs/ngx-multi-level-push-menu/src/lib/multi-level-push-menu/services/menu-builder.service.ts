import { Injectable, Renderer2 } from '@angular/core';
import { BASE_LEVEL_KEY } from '../constants';
import { MenuItemClickEvent, MenuLevelData } from '../interfaces';
import { MultiLevelPushMenuItem, MultiLevelPushMenuOptions } from '../models';
import { MenuUtils } from '../utilities/menu-utils';
import { MenuDomService } from './menu-dom.service';

@Injectable()
export class MenuBuilderService {
  constructor(private menuDomService: MenuDomService) { }

  /**
   * Creates the entire menu structure
   */
  public createMenuStructure(
    renderer: Renderer2,
    menuContainer: HTMLElement,
    options: MultiLevelPushMenuOptions,
    menuLevels: Map<string, MenuLevelData>,
    titleClickHandler: (event: MouseEvent) => void,
    submenuClickHandler: (
      sublevelKey: string,
      nextLevel: number,
      item: MultiLevelPushMenuItem,
      parentLevelHolder: HTMLElement
    ) => void,
    backItemClickHandler: (
      backAnchor: HTMLElement,
      levelHolder: HTMLElement
    ) => void,
    menuItemClickHandler: (
      anchor: HTMLElement,
      item: MultiLevelPushMenuItem
    ) => void
  ): HTMLElement[] {
    if (!options.menu || options.menu.length === 0) return [];

    // Clear the existing menu first
    this.menuDomService.clearMenu(renderer, menuContainer);

    // Create a root level data object from the menu items array
    const rootMenuData: MultiLevelPushMenuItem = {
      name: 'Menu',
      items: options.menu,
    };

    // Create base level
    const baseLevel = this.createLevelHolder(
      renderer,
      rootMenuData,
      0,
      options,
      menuLevels,
      titleClickHandler,
      submenuClickHandler,
      backItemClickHandler,
      menuItemClickHandler
    );

    renderer.appendChild(menuContainer, baseLevel);

    // Return the base level as the active level holder
    return [baseLevel];
  }

  /**
   * Creates a level holder element
   */
  public createLevelHolder(
    renderer: Renderer2,
    menuData: MultiLevelPushMenuItem,
    level: number,
    options: MultiLevelPushMenuOptions,
    menuLevels: Map<string, MenuLevelData>,
    titleClickHandler: (event: MouseEvent) => void,
    submenuClickHandler: (
      sublevelKey: string,
      nextLevel: number,
      item: MultiLevelPushMenuItem,
      parentLevelHolder: HTMLElement
    ) => void,
    backItemClickHandler: (
      backAnchor: HTMLElement,
      levelHolder: HTMLElement
    ) => void,
    menuItemClickHandler: (
      anchor: HTMLElement,
      item: MultiLevelPushMenuItem
    ) => void
  ): HTMLElement {
    const levelHolder = renderer.createElement('div');
    renderer.addClass(levelHolder, 'level-holder');
    renderer.setAttribute(levelHolder, 'data-level', level.toString());

    // Add accessibility attributes
    renderer.setAttribute(levelHolder, 'role', 'menu');
    renderer.setAttribute(levelHolder, 'aria-orientation', 'vertical');
    if (menuData.title || menuData.name) {
      renderer.setAttribute(
        levelHolder,
        'aria-label',
        menuData.title || menuData.name || `Menu level ${level}`
      );
    }

    const initialState =
      level === 0 ? 'in' : options.direction === 'rtl' ? 'outRtl' : 'out';
    renderer.setProperty(levelHolder, '_slideState', initialState);
    renderer.setStyle(levelHolder, 'width', options.menuWidth);

    // Add to menu levels map
    menuLevels.set(`level-${level}`, {
      element: levelHolder,
      data: menuData,
    });

    // Add directional class
    renderer.addClass(levelHolder, options.direction === 'rtl' ? 'rtl' : 'ltr');

    // Create and append title
    this.menuDomService.appendLevelTitle(
      renderer,
      levelHolder,
      menuData,
      options,
      titleClickHandler
    );

    // Add back button for levels > 0
    if (level > 0) {
      this.createBackItem(renderer, levelHolder, options, backItemClickHandler);
    }

    // Create menu items
    this.createMenuItemGroup(
      renderer,
      levelHolder,
      menuData,
      level,
      options,
      submenuClickHandler,
      menuItemClickHandler
    );

    return levelHolder;
  }

  /**
   * Creates a menu item
   */
  public createMenuItem(
    renderer: Renderer2,
    item: MultiLevelPushMenuItem,
    itemGroup: HTMLElement,
    levelHolder: HTMLElement,
    parentLevel: number,
    options: MultiLevelPushMenuOptions,
    submenuClickHandler: (
      sublevelKey: string,
      nextLevel: number,
      item: MultiLevelPushMenuItem,
      parentLevelHolder: HTMLElement
    ) => void,
    menuItemClickHandler: (
      anchor: HTMLElement,
      item: MultiLevelPushMenuItem
    ) => void
  ): void {
    const listItem = renderer.createElement('li');
    renderer.setStyle(
      listItem,
      'text-align',
      options.direction === 'rtl' ? 'right' : 'left'
    );
    renderer.addClass(listItem, 'list-item');

    // Add list item accessibility attributes
    renderer.setAttribute(listItem, 'role', 'presentation');

    const anchor = this.createMenuItemAnchor(renderer, item);

    // Add ramiz4MenuItem directive attribute
    renderer.setAttribute(anchor, 'ramiz4MenuItem', '');

    // Add data attributes for the directive to use
    renderer.setAttribute(anchor, 'data-item-id', item.id || '');
    renderer.setAttribute(anchor, 'data-item-name', item.name || '');

    // Add accessibility information about menu level
    renderer.setAttribute(anchor, 'data-level', parentLevel.toString());

    // Add item icon if exists
    if (item.icon) {
      this.menuDomService.appendItemIcon(
        renderer,
        anchor,
        item.icon,
        options.direction === 'rtl'
      );
    }

    // Handle submenu items
    const hasSubmenu = item.items && item.items.length > 0;
    if (hasSubmenu) {
      // Mark as submenu item for the directive
      renderer.setAttribute(anchor, 'data-is-submenu', 'true');

      this.setupSubmenuItem(
        renderer,
        anchor,
        item,
        levelHolder,
        parentLevel,
        options,
        submenuClickHandler
      );
    } else {
      renderer.setAttribute(anchor, 'data-is-submenu', 'false');
      this.setupNormalMenuItem(
        renderer,
        anchor,
        item,
        options,
        menuItemClickHandler
      );
    }

    // Add click listener that handles both normal and submenu items via the directive's output
    renderer.listen(anchor, 'itemClick', (event: MenuItemClickEvent) => {
      if (event.isSubmenu) {
        if (options.preventGroupItemClick) {
          event.event.stopPropagation();
        }

        const nextLevel = parentLevel + 1;
        const sublevelKey = `${item.id || item.name}-${nextLevel}`;
        submenuClickHandler(sublevelKey, nextLevel, item, levelHolder);
      } else {
        if (options.preventItemClick) {
          event.event.preventDefault();
        }
        menuItemClickHandler(anchor, item);
      }
    });

    renderer.appendChild(listItem, anchor);
    renderer.appendChild(itemGroup, listItem);
  }

  /**
   * Creates a back item for navigating up a level
   */
  public createBackItem(
    renderer: Renderer2,
    levelHolder: HTMLElement,
    options: MultiLevelPushMenuOptions,
    backItemClickHandler: (
      backAnchor: HTMLElement,
      levelHolder: HTMLElement
    ) => void
  ): void {
    const backItem = renderer.createElement('div');
    renderer.addClass(backItem, options.backItemClass);

    // Add accessibility attributes to back item container
    renderer.setAttribute(backItem, 'role', 'presentation');

    const backAnchor = renderer.createElement('a');
    renderer.setAttribute(backAnchor, 'href', '#');
    renderer.setAttribute(backAnchor, 'ramiz4MenuItem', '');
    renderer.setAttribute(backAnchor, 'data-is-back-item', 'true');
    renderer.addClass(backAnchor, 'back-anchor');

    // Add enhanced accessibility attributes to back anchor
    renderer.setAttribute(backAnchor, 'role', 'menuitem');
    renderer.setAttribute(backAnchor, 'aria-label', 'Go back to previous menu');
    renderer.setAttribute(backAnchor, 'tabindex', '0');

    renderer.appendChild(backAnchor, renderer.createText(options.backText));

    // Create back icon
    this.menuDomService.appendBackIcon(
      renderer,
      backAnchor,
      options.backItemIcon,
      options.direction === 'rtl'
    );

    // Add click listener
    renderer.listen(backAnchor, 'click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      backItemClickHandler(backAnchor, levelHolder);
    });

    renderer.appendChild(backItem, backAnchor);
    renderer.appendChild(levelHolder, backItem);
  }

  /**
   * Creates a group of menu items
   */
  private createMenuItemGroup(
    renderer: Renderer2,
    levelHolder: HTMLElement,
    menuData: MultiLevelPushMenuItem,
    level: number,
    options: MultiLevelPushMenuOptions,
    submenuClickHandler: (
      sublevelKey: string,
      nextLevel: number,
      item: MultiLevelPushMenuItem,
      parentLevelHolder: HTMLElement
    ) => void,
    menuItemClickHandler: (
      anchor: HTMLElement,
      item: MultiLevelPushMenuItem
    ) => void
  ): void {
    const itemGroup = renderer.createElement('ul');

    // Add accessibility attributes
    renderer.setAttribute(itemGroup, 'role', 'group');
    if (menuData.title || menuData.name) {
      renderer.setAttribute(
        itemGroup,
        'aria-label',
        `${menuData.title || menuData.name} items`
      );
    }

    renderer.appendChild(levelHolder, itemGroup);

    if (menuData.items && menuData.items.length) {
      menuData.items.forEach((item: MultiLevelPushMenuItem) => {
        this.createMenuItem(
          renderer,
          item,
          itemGroup,
          levelHolder,
          level,
          options,
          submenuClickHandler,
          menuItemClickHandler
        );
      });
    }
  }

  /**
   * Creates an anchor element for a menu item
   */
  private createMenuItemAnchor(
    renderer: Renderer2,
    item: MultiLevelPushMenuItem
  ): HTMLElement {
    const anchor = renderer.createElement('a');

    // Set link property
    renderer.setAttribute(anchor, 'href', item.link || '#');
    renderer.addClass(anchor, 'anchor');
    renderer.appendChild(anchor, renderer.createText(item.name || ''));

    return anchor;
  }

  /**
   * Sets up a submenu item with proper event handling
   */
  private setupSubmenuItem(
    renderer: Renderer2,
    anchor: HTMLElement,
    item: MultiLevelPushMenuItem,
    levelHolder: HTMLElement,
    parentLevel: number,
    options: MultiLevelPushMenuOptions,
    submenuClickHandler: (
      sublevelKey: string,
      nextLevel: number,
      item: MultiLevelPushMenuItem,
      parentLevelHolder: HTMLElement
    ) => void
  ): void {
    // Create group icon
    const groupIcon = this.menuDomService.createGroupIcon(
      renderer,
      options.groupIcon,
      options.direction === 'rtl'
    );
    renderer.appendChild(anchor, groupIcon);

    // Handle click on item with sub-items
    renderer.listen(anchor, 'click', (event) => {
      event.preventDefault();
      if (options.preventGroupItemClick) {
        event.stopPropagation();
      }

      const nextLevel = parentLevel + 1;
      const sublevelKey = `${item.id || item.name}-${nextLevel}`;

      submenuClickHandler(sublevelKey, nextLevel, item, levelHolder);
    });
  }

  /**
   * Sets up a normal menu item with proper event handling
   */
  private setupNormalMenuItem(
    renderer: Renderer2,
    anchor: HTMLElement,
    item: MultiLevelPushMenuItem,
    options: MultiLevelPushMenuOptions,
    menuItemClickHandler: (
      anchor: HTMLElement,
      item: MultiLevelPushMenuItem
    ) => void
  ): void {
    renderer.listen(anchor, 'click', (event) => {
      if (options.preventItemClick) {
        event.preventDefault();
      }

      menuItemClickHandler(anchor, item);
    });
  }

  /**
   * Creates a submenu level
   */
  public createSubmenu(
    renderer: Renderer2,
    menuContainer: HTMLElement,
    sublevelKey: string,
    nextLevel: number,
    item: MultiLevelPushMenuItem,
    parentLevelHolder: HTMLElement,
    options: MultiLevelPushMenuOptions,
    menuLevels: Map<string, MenuLevelData>,
    titleClickHandler: (event: MouseEvent) => void,
    submenuClickHandler: (
      sublevelKey: string,
      nextLevel: number,
      item: MultiLevelPushMenuItem,
      parentLevelHolder: HTMLElement
    ) => void,
    backItemClickHandler: (
      backAnchor: HTMLElement,
      levelHolder: HTMLElement
    ) => void,
    menuItemClickHandler: (
      anchor: HTMLElement,
      item: MultiLevelPushMenuItem
    ) => void
  ): void {
    const subLevelData = {
      title: item.name,
      id: item.id || item.name,
      icon: item.icon,
      items: item.items,
    };

    const subLevelHolder = this.createLevelHolder(
      renderer,
      subLevelData,
      nextLevel,
      options,
      menuLevels,
      titleClickHandler,
      submenuClickHandler,
      backItemClickHandler,
      menuItemClickHandler
    );

    // Position properly for animation
    renderer.setStyle(subLevelHolder, 'visibility', 'visible');

    // Set initial position off-screen
    const initialTransform =
      options.direction === 'rtl' ? 'translateX(100%)' : 'translateX(-100%)';
    renderer.setStyle(subLevelHolder, 'transform', initialTransform);

    renderer.appendChild(menuContainer, subLevelHolder);

    menuLevels.set(sublevelKey, {
      element: subLevelHolder,
      data: subLevelData,
      parent: parentLevelHolder,
    });

    // Force a reflow to ensure styles are applied before animation
    MenuUtils.forceReflow(subLevelHolder);
  }

  /**
   * Adjusts menu width in overlap mode
   */
  public adjustMenuWidthInOverlapMode(
    renderer: Renderer2,
    menuLevels: Map<string, MenuLevelData>,
    level: number,
    options: MultiLevelPushMenuOptions
  ): void {
    if (options.mode !== 'overlap') return;

    const baseElement = menuLevels.get(BASE_LEVEL_KEY)?.element;
    if (!baseElement) return;

    const baseWidth = MenuUtils.getElementWidth(baseElement);
    const overlapWidth = parseInt(options.overlapWidth, 10);
    const levelWidth = baseWidth + level * overlapWidth;

    renderer.setStyle(baseElement, 'width', `${levelWidth}px`);
  }
}
