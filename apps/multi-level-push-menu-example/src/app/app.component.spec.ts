import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the provider-free standalone playground', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain(
      'Deep navigation',
    );
    expect(element.querySelector('[data-testid="demo-menu"]')).not.toBeNull();
    expect(
      element.querySelector('[aria-label="Open Products menu"]'),
    ).not.toBeNull();
  });

  it('updates display options immutably from the playground controls', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const initialOptions = component.options;

    component.setMode('overlap');
    component.toggleDirection();
    component.toggleTheme();
    fixture.detectChanges();

    const menu = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="demo-menu"]',
    );
    expect(component.options).not.toBe(initialOptions);
    expect(menu?.getAttribute('data-mode')).toBe('overlap');
    expect(menu?.getAttribute('data-direction')).toBe('rtl');
    expect(menu?.getAttribute('data-theme')).toBe('midnight');
  });

  it('records typed item metadata and the complete activation path', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const products = component.menuItems[1];
    const analytics = products.items?.[0];

    if (!analytics) throw new Error('Expected the typed analytics demo item');

    component.onGroupActivate({
      item: analytics,
      level: 1,
      path: [products, analytics],
      originalEvent: new MouseEvent('click'),
    });

    expect(component.lastEvent).toEqual({
      kind: 'group',
      label: 'Analytics: Open analytics destinations',
      path: 'Products / Analytics',
      depth: 1,
    });
  });

  it('keeps controlled collapsed state in sync', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    component.setCollapsed(true);
    fixture.detectChanges();

    const menu = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="demo-menu"]',
    );
    expect(component.collapsed).toBe(true);
    expect(menu?.getAttribute('data-collapsed')).toBe('true');
    expect(component.lastEvent.label).toBe('Menu collapsed');
  });
});
