import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { MultiLevelPushMenuItem } from '../multi-level-push-menu.model';

/**
 * Event emitted when a menu item is clicked
 */
export interface MenuItemClickEvent {
  item: MultiLevelPushMenuItem;
  event: MouseEvent;
  isSubmenu: boolean;
}

/**
 * Event emitted when keyboard navigation is needed
 */
export interface KeyNavigationEvent {
  direction: 'up' | 'down' | 'left' | 'right';
  sourceElement: HTMLElement;
}

/**
 * Directive to handle menu item interactions
 * This provides:
 * - Click handling for menu items
 * - Keyboard navigation (arrow keys, Enter and Space)
 * - Hover effects
 * - Accessibility attributes
 */
@Directive({
  selector: '[ramiz4MenuItem]',
  exportAs: 'menuItem',
  host: {
    '[attr.tabindex]': '0',
    '[attr.role]':
      "isSubmenu ? 'menuitem' : (isBackItem ? 'menuitem' : 'menuitem')",
    '[attr.aria-label]': 'getAriaLabel()',
    '[attr.aria-haspopup]': 'isSubmenu ? "true" : null',
    '[attr.aria-expanded]': 'isSubmenu ? (expanded ? "true" : "false") : null',
    '(click)': 'onClick($event)',
    '(keydown.enter)': 'onKeyDown($event)',
    '(keydown.space)': 'onKeyDown($event)',
  },
})
export class MenuItemDirective implements OnInit, OnChanges {
  // Inputs
  @Input() menuItem!: MultiLevelPushMenuItem;
  @Input() isSubmenu = false;
  @Input() isBackItem = false;
  @Input() expanded = false;
  @Input() level = 0;

  // Outputs
  @Output() itemClick = new EventEmitter<MenuItemClickEvent>();
  @Output() keyNavigation = new EventEmitter<KeyNavigationEvent>();

  private readonly hoverClass = 'menu-item-hover';
  private readonly focusClass = 'menu-item-focus';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Set ARIA attributes for accessibility
    this.setupAccessibility();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-setup accessibility attributes when inputs change
    if (
      changes['isSubmenu'] ||
      changes['isBackItem'] ||
      changes['menuItem'] ||
      changes['expanded']
    ) {
      this.setupAccessibility();
    }
  }

  /**
   * Get aria-label for the menu item
   */
  getAriaLabel(): string {
    if (this.isBackItem) {
      return 'Go back to previous menu';
    }

    return this.menuItem?.title || '';
  }

  /**
   * Handle mouse click event
   */
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.itemClick.emit({
      item: this.menuItem,
      event,
      isSubmenu: this.isSubmenu,
    });

    // Update aria-expanded state for screen readers if it's a submenu
    if (this.isSubmenu) {
      this.renderer.setAttribute(
        this.el.nativeElement,
        'aria-expanded',
        (!this.expanded).toString()
      );
    }
  }

  /**
   * Handle keyboard events for accessibility
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Handle Enter and Space keys for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();

      this.itemClick.emit({
        item: this.menuItem,
        event: new MouseEvent('click'),
        isSubmenu: this.isSubmenu,
      });

      // Update aria-expanded for screen readers
      if (this.isSubmenu) {
        this.expanded = !this.expanded;
        this.renderer.setAttribute(
          this.el.nativeElement,
          'aria-expanded',
          this.expanded.toString()
        );
      }
    }

    // Handle arrow key navigation
    this.handleArrowKeyNavigation(event);
  }

  /**
   * Handle arrow key navigation
   */
  private handleArrowKeyNavigation(event: KeyboardEvent): void {
    // Map arrow keys to navigation directions
    const navigationMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };

    const direction = navigationMap[event.key];
    if (direction) {
      event.preventDefault();
      event.stopPropagation();

      this.keyNavigation.emit({
        direction,
        sourceElement: this.el.nativeElement,
      });
    }
  }

  /**
   * Handle mouse enter event
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.renderer.addClass(this.el.nativeElement, this.hoverClass);
  }

  /**
   * Handle mouse leave event
   */
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.removeClass(this.el.nativeElement, this.hoverClass);
  }

  /**
   * Handle focus event
   */
  @HostListener('focus')
  onFocus(): void {
    this.renderer.addClass(this.el.nativeElement, this.focusClass);

    // Announce to screen readers
    this.announceForScreenReaders();
  }

  /**
   * Handle blur event
   */
  @HostListener('blur')
  onBlur(): void {
    this.renderer.removeClass(this.el.nativeElement, this.focusClass);
  }

  /**
   * Announce current menu item to screen readers using aria-live
   */
  private announceForScreenReaders(): void {
    // Announce the menu item for screen readers
    const liveRegion = document.getElementById('menu-live-region');
    if (liveRegion) {
      const announcement = this.isSubmenu
        ? `${this.menuItem?.title}, submenu. Press Enter to ${
            this.expanded ? 'close' : 'open'
          }.`
        : this.isBackItem
        ? 'Back to previous menu. Press Enter to go back.'
        : `${this.menuItem?.title}. Press Enter to select.`;

      liveRegion.textContent = announcement;
    }
  }

  /**
   * Setup accessibility attributes
   */
  private setupAccessibility(): void {
    const element = this.el.nativeElement;

    // Make menu item focusable
    this.renderer.setAttribute(element, 'tabindex', '0');

    // Set role for screen readers
    this.renderer.setAttribute(element, 'role', 'menuitem');

    // Set aria-expanded for submenu items
    if (this.isSubmenu) {
      this.renderer.setAttribute(element, 'aria-haspopup', 'true');
      this.renderer.setAttribute(
        element,
        'aria-expanded',
        this.expanded.toString()
      );
    }

    // Set aria-label based on item type
    if (this.isBackItem) {
      this.renderer.setAttribute(
        element,
        'aria-label',
        'Go back to previous menu'
      );
    } else if (this.menuItem?.title) {
      this.renderer.setAttribute(element, 'aria-label', this.menuItem.title);
    }
  }
}
