import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuItemClickEvent } from '../interfaces';
import { MultiLevelPushMenuItem } from '../models';
import { MenuItemDirective } from './menu-item.directive';

@Component({
  standalone: true,
  imports: [MenuItemDirective],
  template: `
    <a
      ramiz4MenuItem
      [menuItem]="item"
      [isSubmenu]="isSubmenu"
      (itemClick)="events.push($event)"
      (keyNavigation)="directions.push($event.direction)"
      >Item</a
    >
  `,
})
class HostComponent {
  item: MultiLevelPushMenuItem = { name: 'Readable name' };
  isSubmenu = false;
  events: MenuItemClickEvent[] = [];
  directions: string[] = [];
}

describe('MenuItemDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let anchor: HTMLAnchorElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    anchor = fixture.nativeElement.querySelector('a');
  });

  it('emits exactly once per click and uses the visible name as label', () => {
    anchor.click();
    expect(fixture.componentInstance.events).toHaveLength(1);
    expect(anchor.getAttribute('aria-label')).toBe('Readable name');
  });

  it('emits arrow navigation and activates anchors once on Space', () => {
    anchor.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    anchor.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    );

    expect(fixture.componentInstance.directions).toEqual(['down']);
    expect(fixture.componentInstance.events).toHaveLength(1);
  });

  it('exposes submenu state through ARIA', () => {
    fixture.componentInstance.isSubmenu = true;
    fixture.detectChanges();
    expect(anchor.getAttribute('aria-haspopup')).toBe('menu');
    expect(anchor.getAttribute('aria-expanded')).toBe('false');
  });

  it('activates a non-link anchor on Enter', () => {
    anchor.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(fixture.componentInstance.events).toHaveLength(1);
  });

  it('prevents disabled items from receiving focus or activation', () => {
    fixture.componentInstance.item = { name: 'Disabled', disabled: true };
    fixture.detectChanges();

    anchor.click();
    anchor.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    const tab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    anchor.dispatchEvent(tab);

    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.tabIndex).toBe(-1);
    expect(fixture.componentInstance.events).toHaveLength(0);
    expect(tab.defaultPrevented).toBe(false);
  });
});
