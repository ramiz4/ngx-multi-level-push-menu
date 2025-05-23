import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BASE_LEVEL_KEY } from './constants';
import { SwipeDirection, SwipeDirective } from './directives/swipe.directive';
import { KeyNavigationEvent, MenuLevelData, SwipeEvent } from './interfaces';
import { MultiLevelPushMenuItem, MultiLevelPushMenuOptions } from './models';
import { MultiLevelPushMenuService } from './multi-level-push-menu.service';
import {
  AccessibilityService,
  BrowserCompatibilityService,
  DeviceDetectorService,
  MenuAnimationService,
  MenuBuilderService,
  MenuDomService,
} from './services';
import { MenuUtils } from './utilities/menu-utils';

// Constants
const ANIMATION_DURATION = 400;

@Component({
  selector: 'ramiz4-multi-level-push-menu',
  templateUrl: './multi-level-push-menu.component.html',
  styleUrls: ['./multi-level-push-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(-100%)' })),
      state('outRtl', style({ transform: 'translateX(100%)' })),
      transition('in => out', [animate(`${ANIMATION_DURATION}ms ease-in-out`)]),
      transition('out => in', [animate(`${ANIMATION_DURATION}ms ease-in-out`)]),
      transition('in => outRtl', [
        animate(`${ANIMATION_DURATION}ms ease-in-out`),
      ]),
      transition('outRtl => in', [
        animate(`${ANIMATION_DURATION}ms ease-in-out`),
      ]),
    ]),
  ],
  providers: [
    DeviceDetectorService,
    MenuAnimationService,
    MenuBuilderService,
    MenuDomService,
    AccessibilityService,
    BrowserCompatibilityService,
  ],
  imports: [CommonModule, SwipeDirective],
})
export class MultiLevelPushMenuComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('contentContainer') contentContainer!: ElementRef;

  private _options = new MultiLevelPushMenuOptions();
  private activeLevelHolders: HTMLElement[] = [];
  private menuLevels = new Map<string, MenuLevelData>();
  private isMobile = false;
  private currentLevel = 0;
  private visibleLevelHolders: HTMLElement[] = [];
  private lastActiveLevel = 0;
  private lastActiveLevelKey = BASE_LEVEL_KEY;
  // Make isSwiping public so it can be accessed from the template
  public isSwiping = false;

  // Focus management
  private focusTrapCleanupFn: (() => void) | null = null;
  // Store previous focus to restore when menu is closed
  private previousActiveElement: Element | null = null;

  // Subscriptions
  private collapseSubscription: Subscription = new Subscription();
  private expandSubscription: Subscription = new Subscription();

  @Input()
  set menu(menuItems: MultiLevelPushMenuItem[]) {
    if (menuItems) {
      this._options.menu = menuItems;

      if (this.menuContainer) {
        this.initMenu();
        this.cdr.markForCheck();
      }
    }
  }

  @Input()
  set options(options: MultiLevelPushMenuOptions) {
    // Apply any custom options
    if (options) {
      Object.assign(this._options, options);
    }

    if (this.menuContainer) {
      this.initMenu();
      this.cdr.markForCheck();
    }
  }

  get options(): MultiLevelPushMenuOptions {
    return this._options;
  }

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private multiLevelPushMenuService: MultiLevelPushMenuService,
    private cdr: ChangeDetectorRef,
    private deviceDetectorService: DeviceDetectorService,
    private menuAnimationService: MenuAnimationService,
    private menuBuilderService: MenuBuilderService,
    private menuDomService: MenuDomService,
    private accessibilityService: AccessibilityService,
    private browserCompatibilityService: BrowserCompatibilityService
  ) {}

  ngOnInit(): void {
    this.isMobile = this.deviceDetectorService.isMobile();
    this.setupSubscriptions();

    // Store the currently focused element to restore later
    this.previousActiveElement = document.activeElement;
  }

  ngAfterViewInit(): void {
    this.initMenu();

    // Set up ARIA landmarks on the menu container
    if (this.menuContainer) {
      this.accessibilityService.setupAriaLandmarks(
        this.renderer,
        this.menuContainer.nativeElement
      );
    }

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.cleanupFocusTrap();

    // Restore focus to previous element if it exists
    if (
      this.previousActiveElement &&
      this.previousActiveElement instanceof HTMLElement
    ) {
      this.previousActiveElement.focus();
    }
  }

  /**
   * Helper method to convert string to number for template binding
   */
  toNumber(value: string): number {
    return parseInt(value, 10);
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

    this.menuDomService.setContentPositionAndWidth(
      this.renderer,
      this.contentContainer.nativeElement,
      this._options.menuWidth
    );

    this.createMenuStructure();

    // Initialize in expanded state by default, unless explicitly set to collapsed
    if (!this._options.collapsed) {
      this.expandMenu();
    }
  }

  // Menu structure creation
  createMenuStructure(): void {
    if (!this._options.menu) return;

    // Create the menu structure using the builder service
    this.activeLevelHolders = this.menuBuilderService.createMenuStructure(
      this.renderer,
      this.menuContainer.nativeElement,
      this._options,
      this.menuLevels,
      (event: MouseEvent) => this.titleIconClick(event),
      (
        sublevelKey: string,
        nextLevel: number,
        item: MultiLevelPushMenuItem,
        parentLevelHolder: HTMLElement
      ) =>
        this.handleSubmenuClick(
          sublevelKey,
          nextLevel,
          item,
          parentLevelHolder
        ),
      (backAnchor: HTMLElement, levelHolder: HTMLElement) =>
        this.handleBackItemClick(levelHolder),
      (anchor: HTMLElement, item: MultiLevelPushMenuItem) =>
        this.handleMenuItemClick(item)
    );

    // Apply browser-specific fixes to all created level holders
    this.activeLevelHolders.forEach((levelHolder) => {
      this.browserCompatibilityService.applyBrowserFixes(levelHolder);
    });

    // Set current level and visible holders
    this.currentLevel = 0;
    this.visibleLevelHolders = [...this.activeLevelHolders];
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

  handleSubmenuClick(
    sublevelKey: string,
    nextLevel: number,
    item: MultiLevelPushMenuItem,
    parentLevelHolder: HTMLElement
  ): void {
    // Emit group item click event
    this.multiLevelPushMenuService.groupItemClicked(item);

    if (!this.menuLevels.has(sublevelKey)) {
      this.menuBuilderService.createSubmenu(
        this.renderer,
        this.menuContainer.nativeElement,
        sublevelKey,
        nextLevel,
        item,
        parentLevelHolder,
        this._options,
        this.menuLevels,
        (event) => this.titleIconClick(event),
        (subKey, level, menuItem, parentHolder) =>
          this.handleSubmenuClick(subKey, level, menuItem, parentHolder),
        (anchor, holder) => this.handleBackItemClick(holder),
        (anchor, menuItem) => this.handleMenuItemClick(menuItem)
      );
    }

    // Add a small delay before showing the sublevel
    setTimeout(() => {
      this.expandSubMenu(sublevelKey, nextLevel);
    }, 10);
  }

  private handleBackItemClick(levelHolder: HTMLElement): void {
    // Get the current level
    const level = parseInt(levelHolder.getAttribute('data-level') ?? '0', 10);
    const targetLevel = level - 1;

    // Get target level element
    const targetLevelKey = `level-${targetLevel}`;
    const targetLevelData = this.menuLevels.get(targetLevelKey);

    if (!targetLevelData) return;

    this.handleBackNavigation(
      levelHolder,
      targetLevelData.element,
      targetLevel
    );
  }

  private handleBackNavigation(
    currentLevelHolder: HTMLElement,
    targetLevelHolder: HTMLElement,
    targetLevel: number
  ): void {
    // Make sure the target level is visible
    this.renderer.setStyle(targetLevelHolder, 'visibility', 'visible');

    // Animate the current level out
    this.menuAnimationService.slideOut(
      this.renderer,
      currentLevelHolder,
      this._options.direction === 'rtl',
      () => {
        this.renderer.setStyle(currentLevelHolder, 'visibility', 'hidden');
        this.updateNavigationState(targetLevel);

        // If navigating back to root level, reset lastActiveLevel variables
        // This ensures that expand after back button + collapse will open root menu
        if (targetLevel === 0) {
          this.lastActiveLevel = 0;
          this.lastActiveLevelKey = BASE_LEVEL_KEY;
        }

        // Setup focus trap on the target level for accessibility
        this.setupFocusTrap(targetLevelHolder);

        // Announce to screen readers
        const levelTitle =
          targetLevelHolder.querySelector('.title')?.textContent ||
          'Previous menu';
        this.accessibilityService.announceToScreenReader(
          `Returned to ${levelTitle} level. Use arrow keys to navigate.`
        );
      }
    );
  }

  private handleMenuItemClick(item: MultiLevelPushMenuItem): void {
    // Emit menu item click event
    this.multiLevelPushMenuService.menuItemClicked(item);

    // Navigate if there's a link
    if (item.link && item.link !== '#') {
      this.router.navigateByUrl(item.link);
    }
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
      this.menuDomService.pushContent(
        this.renderer,
        this.contentContainer.nativeElement,
        overlapWidth * targetLevel,
        this._options.menuWidth
      );
    }

    this.cdr.detectChanges();
  }

  // Menu collapse/expand methods
  collapseMenu(
    level?: number,
    animationSpeed: 'fast' | 'normal' = 'normal'
  ): void {
    // Store current state before collapsing
    if (this.currentLevel > 0 && level === undefined) {
      this.lastActiveLevel = this.currentLevel;
      this.lastActiveLevelKey = `level-${this.currentLevel}`;

      // Hide all visible submenus when doing a full collapse
      this.visibleLevelHolders.forEach((holder) => {
        const holderLevel = parseInt(
          holder.getAttribute('data-level') ?? '0',
          10
        );
        if (holderLevel > 0) {
          this.renderer.setStyle(holder, 'visibility', 'hidden');
        }
      });

      // Reset the level tracking variables
      this.currentLevel = 0;
      this.visibleLevelHolders = this.visibleLevelHolders.filter(
        (holder) => parseInt(holder.getAttribute('data-level') ?? '0', 10) === 0
      );
    }

    if (level === undefined) {
      this.performFullCollapse(animationSpeed);
    } else {
      this.collapseToLevel(level, animationSpeed);
    }
  }

  private performFullCollapse(animationSpeed: 'fast' | 'normal'): void {
    const baseLevel = this.menuLevels.get(BASE_LEVEL_KEY);
    if (!baseLevel) return;

    const element = baseLevel.element;

    // Calculate the position
    const width = MenuUtils.getElementWidth(element);
    const overlapWidth = parseInt(this._options.overlapWidth, 10);

    // Animate collapse
    this.menuAnimationService.animateCollapse(
      this.renderer,
      element,
      this._options.direction === 'rtl',
      this._options.fullCollapse,
      width,
      overlapWidth,
      animationSpeed,
      () => {
        // Push content
        const marginLeft = this._options.fullCollapse
          ? -width
          : -width + overlapWidth;
        this.menuDomService.pushContent(
          this.renderer,
          this.contentContainer.nativeElement,
          marginLeft,
          this._options.menuWidth
        );

        // Hide submenu items
        const menuUl = element.querySelector('ul');
        if (menuUl) {
          this.renderer.setStyle(menuUl, 'display', 'none');
        }

        this.currentLevel = 0;
        this._options.collapsed = true;
      }
    );
  }

  expandMenu(animationSpeed: 'fast' | 'normal' = 'normal'): void {
    const baseLevel = this.menuLevels.get(BASE_LEVEL_KEY);
    if (!baseLevel) return;

    const element = baseLevel.element;

    // Animate expand
    this.menuAnimationService.animateExpand(
      this.renderer,
      element,
      animationSpeed
    );

    // Show menu items
    const menuUl = element.querySelector('ul');
    if (menuUl) {
      this.renderer.setStyle(menuUl, 'display', 'block');
    }

    // Reset content position
    this.menuDomService.pushContent(
      this.renderer,
      this.contentContainer.nativeElement,
      0,
      this._options.menuWidth
    );

    // Accessibility enhancements
    this.setupFocusTrap(element);
    this.bindKeyNavigationEvents(element);

    // Announce menu expansion to screen readers
    this.accessibilityService.announceToScreenReader(
      'Menu expanded. Use arrow keys to navigate.'
    );

    this._options.collapsed = false;

    // Restore previous submenu state if available
    if (this.lastActiveLevel > 0) {
      const sublevel = this.menuLevels.get(this.lastActiveLevelKey);
      if (sublevel) {
        // Use a timeout to ensure the base menu is fully expanded first
        setTimeout(() => {
          // For each level up to the last active level, expand the submenu
          for (let i = 1; i <= this.lastActiveLevel; i++) {
            const levelKey = `level-${i}`;
            const levelData = this.menuLevels.get(levelKey);
            if (levelData) {
              this.expandSubMenu(levelKey, i);
            }
          }
        }, 100);
      }
    }
  }

  expandSubMenu(sublevelKey: string, level: number): void {
    const sublevel = this.menuLevels.get(sublevelKey);
    if (!sublevel) return;

    const element = sublevel.element;

    // Animate slide in
    this.menuAnimationService.slideIn(this.renderer, element);

    // Adjust menu width in overlap mode
    this.menuBuilderService.adjustMenuWidthInOverlapMode(
      this.renderer,
      this.menuLevels,
      level,
      this._options
    );

    // Update navigation state
    this.currentLevel = level;
    this.activeLevelHolders = [...this.activeLevelHolders, element];
    this.visibleLevelHolders = [...this.visibleLevelHolders, element];

    // Push content in overlap mode
    if (this._options.mode === 'overlap') {
      const overlapWidth = parseInt(this._options.overlapWidth, 10);
      this.menuDomService.pushContent(
        this.renderer,
        this.contentContainer.nativeElement,
        overlapWidth * level,
        this._options.menuWidth
      );
    }

    // Accessibility enhancements
    // Set up focus trap and bind keyboard navigation events
    this.setupFocusTrap(element);
    this.bindKeyNavigationEvents(element);

    // Announce the submenu to screen readers
    const menuTitle = element.querySelector('.title')?.textContent;
    if (menuTitle) {
      this.accessibilityService.announceToScreenReader(
        `Opened submenu: ${menuTitle}. Use arrow keys to navigate.`
      );
    }

    this.cdr.detectChanges();
  }

  collapseToLevel(level: number, animationSpeed: 'fast' | 'normal'): void {
    // Animate higher levels out
    this.menuAnimationService.animateHigherLevelsOut(
      this.renderer,
      this.menuLevels,
      level,
      this._options.direction === 'rtl',
      animationSpeed
    );

    // Update active level and related state
    this.currentLevel = level;
    this.activeLevelHolders = this.activeLevelHolders.filter(
      (holder) =>
        parseInt(holder.getAttribute('data-level') ?? '0', 10) <= level
    );

    // Adjust content position in overlap mode
    if (this._options.mode === 'overlap') {
      const overlapWidth = parseInt(this._options.overlapWidth, 10);
      this.menuDomService.pushContent(
        this.renderer,
        this.contentContainer.nativeElement,
        overlapWidth * level,
        this._options.menuWidth
      );
    }

    this.cdr.detectChanges();
  }

  /**
   * Handle swipe events from the SwipeDirective
   */
  onSwipeDetected(event: SwipeEvent): void {
    // Use velocity to determine how fast to animate the menu
    const animationSpeed =
      event.velocity && event.velocity > 0.5
        ? 'fast' // Fast swipe
        : 'normal'; // Normal swipe

    if (this._options.direction === 'rtl') {
      // Handle RTL mode
      if (event.direction === SwipeDirection.Left) {
        this.expandMenu(animationSpeed);
      } else if (
        event.direction === SwipeDirection.Right &&
        this.currentLevel > 0
      ) {
        this.collapseMenu(this.currentLevel - 1, animationSpeed);
      } else if (event.direction === SwipeDirection.Right) {
        this.collapseMenu(undefined, animationSpeed);
      }
    } else {
      // Handle LTR mode
      if (event.direction === SwipeDirection.Right) {
        this.expandMenu(animationSpeed);
      } else if (
        event.direction === SwipeDirection.Left &&
        this.currentLevel > 0
      ) {
        this.collapseMenu(this.currentLevel - 1, animationSpeed);
      } else if (event.direction === SwipeDirection.Left) {
        this.collapseMenu(undefined, animationSpeed);
      }
    }
  }

  /**
   * Handle the start of a swipe gesture
   */
  onSwipeStart(): void {
    // We could add visual feedback here in the future
    // For now, simply flag that a swipe has started
    this.isSwiping = true;
  }

  /**
   * Handle when a swipe is canceled
   */
  onSwipeCancel(): void {
    // Reset any visual indicators we might have added
    this.isSwiping = false;
  }

  /**
   * Handle keyboard navigation events from menu items
   */
  handleKeyNavigation(
    event: KeyNavigationEvent,
    levelElement: HTMLElement
  ): void {
    this.accessibilityService.handleKeyboardNavigation(
      event.direction,
      event.sourceElement,
      levelElement,
      this._options.direction === 'rtl'
    );

    // Announce navigation to screen readers
    this.accessibilityService.announceToScreenReader(
      `Navigated ${event.direction}.`
    );
  }

  /**
   * Setup focus trap for the current level
   */
  setupFocusTrap(element: HTMLElement): void {
    // Clean up any existing focus trap
    this.cleanupFocusTrap();

    // Create a new focus trap
    this.focusTrapCleanupFn = this.accessibilityService.createFocusTrap(
      this.renderer,
      element
    );

    // Announce level to screen readers
    const levelTitle = element.querySelector('.title')?.textContent || 'Menu';
    this.accessibilityService.announceToScreenReader(
      `${levelTitle} level. Use arrow keys to navigate.`
    );
  }

  /**
   * Clean up any existing focus trap
   */
  private cleanupFocusTrap(): void {
    if (this.focusTrapCleanupFn) {
      this.focusTrapCleanupFn();
      this.focusTrapCleanupFn = null;
    }
  }

  /**
   * Add event listeners for keyboard navigation
   */
  private bindKeyNavigationEvents(element: HTMLElement): void {
    // Add event listeners for keyNavigation events from menu items
    const menuItems = element.querySelectorAll('[ramiz4MenuItem]');

    menuItems.forEach((item: Element) => {
      this.renderer.listen(
        item,
        'keyNavigation',
        (event: KeyNavigationEvent) => {
          this.handleKeyNavigation(event, element);
        }
      );
    });
  }
}
