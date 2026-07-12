import {
  CommonModule,
  DOCUMENT,
  isPlatformBrowser,
  Location,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  PLATFORM_ID,
  Signal,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SwipeDirection, SwipeDirective } from './directives/swipe.directive';
import { MenuActivationEvent, SwipeEvent } from './interfaces';
import { MenuIconComponent } from './menu-icon.component';
import { MultiLevelPushMenuItem, MultiLevelPushMenuOptions } from './models';
import {
  MultiLevelPushMenuCommand,
  MultiLevelPushMenuService,
} from './multi-level-push-menu.service';

interface MenuLevel {
  readonly key: string;
  readonly title: string;
  readonly icon?: string;
  readonly items: readonly MultiLevelPushMenuItem[];
  readonly path: readonly MultiLevelPushMenuItem[];
  readonly parentItemIndex?: number;
}

interface MenuRail {
  readonly key: string;
  readonly levelIndex: number;
  readonly title: string;
  readonly icon?: string;
}

@Component({
  selector: 'ngx-multi-level-push-menu, ramiz4-multi-level-push-menu',
  standalone: true,
  imports: [CommonModule, MenuIconComponent, SwipeDirective],
  templateUrl: './multi-level-push-menu.component.html',
  styleUrls: ['./multi-level-push-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiLevelPushMenuComponent implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly menuService = inject(MultiLevelPushMenuService);
  private readonly router = inject(Router, { optional: true });
  private readonly location = inject(Location, { optional: true });
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private _options = new MultiLevelPushMenuOptions();
  private explicitMenu: readonly MultiLevelPushMenuItem[] = [];
  private hasExplicitMenu = false;
  private hasExplicitCollapsedInput = false;
  private hasReceivedOptions = false;
  private focusFrame: number | null = null;
  private levelExitTimer: number | null = null;
  private readonly serviceSubscription: Subscription;
  private readonly levelsState = signal<readonly MenuLevel[]>([]);
  private readonly activeLevelIndexState = signal(0);
  private readonly collapsedState = signal(false);
  private readonly swipingState = signal(false);
  private readonly announcementState = signal('');
  private readonly enteringLevelKeyState = signal<string | null>(null);
  private readonly exitingLevelKeyState = signal<string | null>(null);
  private exitTargetDepth: number | null = null;
  private exitFocusSelector: string | null = null;

  /** @internal Read-only template state; writable signals stay private. */
  protected readonly levels: Signal<readonly MenuLevel[]> =
    this.levelsState.asReadonly();
  /** @internal */
  protected readonly isCollapsed = this.collapsedState.asReadonly();
  /** @internal */
  protected readonly isSwiping = this.swipingState.asReadonly();
  /** @internal */
  protected readonly announcement = this.announcementState.asReadonly();
  /** @internal Decorative entry state; visibility never depends on cleanup. */
  protected readonly enteringLevelKey = this.enteringLevelKeyState.asReadonly();
  /** @internal Decorative exit state; the panel stays mounted until motion ends. */
  protected readonly exitingLevelKey = this.exitingLevelKeyState.asReadonly();

  @Input()
  set menu(menuItems: readonly MultiLevelPushMenuItem[] | null | undefined) {
    const shouldRestoreFocus = this.focusIsInsideNavigation();
    this.hasExplicitMenu = true;
    this.explicitMenu = menuItems ?? [];
    this.resetLevels();
    if (shouldRestoreFocus) this.scheduleActiveLevelFocus();
  }

  @Input()
  set options(
    options:
      | MultiLevelPushMenuOptions
      | Partial<MultiLevelPushMenuOptions>
      | null
      | undefined,
  ) {
    this.completePendingLevelExit();
    const shouldRestoreFocus = this.focusIsInsideNavigation();
    const previousDepth = this.activeLevelIndex;
    const previousRootItems = this.rootItems();
    const previousConfiguredCollapsed = Boolean(this._options.collapsed);
    this._options = new MultiLevelPushMenuOptions(options ?? undefined);
    if (previousRootItems !== this.rootItems()) {
      this.resetLevels();
    } else {
      this.refreshLevelsAfterOptionsChange();
    }
    const configuredCollapsedChanged =
      !this.hasReceivedOptions ||
      previousConfiguredCollapsed !== Boolean(this._options.collapsed);
    this.hasReceivedOptions = true;
    if (!this.hasExplicitCollapsedInput && configuredCollapsedChanged) {
      this.transitionCollapsed(Boolean(this._options.collapsed), false);
    }
    if (shouldRestoreFocus && previousDepth !== this.activeLevelIndex) {
      this.scheduleActiveLevelFocus();
    }
  }

  get options(): MultiLevelPushMenuOptions {
    return this._options;
  }

  /** Enables `[(collapsed)]` without requiring the service. */
  @Input()
  set collapsed(value: boolean | null | undefined) {
    if (value !== null && value !== undefined) {
      this.hasExplicitCollapsedInput = true;
      this.transitionCollapsed(value, false);
    }
  }

  get collapsed(): boolean {
    return this.collapsedState();
  }

  @Output() readonly collapsedChange = new EventEmitter<boolean>();
  @Output() readonly menuOpen = new EventEmitter<boolean>();
  @Output() readonly menuClose = new EventEmitter<boolean>();
  @Output() readonly itemClick = new EventEmitter<MultiLevelPushMenuItem>();
  @Output() readonly groupItemClick =
    new EventEmitter<MultiLevelPushMenuItem>();
  @Output() readonly itemActivate = new EventEmitter<MenuActivationEvent>();
  @Output() readonly groupActivate = new EventEmitter<MenuActivationEvent>();
  @Output() readonly levelChange = new EventEmitter<number>();

  constructor() {
    this.resetLevels();
    this.serviceSubscription = this.menuService.commands$.subscribe((command) =>
      this.handleServiceCommand(command),
    );
  }

  ngOnDestroy(): void {
    this.serviceSubscription.unsubscribe();
    this.cancelPendingFocus();
    this.cancelLevelExitTimer();
  }

  get activeLevelIndex(): number {
    return Math.max(
      0,
      Math.min(this.activeLevelIndexState(), this.levels().length - 1),
    );
  }

  /** @internal */
  protected get activeLevel(): MenuLevel | undefined {
    return this.levels()[this.activeLevelIndex];
  }

  /** @internal */
  protected get menuWidth(): string {
    return this.toCssLength(this._options.menuWidth, '300px');
  }

  /** @internal */
  protected get menuHeight(): string {
    return this.toCssLength(this._options.menuHeight, '100%');
  }

  /** @internal */
  protected get overlapWidth(): string {
    return this.toCssLength(this._options.overlapWidth, '55px');
  }

  /** @internal */
  protected get activeOverlapOffset(): string {
    return this.repeatedCssLength(this.overlapWidth, this.renderedLevelIndex);
  }

  /** @internal Ancestors ordered from the active panel out toward content. */
  protected get ancestorRails(): readonly MenuRail[] {
    return this.levels()
      .slice(0, this.renderedLevelIndex)
      .map((level, levelIndex) => ({
        key: level.key,
        levelIndex,
        title: level.title,
        icon: level.icon,
      }))
      .reverse();
  }

  /** @internal */
  protected get overlapWidthPixels(): number {
    const value =
      typeof this._options.overlapWidth === 'number'
        ? this._options.overlapWidth
        : Number.parseFloat(this._options.overlapWidth);
    return Number.isFinite(value) ? Math.max(value, 0) : 55;
  }

  /** @internal */
  protected get animationDuration(): string {
    const value = this._options.animationDuration;
    if (typeof value === 'number') return `${Math.max(value, 0)}ms`;
    return value?.trim() || '500ms';
  }

  /** @internal */
  protected get wrapperClasses(): string[] {
    return [
      this._options.wrapperClass || '',
      this.isCollapsed() ? this._options.menuInactiveClass || '' : '',
    ].filter(Boolean);
  }

  /** @internal */
  protected get navigationLabel(): string {
    return this._options.ariaLabel || this._options.title || 'Main navigation';
  }

  /** @internal */
  protected get toggleLabel(): string {
    return `${this.isCollapsed() ? 'Expand' : 'Collapse'} ${
      this.navigationLabel
    }`;
  }

  /** @internal */
  protected readonly trackLevel = (_index: number, level: MenuLevel): string =>
    level.key;

  /** @internal */
  protected readonly trackItem = (
    index: number,
    item: MultiLevelPushMenuItem,
  ): string => this.itemKey(item, index);

  /** @internal */
  protected readonly trackRail = (_index: number, rail: MenuRail): string =>
    rail.key;

  /** @internal */
  protected itemLabel(item: MultiLevelPushMenuItem): string {
    return item.name || item.title || item.id || 'Untitled item';
  }

  /** @internal */
  protected itemAriaLabel(item: MultiLevelPushMenuItem): string {
    return item.ariaLabel || this.itemLabel(item);
  }

  /** @internal */
  protected hasChildren(item: MultiLevelPushMenuItem): boolean {
    return Array.isArray(item.items) && item.items.length > 0;
  }

  /** @internal */
  protected hasLink(item: MultiLevelPushMenuItem): boolean {
    return (
      !item.disabled &&
      typeof item.link === 'string' &&
      item.link.trim().length > 0
    );
  }

  /** @internal */
  protected safeRel(item: MultiLevelPushMenuItem): string | null {
    if (item.rel) return item.rel;
    return item.target === '_blank' ? 'noopener noreferrer' : null;
  }

  /** @internal */
  protected isLevelActive(index: number): boolean {
    return index === this.activeLevelIndex;
  }

  /** @internal */
  protected isLevelAccessible(index: number): boolean {
    return (
      this.isLevelActive(index) &&
      (!this.isCollapsed() || !this._options.fullCollapse)
    );
  }

  /** @internal */
  protected railLabel(rail: MenuRail): string {
    return `Back to ${rail.title}`;
  }

  /** @internal */
  protected railTabIndex(levelIndex: number): number {
    void levelIndex;
    return this.isCollapsed() || this.exitingLevelKey() !== null ? -1 : 0;
  }

  /** @internal */
  protected railIsAccessible(): boolean {
    return !this.isCollapsed() && this.exitingLevelKey() === null;
  }

  /** @internal */
  protected activeToggleTabIndex(levelIndex: number): number {
    return this.isLevelActive(levelIndex) && !this._options.fullCollapse
      ? 0
      : -1;
  }

  /** @internal */
  protected coverLevelOffset(index: number): string {
    if (index <= this.activeLevelIndex) return '0%';
    return this._options.direction === 'rtl' ? '100%' : '-100%';
  }

  /** @internal */
  protected openSubmenu(
    item: MultiLevelPushMenuItem,
    itemIndex: number,
    originalEvent: MouseEvent | KeyboardEvent,
  ): void {
    if (item.disabled || !this.hasChildren(item)) return;

    this.completePendingLevelExit();

    originalEvent.preventDefault();
    if (this._options.preventGroupItemClick) {
      originalEvent.stopPropagation();
    }
    const current = this.activeLevel;
    if (!current) return;

    if (current.path.includes(item)) {
      this.announce(
        'This submenu contains a circular reference and cannot be opened.',
      );
      return;
    }

    if (this.activeLevelIndex >= this.normalizedMaxDepth()) {
      this.announce('Maximum menu depth reached.');
      return;
    }

    const path = [...current.path, item];
    const nextLevel: MenuLevel = {
      key: `${current.key}/${this.itemKey(item, itemIndex)}`,
      title: this.itemLabel(item),
      icon: item.icon,
      items: item.items ?? [],
      path,
      parentItemIndex: itemIndex,
    };

    this.enteringLevelKeyState.set(nextLevel.key);
    this.levelsState.update((levels) => {
      const nextLevels = [...levels, nextLevel];
      this.activeLevelIndexState.set(nextLevels.length - 1);
      return nextLevels;
    });
    this.emitGroupActivation(item, originalEvent, path);
    this.emitLevelChanged();
    this.announce(`Opened ${nextLevel.title}.`);
    this.scheduleActiveLevelFocus();
  }

  /** @internal */
  protected finishLevelMotion(key: string, event: AnimationEvent): void {
    if (event.target !== event.currentTarget) return;
    if (this.enteringLevelKeyState() === key) {
      this.enteringLevelKeyState.set(null);
    }
    if (this.exitingLevelKeyState() === key) {
      this.completeLevelExit(key);
    }
  }

  /** @internal */
  protected activateItem(
    item: MultiLevelPushMenuItem,
    originalEvent: MouseEvent | KeyboardEvent,
  ): void {
    if (item.disabled) {
      originalEvent.preventDefault();
      return;
    }

    const level = this.activeLevel;
    const path = [...(level?.path ?? []), item];
    const activation: MenuActivationEvent = {
      item,
      level: this.activeLevelIndex,
      path,
      originalEvent,
    };

    this.itemClick.emit(item);
    this.itemActivate.emit(activation);
    this.menuService.menuItemClicked(item);

    const link = item.link?.trim();
    if (!link || link === '#') {
      originalEvent.preventDefault();
      return;
    }

    if (!this.shouldUseAngularRouter(item, originalEvent)) {
      if (this._options.closeOnNavigation) this.collapseMenu();
      return;
    }

    originalEvent.preventDefault();
    void this.router
      ?.navigateByUrl(link)
      .then((navigated) => {
        if (navigated && this._options.closeOnNavigation) this.collapseMenu();
      })
      .catch(() => {
        // Navigation errors remain owned by the application's Router error handler.
      });
  }

  /** @internal */
  protected itemHref(item: MultiLevelPushMenuItem): string {
    const link = item.link?.trim() || '';
    if (!link || !this.location || this.isNativeOnlyLink(link)) return link;

    return this.location.prepareExternalUrl(link);
  }

  goBack(focusParent = true): void {
    this.returnToDepth(this.activeLevelIndex - 1, focusParent);
  }

  /** @internal */
  protected activateRail(levelIndex: number): void {
    if (levelIndex >= this.activeLevelIndex) return;
    this.returnToDepth(levelIndex, true);
  }

  /** @internal */
  protected closeFromOutside(): void {
    if (!this.isCollapsed()) this.collapseMenu();
  }

  collapseMenu(
    level?: number,
    animationSpeed: 'fast' | 'normal' = 'normal',
  ): void {
    void animationSpeed;
    if (level !== undefined) {
      this.navigateToDepth(level);
      return;
    }

    this.transitionCollapsed(true);
  }

  expandMenu(animationSpeed: 'fast' | 'normal' = 'normal'): void {
    void animationSpeed;
    const wasCollapsed = this.isCollapsed();
    this.transitionCollapsed(false);
    if (wasCollapsed) this.scheduleActiveLevelFocus();
  }

  toggleMenu(): void {
    if (this.isCollapsed()) this.expandMenu();
    else this.collapseMenu();
  }

  openMenu(): void {
    this.expandMenu();
  }

  closeMenu(): void {
    this.collapseMenu();
  }

  navigateToLevel(levelOrId: number | string): void {
    if (typeof levelOrId === 'number') {
      this.navigateToDepth(levelOrId);
      return;
    }

    const path = this.findItemPath(this.rootItems(), levelOrId);
    if (!path) return;

    const previousDepth = this.activeLevelIndex;
    this.rebuildStackFromPath(path);
    if (this.activeLevelIndex !== previousDepth) this.emitLevelChanged();
    this.transitionCollapsed(false);
    this.scheduleActiveLevelFocus();
  }

  /** @internal */
  protected onControlKeydown(
    event: KeyboardEvent,
    item?: MultiLevelPushMenuItem,
    itemIndex?: number,
  ): void {
    const levelElement = (event.currentTarget as HTMLElement).closest(
      '.ngx-push-menu__level',
    );
    if (!levelElement) return;

    const controls = Array.from(
      levelElement.querySelectorAll<HTMLElement>(
        '[data-menu-control]:not([disabled]):not([aria-disabled="true"]):not([tabindex="-1"])',
      ),
    );
    const currentIndex = controls.indexOf(event.currentTarget as HTMLElement);

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      const next = (currentIndex + offset + controls.length) % controls.length;
      controls[next]?.focus();
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      controls[event.key === 'Home' ? 0 : controls.length - 1]?.focus();
      return;
    }

    const forwardKey =
      this._options.direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backKey =
      this._options.direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

    if (
      event.key === forwardKey &&
      item &&
      itemIndex !== undefined &&
      this.hasChildren(item)
    ) {
      this.openSubmenu(item, itemIndex, event);
    } else if (event.key === backKey && this.activeLevelIndex > 0) {
      event.preventDefault();
      this.goBack();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (this.activeLevelIndex > 0) this.goBack();
      else this.collapseMenu();
    }
  }

  /** @internal */
  protected onItemKeydown(
    event: KeyboardEvent,
    item: MultiLevelPushMenuItem,
    itemIndex: number,
  ): void {
    this.onControlKeydown(event, item, itemIndex);
  }

  /** @internal */
  protected onSwipeDetected(event: SwipeEvent): void {
    this.swipingState.set(false);
    const expandDirection =
      this._options.direction === 'rtl'
        ? SwipeDirection.Left
        : SwipeDirection.Right;

    if (event.direction === expandDirection) {
      this.expandMenu(
        event.velocity && event.velocity > 0.5 ? 'fast' : 'normal',
      );
    } else if (this.activeLevelIndex > 0) {
      this.goBack(false);
    } else {
      this.collapseMenu(
        undefined,
        event.velocity && event.velocity > 0.5 ? 'fast' : 'normal',
      );
    }
  }

  /** @internal */
  protected onSwipeStart(): void {
    this.swipingState.set(true);
  }

  /** @internal */
  protected onSwipeEnd(): void {
    this.swipingState.set(false);
  }

  private rootItems(): readonly MultiLevelPushMenuItem[] {
    return this.hasExplicitMenu
      ? this.explicitMenu
      : (this._options.menu ?? []);
  }

  private createRootLevel(): MenuLevel {
    return {
      key: 'root',
      title: this._options.title || 'Menu',
      icon: this._options.titleIcon,
      items: this.rootItems(),
      path: [],
    };
  }

  private resetLevels(emit = true): void {
    this.cancelLevelExitTimer();
    this.enteringLevelKeyState.set(null);
    this.exitingLevelKeyState.set(null);
    this.exitTargetDepth = null;
    this.exitFocusSelector = null;
    const previousDepth = this.activeLevelIndex;
    this.levelsState.set([this.createRootLevel()]);
    this.activeLevelIndexState.set(0);
    if (emit && previousDepth !== 0) this.levelChange.emit(0);
  }

  private refreshLevelsAfterOptionsChange(): void {
    const currentLevels = this.levels();
    if (currentLevels.length === 0) {
      this.resetLevels();
      return;
    }

    const previousDepth = this.activeLevelIndex;
    const root = this.createRootLevel();
    const trimmedLevels = currentLevels.slice(0, this.normalizedMaxDepth() + 1);
    const rootChanged =
      trimmedLevels[0].title !== root.title ||
      trimmedLevels[0].icon !== root.icon ||
      trimmedLevels[0].items !== root.items;

    if (!rootChanged && trimmedLevels.length === currentLevels.length) return;

    this.levelsState.set([root, ...trimmedLevels.slice(1)]);
    this.activeLevelIndexState.set(
      Math.min(previousDepth, trimmedLevels.length - 1),
    );
    if (this.activeLevelIndex !== previousDepth) this.emitLevelChanged();
  }

  private navigateToDepth(level: number): void {
    if (!Number.isFinite(level)) return;
    const safeLevel = Math.max(
      0,
      Math.min(Math.trunc(level), this.activeLevelIndex),
    );
    if (safeLevel === this.activeLevelIndex) {
      const wasCollapsed = this.isCollapsed();
      this.transitionCollapsed(false);
      if (wasCollapsed) this.scheduleActiveLevelFocus();
      return;
    }
    this.returnToDepth(safeLevel, false);
    this.transitionCollapsed(false);
    this.scheduleActiveLevelFocus();
  }

  private returnToDepth(level: number, focusParent: boolean): void {
    this.completePendingLevelExit();
    this.enteringLevelKeyState.set(null);
    const currentLevels = this.levels();
    if (currentLevels.length <= 1 || !Number.isFinite(level)) return;

    const safeLevel = Math.max(
      0,
      Math.min(Math.trunc(level), this.activeLevelIndex - 1),
    );
    const shouldRestoreFocus = focusParent && this.focusIsInsideNavigation();
    const firstRemovedLevel = currentLevels[safeLevel + 1];
    const exitingLevel = currentLevels[this.activeLevelIndex];

    this.activeLevelIndexState.set(safeLevel);
    this.exitTargetDepth = safeLevel;
    this.exitingLevelKeyState.set(exitingLevel?.key ?? null);
    this.emitLevelChanged();
    this.announce(`Returned to ${this.activeLevel?.title || 'Menu'}.`);

    this.exitFocusSelector =
      shouldRestoreFocus && firstRemovedLevel?.parentItemIndex !== undefined
        ? `[data-menu-item-index="${firstRemovedLevel.parentItemIndex}"]`
        : null;

    if (!exitingLevel || !this.isBrowser) {
      this.completeLevelExit(exitingLevel?.key ?? '');
      return;
    }

    this.scheduleLevelExitFallback(exitingLevel.key);
  }

  private rebuildStackFromPath(path: readonly MultiLevelPushMenuItem[]): void {
    this.cancelLevelExitTimer();
    this.enteringLevelKeyState.set(null);
    this.exitingLevelKeyState.set(null);
    this.exitTargetDepth = null;
    this.exitFocusSelector = null;
    const stack: MenuLevel[] = [this.createRootLevel()];
    let items = this.rootItems();
    let parentPath: MultiLevelPushMenuItem[] = [];

    for (const item of path.slice(0, this.normalizedMaxDepth())) {
      const itemIndex = items.indexOf(item);
      if (itemIndex < 0 || item.disabled || !this.hasChildren(item)) break;
      parentPath = [...parentPath, item];
      stack.push({
        key: `${stack[stack.length - 1].key}/${this.itemKey(item, itemIndex)}`,
        title: this.itemLabel(item),
        icon: item.icon,
        items: item.items ?? [],
        path: parentPath,
        parentItemIndex: itemIndex,
      });
      items = item.items ?? [];
    }

    this.levelsState.set(stack);
    this.activeLevelIndexState.set(stack.length - 1);
  }

  private findItemPath(
    items: readonly MultiLevelPushMenuItem[],
    target: string,
    path: readonly MultiLevelPushMenuItem[] = [],
    visited = new Set<readonly MultiLevelPushMenuItem[]>(),
  ): readonly MultiLevelPushMenuItem[] | null {
    if (visited.has(items) || path.length >= this.normalizedMaxDepth()) {
      return null;
    }
    visited.add(items);

    for (const item of items) {
      const nextPath = [...path, item];
      const isTarget =
        item.id === target || item.name === target || item.title === target;
      if (!item.disabled && this.hasChildren(item) && isTarget) {
        return nextPath;
      }
      if (!item.disabled && item.items?.length) {
        const nested = this.findItemPath(item.items, target, nextPath, visited);
        if (nested) return nested;
      }
    }
    return null;
  }

  private emitGroupActivation(
    item: MultiLevelPushMenuItem,
    originalEvent: MouseEvent | KeyboardEvent,
    path: readonly MultiLevelPushMenuItem[],
  ): void {
    const activation: MenuActivationEvent = {
      item,
      level: this.activeLevelIndex - 1,
      path,
      originalEvent,
    };
    this.groupItemClick.emit(item);
    this.groupActivate.emit(activation);
    this.menuService.groupItemClicked(item);
  }

  private emitLevelChanged(): void {
    this.levelChange.emit(this.activeLevelIndex);
  }

  private transitionCollapsed(value: boolean, emit = true): void {
    const shouldRestoreFocus = value && this.focusIsInsideNavigation();
    if (value) {
      this.enteringLevelKeyState.set(null);
      this.completePendingLevelExit();
    }

    if (value && !this._options.preserveActiveLevelOnCollapse) {
      this.resetLevels();
    }

    if (this.collapsedState() === value) return;
    this.collapsedState.set(value);

    if (emit) {
      this.collapsedChange.emit(value);
      if (value) {
        this.menuClose.emit(true);
        this.announce('Menu collapsed.');
      } else {
        this.menuOpen.emit(true);
        this.announce('Menu expanded.');
      }
    }

    if (shouldRestoreFocus) {
      if (this._options.fullCollapse) this.scheduleContentFocus();
      else this.scheduleFocus('[data-menu-toggle]');
    }
  }

  private handleServiceCommand(command: MultiLevelPushMenuCommand): void {
    if (command.targetId && command.targetId !== this._options.menuID) return;

    switch (command.type) {
      case 'collapse':
        this.collapseMenu(command.level);
        break;
      case 'expand':
        this.expandMenu();
        break;
      case 'toggle':
        this.toggleMenu();
        break;
      case 'navigate':
        this.navigateToLevel(command.levelOrId);
        break;
      case 'back':
        this.goBack();
        break;
    }
  }

  private shouldUseAngularRouter(
    item: MultiLevelPushMenuItem,
    event: MouseEvent | KeyboardEvent,
  ): boolean {
    if (!this.router || this._options.preventItemClick === false) return false;
    if (item.target && item.target !== '_self') return false;
    if (event instanceof MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return false;
      }
    }

    const link = item.link?.trim() || '';
    return !this.isNativeOnlyLink(link);
  }

  private isNativeOnlyLink(link: string): boolean {
    return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(link);
  }

  private itemKey(item: MultiLevelPushMenuItem, index: number): string {
    return `${item.id || item.name || item.title || 'item'}-${index}`;
  }

  private toCssLength(
    value: string | number | undefined,
    fallback: string,
  ): string {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? `${Math.max(value, 0)}px` : fallback;
    }
    return value?.trim() || fallback;
  }

  private repeatedCssLength(
    value: string,
    count: number,
    negative = false,
  ): string {
    const repetitions = Math.max(Math.trunc(count), 0);
    if (repetitions === 0) return '0px';

    const operator = negative ? ' - ' : ' + ';
    return `calc(0px${operator}${Array.from(
      { length: repetitions },
      () => value,
    ).join(operator)})`;
  }

  private get renderedLevelIndex(): number {
    return this.exitingLevelKey() === null
      ? this.activeLevelIndex
      : Math.max(this.levels().length - 1, this.activeLevelIndex);
  }

  private completePendingLevelExit(): void {
    const key = this.exitingLevelKeyState();
    if (key !== null) this.completeLevelExit(key);
  }

  private completeLevelExit(key: string): void {
    if (this.exitingLevelKeyState() !== key) return;

    const targetDepth = this.exitTargetDepth ?? this.activeLevelIndex;
    this.cancelLevelExitTimer();
    this.levelsState.update((levels) => levels.slice(0, targetDepth + 1));
    this.activeLevelIndexState.set(targetDepth);
    this.exitingLevelKeyState.set(null);
    this.exitTargetDepth = null;
    const focusSelector = this.exitFocusSelector;
    this.exitFocusSelector = null;
    if (focusSelector) this.scheduleFocus(focusSelector);
  }

  private scheduleLevelExitFallback(key: string): void {
    this.cancelLevelExitTimer();
    const window = this.document.defaultView;
    if (!window) {
      this.completeLevelExit(key);
      return;
    }

    this.levelExitTimer = window.setTimeout(
      () => this.completeLevelExit(key),
      this.animationDurationMilliseconds() + 80,
    );
  }

  private animationDurationMilliseconds(): number {
    const value = this._options.animationDuration;
    if (typeof value === 'number') return Math.max(value, 0);

    const normalized = value?.trim().toLowerCase() || '500ms';
    const match = normalized.match(/^([\d.]+)(ms|s)$/);
    if (!match) return 500;
    const amount = Number.parseFloat(match[1]);
    if (!Number.isFinite(amount)) return 500;
    return Math.max(amount * (match[2] === 's' ? 1000 : 1), 0);
  }

  private cancelLevelExitTimer(): void {
    const window = this.document.defaultView;
    if (this.levelExitTimer !== null && window) {
      window.clearTimeout(this.levelExitTimer);
    }
    this.levelExitTimer = null;
  }

  private normalizedMaxDepth(): number {
    const value = Number(this._options.maxDepth);
    return Number.isFinite(value) ? Math.max(Math.trunc(value), 1) : 50;
  }

  private announce(message: string): void {
    this.announcementState.set('');
    this.announcementState.set(message);
  }

  private scheduleFocus(selector: string, activeLevelOnly = true): void {
    if (!this.isBrowser) return;
    this.cancelPendingFocus();
    const window = this.document.defaultView;
    if (!window || typeof window.requestAnimationFrame !== 'function') return;

    this.focusFrame = window.requestAnimationFrame(() => {
      this.focusFrame = null;
      const activeLevel = this.host.nativeElement.querySelector<HTMLElement>(
        '.ngx-push-menu__level[data-active="true"]',
      );
      const target = activeLevelOnly
        ? activeLevel?.querySelector<HTMLElement>(selector)
        : this.host.nativeElement.querySelector<HTMLElement>(selector);
      const fallback = activeLevel?.querySelector<HTMLElement>(
        '[data-menu-back], [data-menu-toggle]',
      );
      (target ?? fallback)?.focus();
    });
  }

  private scheduleActiveLevelFocus(): void {
    if (this.isCollapsed()) {
      if (this._options.fullCollapse) this.scheduleContentFocus();
      else this.scheduleFocus('[data-menu-toggle]');
      return;
    }

    this.scheduleFocus(
      '[data-menu-item-control]:not([disabled]):not([aria-disabled="true"]):not([tabindex="-1"])',
    );
  }

  private scheduleContentFocus(): void {
    if (!this.isBrowser) return;
    this.cancelPendingFocus();
    const window = this.document.defaultView;
    if (!window || typeof window.requestAnimationFrame !== 'function') return;

    this.focusFrame = window.requestAnimationFrame(() => {
      this.focusFrame = null;
      this.host.nativeElement
        .querySelector<HTMLElement>('[data-menu-content]')
        ?.focus();
    });
  }

  private focusIsInsideNavigation(): boolean {
    if (!this.isBrowser) return false;
    const navigation =
      this.host.nativeElement.querySelector<HTMLElement>('nav');
    return Boolean(
      navigation &&
      this.document.activeElement &&
      navigation.contains(this.document.activeElement),
    );
  }

  private cancelPendingFocus(): void {
    const window = this.document.defaultView;
    if (
      this.focusFrame !== null &&
      window &&
      typeof window.cancelAnimationFrame === 'function'
    ) {
      window.cancelAnimationFrame(this.focusFrame);
    }
    this.focusFrame = null;
  }
}
