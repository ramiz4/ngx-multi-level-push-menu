import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core';
import { KeyNavigationEvent, MenuItemClickEvent } from '../interfaces';
import { MultiLevelPushMenuItem } from '../models';

/**
 * Optional behavior directive for custom menu item templates.
 *
 * The main component already provides keyboard and pointer behavior. This
 * directive remains public for consumers that build custom item templates.
 */
@Directive({
  selector: '[ramiz4MenuItem]',
  exportAs: 'menuItem',
  standalone: true,
})
export class MenuItemDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input({ required: true }) menuItem!: MultiLevelPushMenuItem;
  @Input() isSubmenu = false;
  @Input() isBackItem = false;
  @Input() expanded = false;
  /** @deprecated Retained for source compatibility; level is owned by the menu. */
  @Input() level = 0;

  @Output() readonly itemClick = new EventEmitter<MenuItemClickEvent>();
  @Output() readonly keyNavigation = new EventEmitter<KeyNavigationEvent>();

  @HostBinding('attr.role') readonly role = 'menuitem';

  @HostBinding('attr.tabindex')
  get tabindex(): number {
    return this.menuItem?.disabled ? -1 : 0;
  }

  @HostBinding('attr.aria-disabled')
  get ariaDisabled(): 'true' | null {
    return this.menuItem?.disabled ? 'true' : null;
  }

  @HostBinding('attr.aria-label')
  get ariaLabel(): string {
    if (this.isBackItem) return 'Go back to previous menu';
    return (
      this.menuItem?.ariaLabel ||
      this.menuItem?.name ||
      this.menuItem?.title ||
      ''
    );
  }

  @HostBinding('attr.aria-haspopup')
  get ariaHasPopup(): 'menu' | null {
    return this.isSubmenu ? 'menu' : null;
  }

  @HostBinding('attr.aria-expanded')
  get ariaExpanded(): string | null {
    return this.isSubmenu ? String(this.expanded) : null;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.menuItem?.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (this.isSubmenu || this.isBackItem) {
      event.preventDefault();
    }

    this.itemClick.emit({
      item: this.menuItem,
      event,
      isSubmenu: this.isSubmenu,
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.menuItem?.disabled) {
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key.startsWith('Arrow')
      ) {
        event.preventDefault();
      }
      return;
    }

    const navigationMap: Record<
      string,
      KeyNavigationEvent['direction'] | undefined
    > = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };
    const direction = navigationMap[event.key];

    if (direction) {
      event.preventDefault();
      this.keyNavigation.emit({
        direction,
        sourceElement: this.elementRef.nativeElement,
      });
      return;
    }

    const element = this.elementRef.nativeElement;
    const tagName = element.tagName.toLowerCase();
    const hasNativeEnterActivation =
      tagName === 'button' || (tagName === 'a' && element.hasAttribute('href'));
    const needsSyntheticActivation =
      (event.key === 'Enter' && !hasNativeEnterActivation) ||
      (event.key === ' ' && tagName !== 'button');

    if (needsSyntheticActivation) {
      event.preventDefault();
      element.click();
    }
  }
}
