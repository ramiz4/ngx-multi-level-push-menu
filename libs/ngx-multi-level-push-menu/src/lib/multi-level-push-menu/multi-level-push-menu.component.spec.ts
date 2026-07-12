import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiLevelPushMenuItem, MultiLevelPushMenuOptions } from './models';
import { MultiLevelPushMenuComponent } from './multi-level-push-menu.component';
import { MultiLevelPushMenuService } from './multi-level-push-menu.service';

@Component({
  selector: 'ngx-test-legacy-selector-host',
  standalone: true,
  imports: [MultiLevelPushMenuComponent],
  template: `<ramiz4-multi-level-push-menu [menu]="menu" />`,
})
class LegacySelectorHostComponent {
  readonly menu: readonly MultiLevelPushMenuItem[] = [{ name: 'Legacy item' }];
}

describe('MultiLevelPushMenuComponent', () => {
  let fixture: ComponentFixture<MultiLevelPushMenuComponent>;
  let component: MultiLevelPushMenuComponent;
  let element: HTMLElement;

  const menu: MultiLevelPushMenuItem[] = [
    {
      id: 'alpha',
      name: 'Alpha',
      items: [{ name: 'Alpha child' }],
    },
    {
      id: 'beta',
      name: 'Beta',
      items: [{ name: 'Beta child' }],
    },
    { title: 'Constructor-compatible title' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiLevelPushMenuComponent, LegacySelectorHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiLevelPushMenuComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    component.options = new MultiLevelPushMenuOptions({
      title: 'Test menu',
      menu,
    });
    fixture.detectChanges();
  });

  it('is standalone and needs no explicit provider setup', () => {
    expect(component).toBeTruthy();
    expect(element.querySelector('nav')).not.toBeNull();
    expect(new MultiLevelPushMenuOptions().closeOnNavigation).toBe(true);
  });

  it('keeps the historical ramiz4 selector as a compatibility alias', () => {
    const legacyFixture = TestBed.createComponent(LegacySelectorHostComponent);
    legacyFixture.detectChanges();

    expect(
      legacyFixture.nativeElement.querySelector(
        'ramiz4-multi-level-push-menu .ngx-push-menu',
      ),
    ).not.toBeNull();
  });

  it('renders plain objects and falls back from name to title', () => {
    expect(element.textContent).toContain('Alpha');
    expect(element.textContent).toContain('Constructor-compatible title');
  });

  it('applies the initial collapsed state immediately', () => {
    component.options = new MultiLevelPushMenuOptions({
      menu,
      collapsed: true,
      fullCollapse: true,
    });
    fixture.detectChanges();

    const wrapper = element.querySelector('.ngx-push-menu');
    const navigation = element.querySelector('nav');
    expect(wrapper?.classList).toContain('ngx-push-menu--collapsed');
    expect(navigation?.getAttribute('aria-hidden')).toBe('true');
    expect(navigation?.hasAttribute('inert')).toBe(true);
    expect(
      element.querySelector<HTMLElement>('.ngx-push-menu__item-control')
        ?.tabIndex,
    ).toBe(-1);
  });

  it('keeps only the visible toggle reachable when partially collapsed', () => {
    component.collapseMenu();
    fixture.detectChanges();

    expect(
      element.querySelector<HTMLElement>('.ngx-push-menu__toggle')?.tabIndex,
    ).toBe(-1);
    expect(
      element.querySelector<HTMLElement>('[data-menu-collapsed-toggle]')
        ?.tabIndex,
    ).toBe(0);
    expect(
      Array.from(
        element.querySelectorAll<HTMLElement>(
          '.ngx-push-menu__item-control, .ngx-push-menu__back',
        ),
      ).every((control) => control.tabIndex === -1),
    ).toBe(true);
    expect(
      element.querySelector('.ngx-push-menu__items')?.hasAttribute('inert'),
    ).toBe(true);
    expect(element.querySelector('nav')?.hasAttribute('inert')).toBe(true);
  });

  it('closes from the backdrop outside the navigation', () => {
    const backdrop = element.querySelector<HTMLElement>('[data-menu-backdrop]');
    expect(backdrop).not.toBeNull();

    backdrop?.click();
    fixture.detectChanges();

    expect(component.collapsed).toBe(true);
    expect(element.querySelector('[data-menu-backdrop]')).toBeNull();
  });

  it('keeps sibling branches isolated after repeated back navigation', () => {
    clickControl('Alpha');
    expect(activeLevelTitle()).toBe('Alpha');
    clickBack();

    clickControl('Beta');
    expect(activeLevelTitle()).toBe('Beta');
    expect(activeLevelText()).toContain('Beta child');
    expect(activeLevelText()).not.toContain('Alpha child');
    clickBack();

    clickControl('Alpha');
    expect(activeLevelTitle()).toBe('Alpha');
    expect(activeLevelText()).toContain('Alpha child');
    expect(activeLevelText()).not.toContain('Beta child');
  });

  it('keeps covered ancestors stationary while descendants exit toward the drawer edge', () => {
    clickControl('Alpha');

    const rootLevel = element.querySelector<HTMLElement>(
      '.ngx-push-menu__level[data-level-index="0"]',
    );
    const activeLevel = element.querySelector<HTMLElement>(
      '.ngx-push-menu__level[data-level-index="1"]',
    );
    expect(
      rootLevel?.style.getPropertyValue('--ngx-push-menu-cover-offset'),
    ).toBe('0%');
    expect(
      activeLevel?.style.getPropertyValue('--ngx-push-menu-cover-offset'),
    ).toBe('0%');

    component.options = new MultiLevelPushMenuOptions({
      menu,
      direction: 'rtl',
    });
    fixture.detectChanges();
    expect(
      rootLevel?.style.getPropertyValue('--ngx-push-menu-cover-offset'),
    ).toBe('0%');
  });

  it('renders accessible overlap rails from the parent outward', () => {
    const deepMenu: MultiLevelPushMenuItem[] = [
      {
        id: 'products',
        name: 'Products',
        items: [
          {
            id: 'analytics',
            name: 'Analytics',
            items: [{ name: 'Live dashboard' }],
          },
        ],
      },
    ];
    component.options = new MultiLevelPushMenuOptions({
      title: 'Nexus',
      menu: deepMenu,
      mode: 'overlap',
      menuWidth: '18rem',
      overlapWidth: '3rem',
    });
    fixture.detectChanges();
    clickControl('Products');
    clickControl('Analytics');

    const wrapper = element.querySelector<HTMLElement>('.ngx-push-menu');
    expect(
      wrapper?.style.getPropertyValue('--ngx-push-menu-active-overlap-offset'),
    ).toBe('calc(0px + 3rem + 3rem)');
    expect(activeLevelTitle()).toBe('Analytics');
    const enteringLevel = element.querySelector<HTMLElement>(
      '.ngx-push-menu__level[data-active="true"]',
    );
    expect(enteringLevel?.getAttribute('data-entering')).toBe('true');
    expect(wrapper?.classList).toContain('ngx-push-menu--entering');
    enteringLevel?.dispatchEvent(new Event('animationend', { bubbles: true }));
    fixture.detectChanges();
    expect(enteringLevel?.hasAttribute('data-entering')).toBe(false);
    expect(wrapper?.classList).not.toContain('ngx-push-menu--entering');

    let rails = Array.from(
      element.querySelectorAll<HTMLButtonElement>('[data-menu-rail]'),
    );
    expect(rails.map((rail) => rail.dataset['targetLevel'])).toEqual([
      '1',
      '0',
    ]);
    expect(rails.map((rail) => rail.getAttribute('aria-label'))).toEqual([
      'Back to Products',
      'Back to Nexus',
    ]);
    expect(rails.every((rail) => rail.hasAttribute('data-menu-no-swipe'))).toBe(
      true,
    );

    const levelChangeSpy = jest.spyOn(component.levelChange, 'emit');
    rails[0]?.click();
    fixture.detectChanges();
    expect(activeLevelTitle()).toBe('Products');
    expect(levelChangeSpy).toHaveBeenLastCalledWith(1);
    expect(levelChangeSpy).toHaveBeenCalledTimes(1);

    clickControl('Analytics');
    rails = Array.from(
      element.querySelectorAll<HTMLButtonElement>('[data-menu-rail]'),
    );
    rails[1]?.click();
    fixture.detectChanges();
    expect(activeLevelTitle()).toBe('Nexus');
    const exitingLevel = element.querySelector<HTMLElement>(
      '.ngx-push-menu__level[data-exiting="true"]',
    );
    expect(exitingLevel?.getAttribute('aria-label')).toBe('Analytics');
    expect(exitingLevel?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelectorAll('[data-menu-rail]')).toHaveLength(2);

    exitingLevel?.dispatchEvent(new Event('animationend', { bubbles: true }));
    fixture.detectChanges();
    expect(element.querySelectorAll('[data-menu-rail]')).toHaveLength(0);
    expect(element.querySelector('[data-exiting="true"]')).toBeNull();
    expect(levelChangeSpy).toHaveBeenLastCalledWith(0);
  });

  it('uses and focuses the dedicated collapsed toggle at every depth', async () => {
    const deepMenu: MultiLevelPushMenuItem[] = [
      {
        name: 'Products',
        items: [
          {
            name: 'Analytics',
            items: [{ name: 'Live dashboard' }],
          },
        ],
      },
    ];
    component.options = new MultiLevelPushMenuOptions({
      title: 'Nexus',
      menu: deepMenu,
      mode: 'overlap',
      preserveActiveLevelOnCollapse: true,
    });
    fixture.detectChanges();
    clickControl('Products');
    clickControl('Analytics');
    const activeToggle = element.querySelector<HTMLButtonElement>(
      '.ngx-push-menu__level[data-active="true"] [data-menu-toggle]',
    );
    activeToggle?.focus();
    component.collapseMenu();
    fixture.detectChanges();

    const rails = Array.from(
      element.querySelectorAll<HTMLButtonElement>('[data-menu-rail]'),
    );
    expect(rails.map((rail) => rail.tabIndex)).toEqual([-1, -1]);
    expect(rails[0]?.hasAttribute('inert')).toBe(true);
    expect(rails[1]?.hasAttribute('inert')).toBe(true);
    expect(
      element
        .querySelector<HTMLElement>('.ngx-push-menu__level[data-active="true"]')
        ?.hasAttribute('inert'),
    ).toBe(true);
    expect(
      element.querySelector<HTMLButtonElement>(
        '.ngx-push-menu__level[data-active="true"] [data-menu-toggle]',
      )?.tabIndex,
    ).toBe(-1);
    const collapsedToggle = element.querySelector<HTMLButtonElement>(
      '[data-menu-collapsed-toggle]',
    );
    expect(collapsedToggle?.getAttribute('aria-label')).toBe(
      'Expand Main navigation',
    );
    expect(collapsedToggle?.tabIndex).toBe(0);
    expect(collapsedToggle?.closest('nav')).toBeNull();
    expect(collapsedToggle?.style.left).toBe('0px');
    await nextAnimationFrame();
    expect(element.ownerDocument.activeElement).toBe(collapsedToggle);

    collapsedToggle?.click();
    fixture.detectChanges();
    expect(component.collapsed).toBe(false);
    expect(activeLevelTitle()).toBe('Analytics');
  });

  it('removes old levels when menu data becomes empty', () => {
    clickControl('Alpha');
    expect(component.activeLevelIndex).toBe(1);

    component.menu = [];
    fixture.detectChanges();

    expect(component.activeLevelIndex).toBe(0);
    expect(element.querySelectorAll('.ngx-push-menu__level')).toHaveLength(1);
    expect(activeLevelText()).toContain('No menu items');
    expect(activeLevelText()).not.toContain('Alpha child');
  });

  it('emits typed leaf and group events once', () => {
    const groupSpy = jest.spyOn(component.groupActivate, 'emit');
    const itemSpy = jest.spyOn(component.itemActivate, 'emit');

    clickControl('Alpha');
    clickControl('Alpha child');

    expect(groupSpy).toHaveBeenCalledTimes(1);
    expect(groupSpy.mock.calls[0]?.[0]?.path.map((item) => item.name)).toEqual([
      'Alpha',
    ]);
    expect(itemSpy).toHaveBeenCalledTimes(1);
    expect(itemSpy.mock.calls[0]?.[0]?.path.map((item) => item.name)).toEqual([
      'Alpha',
      'Alpha child',
    ]);
  });

  it('supports documented service commands and target IDs', () => {
    component.options = new MultiLevelPushMenuOptions({
      menu,
      menuID: 'primary-menu',
      title: 'Test menu',
    });
    fixture.detectChanges();
    const service = TestBed.inject(MultiLevelPushMenuService);

    service.closeMenu('another-menu');
    expect(component.collapsed).toBe(false);

    service.closeMenu('primary-menu');
    expect(component.collapsed).toBe(true);

    service.openMenu('primary-menu');
    expect(component.collapsed).toBe(false);

    service.closeMenu('primary-menu');
    service.navigateToLevel(0, 'primary-menu');
    expect(component.collapsed).toBe(false);

    service.navigateToLevel('beta', 'primary-menu');
    fixture.detectChanges();
    expect(activeLevelTitle()).toBe('Beta');
    service.goBack('primary-menu');
    fixture.detectChanges();
    expect(activeLevelTitle()).toBe('Test menu');
  });

  it('uses vertical arrow keys without trapping Tab', () => {
    const controls = Array.from(
      element.querySelectorAll<HTMLElement>('.ngx-push-menu__item-control'),
    );
    controls[0]?.focus();
    controls[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );

    expect(document.activeElement).toBe(controls[1]);

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    controls[1]?.dispatchEvent(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(false);
  });

  it('continues arrow navigation after focus reaches the header toggle', () => {
    const firstItem = element.querySelector<HTMLElement>(
      '.ngx-push-menu__item-control',
    );
    const toggle = element.querySelector<HTMLElement>('.ngx-push-menu__toggle');
    firstItem?.focus();
    firstItem?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    expect(document.activeElement).toBe(toggle);

    toggle?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    expect(document.activeElement).toBe(firstItem);
  });

  it('keeps a separately controlled collapsed input authoritative', () => {
    component.collapsed = true;
    component.options = new MultiLevelPushMenuOptions({
      menu,
      collapsed: false,
      direction: 'rtl',
    });
    fixture.detectChanges();

    expect(component.collapsed).toBe(true);
  });

  it('preserves the active path when only visual options change', () => {
    clickControl('Alpha');

    component.options = new MultiLevelPushMenuOptions({
      menu,
      title: 'Updated title',
      direction: 'rtl',
    });
    fixture.detectChanges();

    expect(activeLevelTitle()).toBe('Alpha');
    expect(element.querySelector('.ngx-push-menu')?.hasAttribute('dir')).toBe(
      false,
    );
    expect(element.querySelector('nav')?.getAttribute('dir')).toBe('rtl');
  });

  it('preserves an internally collapsed state across visual option updates', () => {
    component.collapseMenu();

    component.options = new MultiLevelPushMenuOptions({
      menu,
      direction: 'rtl',
      mode: 'overlap',
    });
    fixture.detectChanges();

    expect(component.collapsed).toBe(true);
  });

  it('renders disabled links as native disabled buttons', () => {
    component.menu = [
      { name: 'Disabled link', link: '/should-not-open', disabled: true },
    ];
    fixture.detectChanges();

    const control = element.querySelector<HTMLElement>(
      '.ngx-push-menu__item-control',
    );
    expect(control?.tagName).toBe('BUTTON');
    expect(control?.hasAttribute('disabled')).toBe(true);
    expect(control?.hasAttribute('href')).toBe(false);
  });

  it('prepares internal anchor hrefs with the application base path', () => {
    const componentWithLocation = component as unknown as {
      location: { prepareExternalUrl: (url: string) => string };
    };
    componentWithLocation.location = {
      prepareExternalUrl: (url) => `/repository${url}`,
    };
    component.menu = [
      { name: 'Internal', link: '/products' },
      { name: 'External', link: 'https://example.com/products' },
      { name: 'Fragment', link: '#details' },
    ];
    fixture.detectChanges();

    const links = Array.from(element.querySelectorAll('a'));
    expect(links[0]?.getAttribute('href')).toBe('/repository/products');
    expect(links[1]?.getAttribute('href')).toBe('https://example.com/products');
    expect(links[2]?.getAttribute('href')).toBe('#details');
  });

  it('resets the level once when a controlled collapse does not preserve it', () => {
    const levelChange = jest.spyOn(component.levelChange, 'emit');
    clickControl('Alpha');
    component.options = new MultiLevelPushMenuOptions({
      menu,
      preserveActiveLevelOnCollapse: false,
    });

    component.collapsed = true;
    fixture.detectChanges();

    expect(component.activeLevelIndex).toBe(0);
    expect(levelChange).toHaveBeenLastCalledWith(0);
  });

  it('only navigates to enabled groups within maxDepth', () => {
    clickControl('Alpha');
    component.navigateToLevel('Constructor-compatible title');
    expect(activeLevelTitle()).toBe('Alpha');

    component.menu = [
      {
        id: 'disabled',
        name: 'Disabled',
        disabled: true,
        items: [{ name: 'Hidden child' }],
      },
      {
        id: 'level-one',
        name: 'Level one',
        items: [
          {
            id: 'level-two',
            name: 'Level two',
            items: [{ name: 'Deep leaf' }],
          },
        ],
      },
    ];
    component.options = new MultiLevelPushMenuOptions({ maxDepth: 1 });
    fixture.detectChanges();

    component.navigateToLevel('disabled');
    component.navigateToLevel('level-two');
    fixture.detectChanges();
    expect(component.activeLevelIndex).toBe(0);

    component.navigateToLevel('level-one');
    fixture.detectChanges();
    expect(activeLevelTitle()).toBe('Level one');
  });

  it('sanitizes markup icons through Angular', () => {
    component.menu = [
      {
        name: 'Unsafe icon',
        icon: '<img src="x" onerror="window.__unsafe = true">',
      },
    ];
    fixture.detectChanges();

    const icon = element.querySelector('.ngx-push-menu__item-icon');
    expect(icon?.innerHTML).not.toContain('onerror');
  });

  function clickControl(label: string): void {
    const control = Array.from(
      element.querySelectorAll<HTMLElement>('.ngx-push-menu__item-control'),
    ).find((candidate) => candidate.textContent?.trim() === label);
    expect(control).toBeDefined();
    control?.click();
    fixture.detectChanges();
  }

  function clickBack(): void {
    const back = element.querySelector<HTMLElement>('.ngx-push-menu__back');
    expect(back).not.toBeNull();
    back?.click();
    fixture.detectChanges();
  }

  function activeLevelTitle(): string {
    return (
      element
        .querySelector(
          '.ngx-push-menu__level[data-active="true"] .ngx-push-menu__title',
        )
        ?.textContent?.trim() ?? ''
    );
  }

  function activeLevelText(): string {
    return (
      element.querySelector('.ngx-push-menu__level[data-active="true"]')
        ?.textContent ?? ''
    );
  }

  function nextAnimationFrame(): Promise<void> {
    return new Promise((resolve) => {
      const window = element.ownerDocument.defaultView;
      if (!window) {
        resolve();
        return;
      }
      window.requestAnimationFrame(() => resolve());
    });
  }
});
