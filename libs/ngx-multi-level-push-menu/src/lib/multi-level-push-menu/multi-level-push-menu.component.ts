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
  MultiLevelPushMenuItem,
  MultiLevelPushMenuOptions,
} from './multi-level-push-menu.model';
import { MultiLevelPushMenuService } from './multi-level-push-menu.service';

const DEFAULT_OVERLAP_WIDTH = '55';

@Component({
  selector: 'ramiz4-multi-level-push-menu',
  standalone: false,
  templateUrl: './multi-level-push-menu.component.html',
  styleUrls: ['./multi-level-push-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInOut', [
      state(
        'in',
        style({
          transform: 'translateX(0)',
        })
      ),
      state(
        'out',
        style({
          transform: 'translateX(-100%)',
        })
      ),
      state(
        'outRtl',
        style({
          transform: 'translateX(100%)',
        })
      ),
      transition('in => out', [animate('400ms ease-in-out')]),
      transition('out => in', [animate('400ms ease-in-out')]),
      transition('in => outRtl', [animate('400ms ease-in-out')]),
      transition('outRtl => in', [animate('400ms ease-in-out')]),
    ]),
  ],
})
export class MultiLevelPushMenuComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('contentContainer')
  contentContainer!: ElementRef;

  private _options = new MultiLevelPushMenuOptions();
  private activeLevelHolders: HTMLElement[] = [];
  private menuLevels: Map<
    string,
    { element: HTMLElement; data: MultiLevelPushMenuItem; parent?: HTMLElement }
  > = new Map();
  private isMobile = false;
  private startX = 0;
  private currentLevel = 0;
  private visibleLevelHolders: HTMLElement[] = [];
  private lastReflowValue = 0; // Property to store reflow values

  collapseSubscription: Subscription;
  expandSubscription: Subscription;

  @Input()
  set options(options: MultiLevelPushMenuOptions) {
    this._options = {
      ...this._options,
      ...options,
      mode: options.mode || this._options.mode,
      menu: options.menu || this._options.menu,
    };

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
    this.isMobile = this.mobileCheck();

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

  ngOnInit() {
    if (!this._options.menuWidth) {
      this._options.menuWidth = '300px';
    }
  }

  ngAfterViewInit() {
    this.initMenu();
    this.cdr.detectChanges();
  }

  initMenu() {
    if (!this.menuContainer || !this.contentContainer) return;

    const menuWidth = this._options.menuWidth;

    // Set content position and width
    this.renderer.setStyle(
      this.contentContainer.nativeElement,
      'left',
      `calc(${menuWidth} + 20px)`
    );
    this.renderer.setStyle(
      this.contentContainer.nativeElement,
      'width',
      `calc(100% - (${menuWidth} + 20px))`
    );

    // Create menu structure
    this.createMenuStructure();

    // Initialize in expanded state by default, unless explicitly set to collapsed
    if (!this._options.collapsed) {
      this.expandMenu();
    }
  }

  createMenuStructure() {
    if (!this._options.menu) return;

    // Clear existing menu if any
    this.clearMenu();

    // Create the base level holder
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

    // Don't apply animation trigger attribute directly with @ symbol
    // Instead, track animation state in a property
    const initialState =
      level === 0 ? 'in' : this._options.direction === 'rtl' ? 'outRtl' : 'out';
    this.renderer.setProperty(levelHolder, '_slideState', initialState);

    this.renderer.setStyle(
      levelHolder,
      'width',
      this._options.menuWidth || '300px'
    );

    // Add to menu levels map
    this.menuLevels.set(`level-${level}`, {
      element: levelHolder,
      data: menuData,
    });

    if (this._options.direction === 'rtl') {
      this.renderer.addClass(levelHolder, 'rtl');
    } else {
      this.renderer.addClass(levelHolder, 'ltr');
    }

    // Create title
    const title = this.renderer.createElement('h2');
    this.renderer.addClass(title, 'title');
    this.renderer.appendChild(
      title,
      this.renderer.createText(menuData.title || '')
    );

    // Add title icon if exists
    if (menuData.icon) {
      const titleIcon = this.renderer.createElement('i');
      // Split class names and add them individually
      menuData.icon.split(' ').forEach((className) => {
        if (className) this.renderer.addClass(titleIcon, className);
      });
      this.renderer.addClass(
        titleIcon,
        this._options.direction === 'rtl' ? 'floatLeft' : 'floatRight'
      );
      this.renderer.addClass(titleIcon, 'cursorPointer');

      // Apply direct styles
      if (this._options.direction === 'rtl') {
        this.renderer.setStyle(titleIcon, 'float', 'left');
      } else {
        this.renderer.setStyle(titleIcon, 'float', 'right');
      }
      this.renderer.setStyle(titleIcon, 'cursor', 'pointer');

      this.renderer.listen(titleIcon, 'click', (event) =>
        this.titleIconClick(event)
      );
      this.renderer.appendChild(title, titleIcon);
    }

    this.renderer.appendChild(levelHolder, title);

    // Add back button for levels > 0
    if (level > 0) {
      this.createBackItem(levelHolder);
    }

    // Create menu items
    const itemGroup = this.renderer.createElement('ul');
    this.renderer.appendChild(levelHolder, itemGroup);

    if (menuData.items && menuData.items.length) {
      menuData.items.forEach((item: MultiLevelPushMenuItem) => {
        this.createMenuItem(item, itemGroup, levelHolder, level);
      });
    }

    return levelHolder;
  }

  createMenuItem(
    item: MultiLevelPushMenuItem,
    itemGroup: HTMLElement,
    levelHolder: HTMLElement,
    parentLevel: number
  ) {
    const listItem = this.renderer.createElement('li');
    this.renderer.setStyle(
      listItem,
      'text-align',
      this._options.direction === 'rtl' ? 'right' : 'left'
    );

    this.renderer.addClass(listItem, 'list-item');

    const anchor = this.renderer.createElement('a');

    // Check if Router is configured by seeing if it has routes
    if (this.router && this.router.config && this.router.config.length > 0) {
      // Angular Router is configured, use routerLink
      this.renderer.setAttribute(anchor, 'routerLink', item.link || '#');
    } else {
      // Angular Router is not configured or empty, use href instead
      this.renderer.setAttribute(anchor, 'href', item.link || '#');
    }
    this.renderer.addClass(anchor, 'anchor');

    this.renderer.appendChild(
      anchor,
      this.renderer.createText(item.name || '')
    );

    // Add item icon if exists
    if (item.icon) {
      const itemIcon = this.renderer.createElement('i');
      // Split class names and add them individually
      item.icon.split(' ').forEach((className) => {
        if (className) this.renderer.addClass(itemIcon, className);
      });

      this.renderer.addClass(itemIcon, 'anchor-icon');

      if (this._options.direction === 'rtl') {
        this.renderer.setStyle(itemIcon, 'float', 'left');
      } else {
        this.renderer.setStyle(itemIcon, 'float', 'right');
      }

      this.renderer.appendChild(anchor, itemIcon);
    }

    // If item has sub-items, create submenu
    if (item.items && item.items.length > 0) {
      // Create group icon
      const groupIcon = this.renderer.createElement('i');
      // Split class names and add them individually
      const groupIconClasses = this._options.groupIcon || 'fa fa-angle-left';
      groupIconClasses.split(' ').forEach((className) => {
        if (className) this.renderer.addClass(groupIcon, className);
      });

      this.renderer.addClass(groupIcon, 'group-icon');

      // Add positioning styles directly
      if (this._options.direction === 'rtl') {
        this.renderer.setStyle(groupIcon, 'float', 'right');
        this.renderer.setStyle(groupIcon, 'padding', '0 0 0 .6em');
      } else {
        this.renderer.setStyle(groupIcon, 'float', 'left');
        this.renderer.setStyle(groupIcon, 'padding', '0 .6em 0 0');
      }

      this.renderer.appendChild(anchor, groupIcon);

      // Handle click on item with sub-items
      this.renderer.listen(anchor, 'click', (event) => {
        event.preventDefault();
        if (this._options.preventGroupItemClick) {
          event.stopPropagation();
        }

        // Create sublevel if it doesn't exist
        const nextLevel = parentLevel + 1;
        const sublevelKey = `${item.id || item.name}-${nextLevel}`;

        if (!this.menuLevels.has(sublevelKey)) {
          const subLevelData = {
            title: item.name,
            id: item.id || item.name,
            icon: item.icon,
            items: item.items,
          };

          const subLevelHolder = this.createLevelHolder(
            subLevelData,
            nextLevel
          );

          // Force immediate visibility and proper initial positioning
          // This ensures the element is in the DOM and ready to be animated
          this.renderer.setStyle(subLevelHolder, 'visibility', 'visible');

          // Position it properly first - off screen initially
          if (this._options.direction === 'rtl') {
            this.renderer.setStyle(
              subLevelHolder,
              'transform',
              'translateX(100%)'
            );
          } else {
            this.renderer.setStyle(
              subLevelHolder,
              'transform',
              'translateX(-100%)'
            );
          }

          this.renderer.appendChild(
            this.menuContainer.nativeElement,
            subLevelHolder
          );

          this.menuLevels.set(sublevelKey, {
            element: subLevelHolder,
            data: subLevelData,
            parent: levelHolder,
          });

          // Force a reflow to ensure styles are applied before animation
          this.forceReflow(subLevelHolder);
        }

        // Add a small delay before showing the sublevel to ensure browser has time to process
        setTimeout(() => {
          // Show the sublevel
          this.expandSubMenu(sublevelKey, nextLevel);
        }, 10);
      });
    } else {
      // Normal item click
      this.renderer.listen(anchor, 'click', (event) => {
        if (this._options.preventItemClick) {
          event.preventDefault();
        }

        if (item.link && item.link !== '#') {
          this.router.navigateByUrl(item.link);
        }
      });
    }

    this.renderer.appendChild(listItem, anchor);
    this.renderer.appendChild(itemGroup, listItem);
  }

  createBackItem(levelHolder: HTMLElement) {
    const backItem = this.renderer.createElement('div');
    this.renderer.addClass(
      backItem,
      this._options.backItemClass || 'back-item'
    );

    const backAnchor = this.renderer.createElement('a');

    this.renderer.setAttribute(backAnchor, 'href', '#');
    this.renderer.addClass(backAnchor, 'back-anchor');

    this.renderer.appendChild(
      backAnchor,
      this.renderer.createText(this._options.backText || 'Back')
    );

    const backIcon = this.renderer.createElement('i');
    // Split class names and add them individually
    const backIconClasses = this._options.backItemIcon || 'fa fa-angle-right';
    backIconClasses.split(' ').forEach((className) => {
      if (className) this.renderer.addClass(backIcon, className);
    });

    // Apply direct styles for icon positioning
    if (this._options.direction === 'rtl') {
      this.renderer.setStyle(backIcon, 'float', 'left');
    } else {
      this.renderer.setStyle(backIcon, 'float', 'right');
    }

    this.renderer.appendChild(backAnchor, backIcon);

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

      // Make sure the target level is visible
      this.renderer.setStyle(targetLevelData.element, 'visibility', 'visible');

      // Start the animation directly on the current level holder
      if (this._options.direction === 'rtl') {
        // Set up the initial state to ensure animation will trigger
        this.renderer.setStyle(levelHolder, 'transform', 'translateX(0)');
        // Force a reflow
        this.forceReflow(levelHolder);
        // Apply the animation direction
        this.renderer.setStyle(levelHolder, 'transform', 'translateX(100%)');
      } else {
        // Set up the initial state to ensure animation will trigger
        this.renderer.setStyle(levelHolder, 'transform', 'translateX(0)');
        // Force a reflow
        this.forceReflow(levelHolder);
        // Apply the animation direction
        this.renderer.setStyle(levelHolder, 'transform', 'translateX(-100%)');
      }

      // Update navigation state after animation completes
      setTimeout(() => {
        // Update the holder visibility
        this.renderer.setStyle(levelHolder, 'visibility', 'hidden');

        // Update the current level
        this.currentLevel = targetLevel;

        // Update active level holders
        this.activeLevelHolders = this.activeLevelHolders.filter(
          (holder) =>
            parseInt(holder.getAttribute('data-level') ?? '0', 10) <=
            targetLevel
        );

        // Update visible holders
        this.visibleLevelHolders = this.visibleLevelHolders.filter(
          (holder) =>
            parseInt(holder.getAttribute('data-level') ?? '0', 10) <=
            targetLevel
        );

        // Adjust content position if in overlap mode
        if (this._options.mode === 'overlap') {
          const overlapWidth = parseInt(this._options.overlapWidth || DEFAULT_OVERLAP_WIDTH, 10);
          this.pushContent(overlapWidth * targetLevel);
        }

        // Update change detection
        this.cdr.detectChanges();
      }, 400);
    });

    this.renderer.appendChild(backItem, backAnchor);
    this.renderer.appendChild(levelHolder, backItem);
  }

  titleIconClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this._options.collapsed) {
      this.expandMenu();
    } else {
      this.collapseMenu(undefined);
    }
  }

  collapseMenu(level?: number) {
    if (level === undefined) {
      // Full collapse
      const baseLevel = this.menuLevels.get('level-0');
      if (baseLevel) {
        const element = baseLevel.element;

        // Calculate the position
        const width = this.getElementWidth(element);
        const overlapWidth = parseInt(this._options.overlapWidth || DEFAULT_OVERLAP_WIDTH, 10);
        const marginLeft = this._options.fullCollapse
          ? -width
          : -width + overlapWidth;

        // Force a reflow first to ensure animation will trigger
        this.forceReflow(element);

        // Apply the animation using calculated px values instead of percentages
        if (this._options.direction === 'rtl') {
          this.renderer.setStyle(element, 'transform', `translateX(${-marginLeft}px)`);
        } else {
          this.renderer.setStyle(element, 'transform', `translateX(${marginLeft}px)`);
        }

        // Set margins after transform is applied (after animation completes)
        setTimeout(() => {
          this.pushContent(marginLeft);
        }, 400);

        // Hide submenu items
        const menuUl = element.querySelector('ul');
        if (menuUl) {
          this.renderer.setStyle(menuUl, 'display', 'none');
        }

        this.currentLevel = 0;
        this._options.collapsed = true;
      }
    } else {
      // Collapse to specific level
      this.collapseToLevel(level);
    }
  }

  expandMenu() {
    const baseLevel = this.menuLevels.get('level-0');
    if (baseLevel) {
      const element = baseLevel.element;

      if (this._options.direction === 'rtl') {
        this.renderer.setStyle(element, 'transform', `translateX(0)`);
      } else {
        this.renderer.setStyle(element, 'transform', `translateX(0)`);
      }

      // Show menu items
      const menuUl = element.querySelector('ul');
      if (menuUl) {
        this.renderer.setStyle(menuUl, 'display', 'block');
      }

      // Push content
      this.pushContent(0);

      this._options.collapsed = false;
    }
  }

  // Helper method to force a reflow without triggering linter warnings
  private forceReflow(element: HTMLElement): number {
    // Reading a property like offsetWidth forces a reflow
    // Storing and using the result prevents linter warnings
    this.lastReflowValue = element.offsetWidth;
    return this.lastReflowValue;
  }

  expandSubMenu(sublevelKey: string, level: number) {
    const sublevel = this.menuLevels.get(sublevelKey);
    if (!sublevel) return;

    const element = sublevel.element;

    // Ensure element is in the DOM and visible first
    this.renderer.setStyle(element, 'visibility', 'visible');

    // Force a reflow before changing transform to ensure animation works
    this.forceReflow(element);

    // Now apply the animation by changing transform
    this.renderer.setProperty(element, '_slideState', 'in');
    this.renderer.setStyle(element, 'transform', 'translateX(0)');

    // Adjust width if in overlap mode
    if (this._options.mode === 'overlap') {
      const element = this.menuLevels.get('level-0')?.element;
      if (!element) {
        throw new Error('Base level not found');
      }
      const baseWidth = this.getElementWidth(element);
      const overlapWidth = parseInt(this._options.overlapWidth || DEFAULT_OVERLAP_WIDTH, 10);
      const levelWidth = baseWidth + level * overlapWidth;

      this.renderer.setStyle(element, 'width', `${levelWidth}px`);
    }

    this.currentLevel = level;
    this.activeLevelHolders = [...this.activeLevelHolders, element];
    this.visibleLevelHolders = [...this.visibleLevelHolders, element];

    // Push content further if in overlap mode
    if (this._options.mode === 'overlap') {
      const overlapWidth = parseInt(this._options.overlapWidth || DEFAULT_OVERLAP_WIDTH, 10);
      this.pushContent(overlapWidth * level);
    }

    // Trigger change detection to apply animations
    this.cdr.detectChanges();
  }

  collapseToLevel(level: number) {
    // Find all levels higher than the target level
    Array.from(this.menuLevels.entries())
      .filter(
        ([, value]) =>
          parseInt(value.element.getAttribute('data-level') ?? '0', 10) > level
      )
      .forEach(([, value]) => {
        // Hide these levels
        const element = value.element;

        // Force a reflow before changing transform to ensure animation works
        this.forceReflow(element);

        // Apply animation by directly modifying transform style with proper timing
        const animState = this._options.direction === 'rtl' ? 'outRtl' : 'out';
        this.renderer.setProperty(element, '_slideState', animState);

        // Set transform immediately to trigger animation
        if (this._options.direction === 'rtl') {
          this.renderer.setStyle(element, 'transform', 'translateX(100%)');
        } else {
          this.renderer.setStyle(element, 'transform', 'translateX(-100%)');
        }

        // We need to set visibility to hidden after animation completes
        setTimeout(() => {
          this.renderer.setStyle(element, 'visibility', 'hidden');
        }, 400); // Match animation duration
      });

    // Update active level
    this.currentLevel = level;
    this.activeLevelHolders = this.activeLevelHolders.filter(
      (holder) =>
        parseInt(holder.getAttribute('data-level') ?? '0', 10) <= level
    );

    // Adjust the push content based on the active level
    if (this._options.mode === 'overlap') {
      const overlapWidth = parseInt(this._options.overlapWidth || DEFAULT_OVERLAP_WIDTH, 10);
      this.pushContent(overlapWidth * level);
    }

    // Trigger change detection to apply animations
    this.cdr.detectChanges();
  }

  pushContent(amount: number) {
    if (!this.contentContainer) return;

    const menuWidth = this.parseSize(this._options.menuWidth || '300px');
    const totalPush = menuWidth + amount + 20; // 20px is additional padding

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

  // Touch/swipe support
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (!this._options.swipe || this._options.swipe === 'none') return;
    if (this._options.swipe === 'desktop') return;

    this.startX = event.touches[0].clientX;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this._options.swipe || this._options.swipe === 'none') return;
    if (this._options.swipe === 'desktop') return;

    const currentX = event.touches[0].clientX;
    const diff = currentX - this.startX;
    const threshold = parseInt(this._options.overlapWidth || DEFAULT_OVERLAP_WIDTH, 10) * 0.3;

    if (Math.abs(diff) > threshold) {
      if (this._options.direction === 'rtl') {
        diff < 0 ? this.expandMenu() : this.collapseMenu(this.currentLevel - 1);
      } else {
        diff > 0 ? this.expandMenu() : this.collapseMenu(this.currentLevel - 1);
      }

      this.startX = 0;
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (!this._options.swipe || this._options.swipe === 'none') return;
    if (this._options.swipe === 'touchscreen') return;

    this.startX = event.clientX;

    const mouseMoveHandler = (e: MouseEvent) => {
      const diff = e.clientX - this.startX;
      const threshold = parseInt(this._options.overlapWidth || DEFAULT_OVERLAP_WIDTH, 10) * 0.3;

      if (Math.abs(diff) > threshold) {
        if (this._options.direction === 'rtl') {
          diff < 0
            ? this.expandMenu()
            : this.collapseMenu(this.currentLevel - 1);
        } else {
          diff > 0
            ? this.expandMenu()
            : this.collapseMenu(this.currentLevel - 1);
        }

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

  clearMenu() {
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
    // First check for touch capability (most reliable modern approach)
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      // Additional check for mobile user agent to avoid detecting tablets as mobile
      const userAgent = navigator.userAgent.toLowerCase();
      return /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      );
    }

    // Fall back to checking media query for small screens as another signal
    return window.matchMedia('(max-width: 767px)').matches;
  }

  ngOnDestroy() {
    if (this.collapseSubscription) {
      this.collapseSubscription.unsubscribe();
    }
    if (this.expandSubscription) {
      this.expandSubscription.unsubscribe();
    }
  }
}
