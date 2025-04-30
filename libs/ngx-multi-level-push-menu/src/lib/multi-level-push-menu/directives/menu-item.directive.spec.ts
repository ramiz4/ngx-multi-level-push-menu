import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MultiLevelPushMenuItem } from '../multi-level-push-menu.model';
import { MenuItemClickEvent, MenuItemDirective } from './menu-item.directive';

@Component({
    template: `
    <div
      ramiz4MenuItem
      [menuItem]="menuItem"
      [isSubmenu]="isSubmenu"
      [isBackItem]="isBackItem"
      (itemClick)="onClick($event)"
    ></div>
  `,
})
class TestComponent {
    menuItem: MultiLevelPushMenuItem = {
        id: '1',
        title: 'Test Item',
        link: '#',
    };
    isSubmenu = false;
    isBackItem = false;
    lastClickEvent: MenuItemClickEvent | undefined;

    onClick(event: MenuItemClickEvent): void {
        this.lastClickEvent = event;
    }
}

describe('MenuItemDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directiveElement: DebugElement;
    let directiveInstance: MenuItemDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TestComponent, MenuItemDirective],
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        directiveElement = fixture.debugElement.query(
            By.directive(MenuItemDirective)
        );
        directiveInstance = directiveElement.injector.get(MenuItemDirective);
        fixture.detectChanges();
    });

    it('should create the directive', () => {
        expect(directiveInstance).toBeTruthy();
    });

    it('should set up accessibility attributes correctly', () => {
        // Check tabindex
        expect(directiveElement.nativeElement.getAttribute('tabindex')).toBe('0');

        // Check role
        expect(directiveElement.nativeElement.getAttribute('role')).toBe(
            'menuitem'
        );

        // Check aria-label for normal item
        expect(directiveElement.nativeElement.getAttribute('aria-label')).toBe(
            'Test Item'
        );
    });

    it('should set submenu accessibility attributes', () => {
        component.isSubmenu = true;
        fixture.detectChanges();

        expect(directiveElement.nativeElement.getAttribute('aria-haspopup')).toBe(
            'true'
        );
        expect(directiveElement.nativeElement.getAttribute('aria-expanded')).toBe(
            'false'
        );
    });

    it('should set back item accessibility attributes', () => {
        component.isBackItem = true;
        fixture.detectChanges();

        expect(directiveElement.nativeElement.getAttribute('aria-label')).toBe(
            'Go back to previous menu'
        );
    });

    it('should emit click event when clicked', () => {
        directiveElement.nativeElement.click();
        expect(component.lastClickEvent).toBeDefined();
        expect(component.lastClickEvent?.item).toBe(component.menuItem);
        expect(component.lastClickEvent?.isSubmenu).toBe(false);
    });

    it('should emit click event on Enter key press', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        directiveElement.nativeElement.dispatchEvent(event);
        expect(component.lastClickEvent).toBeDefined();
        expect(component.lastClickEvent?.item).toBe(component.menuItem);
    });

    it('should emit click event on Space key press', () => {
        const event = new KeyboardEvent('keydown', { key: ' ' });
        directiveElement.nativeElement.dispatchEvent(event);
        expect(component.lastClickEvent).toBeDefined();
        expect(component.lastClickEvent?.item).toBe(component.menuItem);
    });

    it('should add hover class on mouseenter', () => {
        const mouseenterEvent = new MouseEvent('mouseenter');
        directiveElement.nativeElement.dispatchEvent(mouseenterEvent);

        expect(
            directiveElement.nativeElement.classList.contains('menu-item-hover')
        ).toBe(true);
    });

    it('should remove hover class on mouseleave', () => {
        // First add the class
        const mouseenterEvent = new MouseEvent('mouseenter');
        directiveElement.nativeElement.dispatchEvent(mouseenterEvent);

        // Then remove it
        const mouseleaveEvent = new MouseEvent('mouseleave');
        directiveElement.nativeElement.dispatchEvent(mouseleaveEvent);

        expect(
            directiveElement.nativeElement.classList.contains('menu-item-hover')
        ).toBe(false);
    });

    it('should add focus class on focus', () => {
        const focusEvent = new FocusEvent('focus');
        directiveElement.nativeElement.dispatchEvent(focusEvent);

        expect(
            directiveElement.nativeElement.classList.contains('menu-item-focus')
        ).toBe(true);
    });

    it('should remove focus class on blur', () => {
        // First add the class
        const focusEvent = new FocusEvent('focus');
        directiveElement.nativeElement.dispatchEvent(focusEvent);

        // Then remove it
        const blurEvent = new FocusEvent('blur');
        directiveElement.nativeElement.dispatchEvent(blurEvent);

        expect(
            directiveElement.nativeElement.classList.contains('menu-item-focus')
        ).toBe(false);
    });
});
