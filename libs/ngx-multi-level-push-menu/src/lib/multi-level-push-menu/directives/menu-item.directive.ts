import { Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2 } from '@angular/core';
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
 * Directive to handle menu item interactions
 * This provides:
 * - Click handling for menu items
 * - Keyboard navigation (Enter and Space to click)
 * - Hover effects
 * - Accessibility attributes
 */
@Directive({
    selector: '[ramiz4MenuItem]'
})
export class MenuItemDirective implements OnInit {
    // Inputs
    @Input() menuItem!: MultiLevelPushMenuItem;
    @Input() isSubmenu = false;
    @Input() isBackItem = false;

    // Outputs
    @Output() itemClick = new EventEmitter<MenuItemClickEvent>();

    private readonly hoverClass = 'menu-item-hover';
    private readonly focusClass = 'menu-item-focus';

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) { }

    ngOnInit(): void {
        // Set ARIA attributes for accessibility
        this.setupAccessibility();
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
            isSubmenu: this.isSubmenu
        });
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
                isSubmenu: this.isSubmenu
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
    }

    /**
     * Handle blur event
     */
    @HostListener('blur')
    onBlur(): void {
        this.renderer.removeClass(this.el.nativeElement, this.focusClass);
    }

    /**
     * Setup accessibility attributes
     */
    private setupAccessibility(): void {
        const element = this.el.nativeElement;

        // Make menu item focusable
        this.renderer.setAttribute(element, 'tabindex', '0');

        // Set role for screen readers
        this.renderer.setAttribute(element, 'role', this.isSubmenu ? 'menuitem' : 'menuitem');

        // Set aria-expanded for submenu items
        if (this.isSubmenu) {
            this.renderer.setAttribute(element, 'aria-haspopup', 'true');
            this.renderer.setAttribute(element, 'aria-expanded', 'false');
        }

        // Set aria-label if there's a title
        if (this.menuItem?.title) {
            this.renderer.setAttribute(element, 'aria-label', this.menuItem.title);
        }

        // Special handling for back items
        if (this.isBackItem) {
            this.renderer.setAttribute(element, 'aria-label', 'Go back to previous menu');
        }
    }
}