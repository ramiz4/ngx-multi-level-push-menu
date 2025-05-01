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
import {
  SwipeDirection,
  SwipeDirective,
  SwipeEvent,
} from './directives/swipe.directive';
import {
  MenuLevelData,
  MultiLevelPushMenuItem,
  MultiLevelPushMenuOptions,
} from './multi-level-push-menu.model';
import { MultiLevelPushMenuService } from './multi-level-push-menu.service';
import { DeviceDetectorService } from './services/device-detector.service';
import { MenuAnimationService } from './services/menu-animation.service';
import { MenuBuilderService } from './services/menu-builder.service';
import { MenuDomService } from './services/menu-dom.service';
import { MenuUtils } from './utilities/menu-utils';

// Constants
const ANIMATION_DURATION = 400;

@Component({
  selector: 'ramiz4-multi-level-push-menu',
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

  // Subscriptions
  private collapseSubscription: Subscription = new Subscription();
  private expandSubscription: Subscription = new Subscription();

  @Input()
  set options(options: MultiLevelPushMenuOptions) {
    // Apply any custom options
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
    private cdr: ChangeDetectorRef,
    private deviceDetectorService: DeviceDetectorService,
    private menuAnimationService: MenuAnimationService,
    private menuBuilderService: MenuBuilderService,
    private menuDomService: MenuDomService
  ) {}

  ngOnInit(): void {
    this.isMobile = this.deviceDetectorService.isMobile();
    this.setupSubscriptions();
  }

  ngAfterViewInit(): void {
    this.initMenu();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
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

  expandMenu(): void {
    const baseLevel = this.menuLevels.get('level-0');
    if (!baseLevel) return;

    const element = baseLevel.element;

    // Animate expand
    this.menuAnimationService.animateExpand(this.renderer, element);

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

    this._options.collapsed = false;
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

    this.cdr.detectChanges();
  }

  collapseToLevel(level: number): void {
    // Animate higher levels out
    this.menuAnimationService.animateHigherLevelsOut(
      this.renderer,
      this.menuLevels,
      level,
      this._options.direction === 'rtl'
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
    if (this._options.direction === 'rtl') {
      // Handle RTL mode
      if (event.direction === SwipeDirection.Left) {
        this.expandMenu();
      } else {
        this.collapseMenu(this.currentLevel - 1);
      }
    } else {
      // Handle LTR mode
      if (event.direction === SwipeDirection.Right) {
        this.expandMenu();
      } else {
        this.collapseMenu(this.currentLevel - 1);
      }
    }
  }
}
