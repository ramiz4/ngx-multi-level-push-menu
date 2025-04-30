import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  MenuLevelData,
  MultiLevelPushMenuItem,
  MultiLevelPushMenuOptions,
} from './multi-level-push-menu.model';
import { MultiLevelPushMenuService } from './multi-level-push-menu.service';

// Constants
const ANIMATION_DURATION = 400;
const CONTENT_PADDING = 20;

@Component({
  selector: 'ramiz4-multi-level-push-menu',
  standalone: false,
  templateUrl: './multi-level-push-menu.component.html',
  styleUrls: ['./multi-level-push-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(-100%)' })),
      state('outRtl', style({ transform: 'translateX(100%)' })),
      transition('in => out', [animate(`${ANIMATION_DURATION}ms ease-in-out`)]),
      transition('out => in', [animate(`${ANIMATION_DURATION}ms ease-in-out`)]),
      transition('in => outRtl', [animate(`${ANIMATION_DURATION}ms ease-in-out`)]),
      transition('outRtl => in', [animate(`${ANIMATION_DURATION}ms ease-in-out`)]),
    ]),
  ],
})
export class MultiLevelPushMenuComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('contentContainer') contentContainer!: ElementRef;

  private _options = new MultiLevelPushMenuOptions();
  private activeLevelHolders: HTMLElement[] = [];
  private menuLevels = new Map<string, MenuLevelData>();
  private isMobile = false;
  private startX = 0;
  private currentLevel = 0;
  private visibleLevelHolders: HTMLElement[] = [];
  private lastReflowValue = 0;

  // Subscriptions with initializers
  private collapseSubscription: Subscription = new Subscription();
  private expandSubscription: Subscription = new Subscription();

  @Input()
  set options(options: MultiLevelPushMenuOptions) {
    // Simply use Object.assign to apply any custom options
    // This works because our new class already has all default values
    if (options) {
      Object.assign(this._options, options);
    }

    if (this.menuContainer) {
      this.initMenu();
    }
  }

  get options(): MultiLevelPushMenuOptions {
    return this._options;
  }

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private multiLevelPushMenuService: MultiLevelPushMenuService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.isMobile = this.mobileCheck();
    this.setupSubscriptions();
  }

  ngAfterViewInit(): void {
    this.initMenu();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  // Setup service subscriptions
  private setupSubscriptions(): void {
    this.collapseSubscription = this.multiLevelPushMenuService
      .collapsed()
      .subscribe((level) => {
        this.collapseMenu(level);
      });

    this.expandSubscription = this.multiLevelPushMenuService
      .expanded()
      .subscribe(() => {
        this.expandMenu();
      });
  }

  private unsubscribe(): void {
    if (this.collapseSubscription) {
      this.collapseSubscription.unsubscribe();
    }
    if (this.expandSubscription) {
      this.expandSubscription.unsubscribe();
    }
  }

  // Menu initialization
  initMenu(): void {
    if (!this.menuContainer || !this.contentContainer) return;

    this.setContentPositionAndWidth(this._options.menuWidth);
    this.createMenuStructure();

    // Initialize in expanded state by default, unless explicitly set to collapsed
    if (!this._options.collapsed) {
      this.expandMenu();
    }
  }

  private setContentPositionAndWidth(menuWidth: string): void {
    this.renderer.setStyle(
      this.contentContainer.nativeElement,
      'left',
      `calc(${menuWidth} + ${CONTENT_PADDING}px)`
    );
    this.renderer.setStyle(
      this.contentContainer.nativeElement,
      'width',
      `calc(100% - (${menuWidth} + ${CONTENT_PADDING}px))`
    );
  }

  // Menu structure creation
  createMenuStructure(): void {
    if (!this._options.menu) return;

    this.clearMenu();
    const baseLevel = this.createLevelHolder(this._options.menu, 0);
    this.renderer.appendChild(this.menuContainer.nativeElement, baseLevel);

    // Set as active level
    this.activeLevelHolders = [baseLevel];
    this.currentLevel = 0;
    this.visibleLevelHolders = [baseLevel];
  }

  createLevelHolder(
    menuData: MultiLevelPushMenuItem,
    level: number
  ): HTMLElement {
    const levelHolder = this.renderer.createElement('div');
    this.renderer.addClass(levelHolder, 'level-holder');
    this.renderer.setAttribute(levelHolder, 'data-level', level.toString());

    const initialState =
      level === 0 ? 'in' : this._options.direction === 'rtl' ? 'outRtl' : 'out';
    this.renderer.setProperty(levelHolder, '_slideState', initialState);
    this.renderer.setStyle(
      levelHolder,
      'width',
      this._options.menuWidth
    );

    // Add to menu levels map
    this.menuLevels.set(`level-${level}`, {
      element: levelHolder,
      data: menuData,
    });

    // Add directional class
    this.renderer.addClass(levelHolder, this._options.direction === 'rtl' ? 'rtl' : 'ltr');

    // Create and append title
    this.appendLevelTitle(levelHolder, menuData);

    // Add back button for levels > 0
    if (level > 0) {
      this.createBackItem(levelHolder);
    }

    // Create menu items
    this.createMenuItemGroup(levelHolder, menuData, level);

    return levelHolder;
  }

  private appendLevelTitle(levelHolder: HTMLElement, menuData: MultiLevelPushMenuItem): void {
    const title = this.renderer.createElement('h2');
    this.renderer.addClass(title, 'title');
    this.renderer.appendChild(
      title,
      this.renderer.createText(menuData.title || '')
    );

    // Add title icon if exists
    if (menuData.icon) {
      this.appendTitleIcon(title, menuData.icon);
    }

    this.renderer.appendChild(levelHolder, title);
  }

  private appendTitleIcon(titleElement: HTMLElement, iconClasses: string): void {
    const titleIcon = this.renderer.createElement('i');

    // Add icon classes
    iconClasses.split(' ').forEach((className) => {
      if (className) this.renderer.addClass(titleIcon, className);
    });

    // Add positioning classes
    this.renderer.addClass(
      titleIcon,
      this._options.direction === 'rtl' ? 'floatLeft' : 'floatRight'
    );
    this.renderer.addClass(titleIcon, 'cursorPointer');

    // Apply styles
    const floatDirection = this._options.direction === 'rtl' ? 'left' : 'right';
    this.renderer.setStyle(titleIcon, 'float', floatDirection);
    this.renderer.setStyle(titleIcon, 'cursor', 'pointer');

    // Add click listener
    this.renderer.listen(titleIcon, 'click', (event) =>
      this.titleIconClick(event)
    );

    this.renderer.appendChild(titleElement, titleIcon);
  }

  private createMenuItemGroup(
    levelHolder: HTMLElement,
    menuData: MultiLevelPushMenuItem,
    level: number
  ): void {
    const itemGroup = this.renderer.createElement('ul');
    this.renderer.appendChild(levelHolder, itemGroup);

    if (menuData.items && menuData.items.length) {
      menuData.items.forEach((item: MultiLevelPushMenuItem) => {
        this.createMenuItem(item, itemGroup, levelHolder, level);
      });
    }
  }

  createMenuItem(
    item: MultiLevelPushMenuItem,
    itemGroup: HTMLElement,
    levelHolder: HTMLElement,
    parentLevel: number
  ): void {
    const listItem = this.renderer.createElement('li');
    this.renderer.setStyle(
      listItem,
      'text-align',
      this._options.direction === 'rtl' ? 'right' : 'left'
    );
    this.renderer.addClass(listItem, 'list-item');

    const anchor = this.createMenuItemAnchor(item);

    // Add item icon if exists
    if (item.icon) {
      this.appendItemIcon(anchor, item.icon);
    }

    // Handle submenu items
    if (item.items && item.items.length > 0) {
      this.setupSubmenuItem(anchor, item, levelHolder, parentLevel);
    } else {
      this.setupNormalMenuItem(anchor, item);
    }

    this.renderer.appendChild(listItem, anchor);
    this.renderer.appendChild(itemGroup, listItem);
  }

  private createMenuItemAnchor(item: MultiLevelPushMenuItem): HTMLElement {
    const anchor = this.renderer.createElement('a');

    // Set link property based on router availability
    const hasRouter = this.router && this.router.config && this.router.config.length > 0;
    const linkAttr = hasRouter ? 'routerLink' : 'href';
    this.renderer.setAttribute(anchor, linkAttr, item.link || '#');

    this.renderer.addClass(anchor, 'anchor');
    this.renderer.appendChild(
      anchor,
      this.renderer.createText(item.name || '')
    );

    return anchor;
  }

  private appendItemIcon(anchor: HTMLElement, iconClasses: string): void {
    const itemIcon = this.renderer.createElement('i');

    // Add icon classes
    iconClasses.split(' ').forEach((className) => {
      if (className) this.renderer.addClass(itemIcon, className);
    });

    this.renderer.addClass(itemIcon, 'anchor-icon');

    // Set float direction based on RTL setting
    const floatDirection = this._options.direction === 'rtl' ? 'left' : 'right';
    this.renderer.setStyle(itemIcon, 'float', floatDirection);

    this.renderer.appendChild(anchor, itemIcon);
  }

  private setupSubmenuItem(
    anchor: HTMLElement,
    item: MultiLevelPushMenuItem,
    levelHolder: HTMLElement,
    parentLevel: number
  ): void {
    // Create group icon
    const groupIcon = this.createGroupIcon();
    this.renderer.appendChild(anchor, groupIcon);

    // Handle click on item with sub-items
    this.renderer.listen(anchor, 'click', (event) => {
      event.preventDefault();
      if (this._options.preventGroupItemClick) {
        event.stopPropagation();
      }

      const nextLevel = parentLevel + 1;
      const sublevelKey = `${item.id || item.name}-${nextLevel}`;

      this.handleSubmenuClick(sublevelKey, nextLevel, item, levelHolder);
    });
  }

  private createGroupIcon(): HTMLElement {
    const groupIcon = this.renderer.createElement('i');

    // Add icon classes
    const groupIconClasses = this._options.groupIcon;
    groupIconClasses.split(' ').forEach((className) => {
      if (className) this.renderer.addClass(groupIcon, className);
    });

    // Add positioning styles
    const isRtl = this._options.direction === 'rtl';
    this.renderer.setStyle(groupIcon, 'float', isRtl ? 'right' : 'left');
    this.renderer.setStyle(groupIcon, 'padding', isRtl ? '0 0 0 .6em' : '0 .6em 0 0');

    return groupIcon;
  }

  private handleSubmenuClick(
    sublevelKey: string,
    nextLevel: number,
    item: MultiLevelPushMenuItem,
    parentLevelHolder: HTMLElement
  ): void {
    if (!this.menuLevels.has(sublevelKey)) {
      this.createSubmenu(sublevelKey, nextLevel, item, parentLevelHolder);
    }

    // Add a small delay before showing the sublevel
    setTimeout(() => {
      this.expandSubMenu(sublevelKey, nextLevel);
    }, 10);
  }

  private createSubmenu(
    sublevelKey: string,
    nextLevel: number,
    item: MultiLevelPushMenuItem,
    parentLevelHolder: HTMLElement
  ): void {
    const subLevelData = {
      title: item.name,
      id: item.id || item.name,
      icon: item.icon,
      items: item.items,
    };

    const subLevelHolder = this.createLevelHolder(subLevelData, nextLevel);

    // Position properly for animation
    this.renderer.setStyle(subLevelHolder, 'visibility', 'visible');

    // Set initial position off-screen
    const initialTransform = this._options.direction === 'rtl' ?
      'translateX(100%)' : 'translateX(-100%)';
    this.renderer.setStyle(subLevelHolder, 'transform', initialTransform);

    this.renderer.appendChild(this.menuContainer.nativeElement, subLevelHolder);

    this.menuLevels.set(sublevelKey, {
      element: subLevelHolder,
      data: subLevelData,
      parent: parentLevelHolder,
    });

    // Force a reflow to ensure styles are applied before animation
    this.forceReflow(subLevelHolder);
  }

  private setupNormalMenuItem(anchor: HTMLElement, item: MultiLevelPushMenuItem): void {
    this.renderer.listen(anchor, 'click', (event) => {
      if (this._options.preventItemClick) {
        event.preventDefault();
      }

      if (item.link && item.link !== '#') {
        this.router.navigateByUrl(item.link);
      }
    });
  }

  createBackItem(levelHolder: HTMLElement): void {
    const backItem = this.renderer.createElement('div');
    this.renderer.addClass(
      backItem,
      this._options.backItemClass
    );

    const backAnchor = this.renderer.createElement('a');
    this.renderer.setAttribute(backAnchor, 'href', '#');
    this.renderer.addClass(backAnchor, 'back-anchor');
    this.renderer.appendChild(
      backAnchor,
      this.renderer.createText(this._options.backText)
    );

    // Create back icon
    this.appendBackIcon(backAnchor);

    // Add click listener
    this.setupBackItemClickHandler(backAnchor, levelHolder);

    this.renderer.appendChild(backItem, backAnchor);
    this.renderer.appendChild(levelHolder, backItem);
  }

  private appendBackIcon(backAnchor: HTMLElement): void {
    const backIcon = this.renderer.createElement('i');

    // Add icon classes
    const backIconClasses = this._options.backItemIcon;
    backIconClasses.split(' ').forEach((className) => {
      if (className) this.renderer.addClass(backIcon, className);
    });

    // Set float based on direction
    const floatDirection = this._options.direction === 'rtl' ? 'left' : 'right';
    this.renderer.setStyle(backIcon, 'float', floatDirection);

    this.renderer.appendChild(backAnchor, backIcon);
  }

  private setupBackItemClickHandler(
    backAnchor: HTMLElement,
    levelHolder: HTMLElement
  ): void {
    this.renderer.listen(backAnchor, 'click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      // Get the current level
      const level = parseInt(levelHolder.getAttribute('data-level') ?? '0', 10);
      const targetLevel = level - 1;

      // Get target level element
      const targetLevelKey = `level-${targetLevel}`;
      const targetLevelData = this.menuLevels.get(targetLevelKey);

      if (!targetLevelData) return;

      this.handleBackNavigation(levelHolder, targetLevelData.element, targetLevel);
    });
  }

  private handleBackNavigation(
    currentLevelHolder: HTMLElement,
    targetLevelHolder: HTMLElement,
    targetLevel: number
  ): void {
    // Make sure the target level is visible
    this.renderer.setStyle(targetLevelHolder, 'visibility', 'visible');

    // Setup animation for current level
    this.renderer.setStyle(currentLevelHolder, 'transform', 'translateX(0)');
    this.forceReflow(currentLevelHolder);

    // Apply the animation direction
    const transform = this._options.direction === 'rtl' ?
      'translateX(100%)' : 'translateX(-100%)';
    this.renderer.setStyle(currentLevelHolder, 'transform', transform);

    // Update navigation state after animation completes
    setTimeout(() => {
      this.renderer.setStyle(currentLevelHolder, 'visibility', 'hidden');
      this.updateNavigationState(targetLevel);
    }, ANIMATION_DURATION);
  }

  private updateNavigationState(targetLevel: number): void {
    this.currentLevel = targetLevel;

    // Update active and visible level holders
    const filterByLevel = (holder: HTMLElement) =>
      parseInt(holder.getAttribute('data-level') ?? '0', 10) <= targetLevel;

    this.activeLevelHolders = this.activeLevelHolders.filter(filterByLevel);
    this.visibleLevelHolders = this.visibleLevelHolders.filter(filterByLevel);

    // Adjust content position if in overlap mode
    if (this._options.mode === 'overlap') {
      const overlapWidth = parseInt(this._options.overlapWidth, 10);
      this.pushContent(overlapWidth * targetLevel);
    }

    this.cdr.detectChanges();
  }

  // Event handlers
  titleIconClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this._options.collapsed) {
      this.expandMenu();
    } else {
      this.collapseMenu(undefined);
    }
  }

  // Menu collapse/expand methods
  collapseMenu(level?: number): void {
    if (level === undefined) {
      this.performFullCollapse();
    } else {
      this.collapseToLevel(level);
    }
  }

  private performFullCollapse(): void {
    const baseLevel = this.menuLevels.get('level-0');
    if (!baseLevel) return;

    const element = baseLevel.element;

    // Calculate the position
    const width = this.getElementWidth(element);
    const overlapWidth = parseInt(this._options.overlapWidth, 10);
    const marginLeft = this._options.fullCollapse ? -width : -width + overlapWidth;

    this.forceReflow(element);

    // Apply transform based on direction
    const transform = this._options.direction === 'rtl' ?
      `translateX(${-marginLeft}px)` : `translateX(${marginLeft}px)`;
    this.renderer.setStyle(element, 'transform', transform);

    // Adjust content position after animation completes
    setTimeout(() => {
      this.pushContent(marginLeft);

      // Hide submenu items
      const menuUl = element.querySelector('ul');
      if (menuUl) {
        this.renderer.setStyle(menuUl, 'display', 'none');
      }

      this.currentLevel = 0;
      this._options.collapsed = true;
    }, ANIMATION_DURATION);
  }

  expandMenu(): void {
    const baseLevel = this.menuLevels.get('level-0');
    if (!baseLevel) return;

    const element = baseLevel.element;

    // Reset transform
    this.renderer.setStyle(element, 'transform', 'translateX(0)');

    // Show menu items
    const menuUl = element.querySelector('ul');
    if (menuUl) {
      this.renderer.setStyle(menuUl, 'display', 'block');
    }

    // Reset content position
    this.pushContent(0);
    this._options.collapsed = false;
  }

  // Helper method to force a reflow
  private forceReflow(element: HTMLElement): number {
    this.lastReflowValue = element.offsetWidth;
    return this.lastReflowValue;
  }

  expandSubMenu(sublevelKey: string, level: number): void {
    const sublevel = this.menuLevels.get(sublevelKey);
    if (!sublevel) return;

    const element = sublevel.element;
    this.renderer.setStyle(element, 'visibility', 'visible');
    this.forceReflow(element);

    // Apply animation
    this.renderer.setProperty(element, '_slideState', 'in');
    this.renderer.setStyle(element, 'transform', 'translateX(0)');

    // Adjust menu width in overlap mode
    this.adjustMenuWidthInOverlapMode(level);

    // Update navigation state
    this.currentLevel = level;
    this.activeLevelHolders = [...this.activeLevelHolders, element];
    this.visibleLevelHolders = [...this.visibleLevelHolders, element];

    // Push content in overlap mode
    if (this._options.mode === 'overlap') {
      const overlapWidth = parseInt(this._options.overlapWidth, 10);
      this.pushContent(overlapWidth * level);
    }

    this.cdr.detectChanges();
  }

  private adjustMenuWidthInOverlapMode(level: number): void {
    if (this._options.mode !== 'overlap') return;

    const baseElement = this.menuLevels.get('level-0')?.element;
    if (!baseElement) return;

    const baseWidth = this.getElementWidth(baseElement);
    const overlapWidth = parseInt(this._options.overlapWidth, 10);
    const levelWidth = baseWidth + level * overlapWidth;

    this.renderer.setStyle(baseElement, 'width', `${levelWidth}px`);
  }

  collapseToLevel(level: number): void {
    // Find and animate all levels higher than the target level
    this.animateHigherLevelsOut(level);

    // Update active level and related state
    this.currentLevel = level;
    this.activeLevelHolders = this.activeLevelHolders.filter(
      holder => parseInt(holder.getAttribute('data-level') ?? '0', 10) <= level
    );

    // Adjust content position in overlap mode
    if (this._options.mode === 'overlap') {
      const overlapWidth = parseInt(this._options.overlapWidth, 10);
      this.pushContent(overlapWidth * level);
    }

    this.cdr.detectChanges();
  }

  private animateHigherLevelsOut(targetLevel: number): void {
    Array.from(this.menuLevels.entries())
      .filter(([, value]) => {
        const levelAttr = value.element.getAttribute('data-level');
        return parseInt(levelAttr ?? '0', 10) > targetLevel;
      })
      .forEach(([, value]) => {
        const element = value.element;
        this.forceReflow(element);

        // Apply animation state
        const animState = this._options.direction === 'rtl' ? 'outRtl' : 'out';
        this.renderer.setProperty(element, '_slideState', animState);

        // Set transform for animation
        const transform = this._options.direction === 'rtl' ?
          'translateX(100%)' : 'translateX(-100%)';
        this.renderer.setStyle(element, 'transform', transform);

        // Hide after animation completes
        setTimeout(() => {
          this.renderer.setStyle(element, 'visibility', 'hidden');
        }, ANIMATION_DURATION);
      });
  }

  // Content positioning
  pushContent(amount: number): void {
    if (!this.contentContainer) return;

    const menuWidth = this.parseSize(this._options.menuWidth);
    const totalPush = menuWidth + amount + CONTENT_PADDING;

    this.renderer.setStyle(
      this.contentContainer.nativeElement,
      'left',
      `${totalPush}px`
    );
    this.renderer.setStyle(
      this.contentContainer.nativeElement,
      'width',
      `calc(100% - ${totalPush}px)`
    );
  }

  // Utility methods
  getElementWidth(element: HTMLElement): number {
    return element ? element.offsetWidth : 0;
  }

  parseSize(size: string): number {
    if (!size) return 0;

    if (size.endsWith('px')) {
      return parseInt(size, 10);
    } else if (size.endsWith('%')) {
      const percentage = parseInt(size, 10);
      return (percentage / 100) * window.innerWidth;
    } else if (size.endsWith('em')) {
      const emSize = parseInt(size, 10);
      const fontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      return emSize * fontSize;
    } else {
      return parseInt(size, 10);
    }
  }

  clearMenu(): void {
    if (!this.menuContainer) return;

    while (this.menuContainer.nativeElement.firstChild) {
      this.menuContainer.nativeElement.removeChild(
        this.menuContainer.nativeElement.firstChild
      );
    }

    this.menuLevels.clear();
    this.activeLevelHolders = [];
    this.visibleLevelHolders = [];
    this.currentLevel = 0;
  }

  // Mobile detection
  mobileCheck(): boolean {
    // Check for touch capability
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      const userAgent = navigator.userAgent.toLowerCase();
      return /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    }

    // Fallback to screen size check
    return window.matchMedia('(max-width: 767px)').matches;
  }

  // Touch/swipe support
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (!this.isSwipeEnabled('touchscreen')) return;
    this.startX = event.touches[0].clientX;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isSwipeEnabled('touchscreen')) return;

    const currentX = event.touches[0].clientX;
    const diff = currentX - this.startX;
    const threshold = this.getSwipeThreshold();

    if (Math.abs(diff) > threshold) {
      this.handleSwipe(diff);
      this.startX = 0;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!this.isSwipeEnabled('desktop')) return;

    this.startX = event.clientX;
    this.setupMouseSwipeHandlers();
  }

  private isSwipeEnabled(deviceType: 'desktop' | 'touchscreen'): boolean {
    if (this._options.swipe === 'none') return false;
    return deviceType === 'desktop' ?
      this._options.swipe !== 'touchscreen' :
      this._options.swipe !== 'desktop';
  }

  private getSwipeThreshold(): number {
    const overlapWidth = parseInt(this._options.overlapWidth, 10);
    return overlapWidth * 0.3;
  }

  private handleSwipe(diff: number): void {
    if (this._options.direction === 'rtl') {
      diff < 0 ? this.expandMenu() : this.collapseMenu(this.currentLevel - 1);
    } else {
      diff > 0 ? this.expandMenu() : this.collapseMenu(this.currentLevel - 1);
    }
  }

  private setupMouseSwipeHandlers(): void {
    const mouseMoveHandler = (e: MouseEvent) => {
      const diff = e.clientX - this.startX;
      const threshold = this.getSwipeThreshold();

      if (Math.abs(diff) > threshold) {
        this.handleSwipe(diff);
        this.startX = 0;
        document.removeEventListener('mousemove', mouseMoveHandler);
      }
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }
}
