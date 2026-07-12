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

  it('renders the persistent menu shell and routed-content outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[data-testid="demo-menu"]')).not.toBeNull();
    expect(element.querySelector('router-outlet')).not.toBeNull();
    expect(
      element.querySelector('[aria-label="Open Products menu"]'),
    ).not.toBeNull();
  });

  it('provides real routes for every documentation menu item', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const resources = component.menuItems.find(
      (item) => item.id === 'resources',
    );
    const about = component.menuItems.find((item) => item.id === 'about');

    expect(resources?.items?.map((item) => item.link)).toEqual([
      '/guides',
      '/release-notes',
    ]);
    expect(about?.link).toBe('/about');
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

  it('expands the controlled menu through its collapsed handle', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLElement>('[data-menu-backdrop]')?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.collapsed).toBe(true);

    const collapsedHandle = element.querySelector<HTMLElement>(
      '.ngx-push-menu__level[data-active="true"] [data-menu-toggle]',
    );
    expect(collapsedHandle).not.toBeNull();

    collapsedHandle?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapsed).toBe(false);
    expect(collapsedHandle?.getAttribute('aria-expanded')).toBe('true');
  });

  it('does not replace activation details while syncing an automatic close', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const products = component.menuItems[1];
    const analytics = products.items?.[0];
    const liveDashboard = analytics?.items?.[0];

    if (!analytics || !liveDashboard) {
      throw new Error('Expected the analytics path and live dashboard item');
    }

    component.onItemActivate({
      item: liveDashboard,
      level: 2,
      path: [products, analytics, liveDashboard],
      originalEvent: new MouseEvent('click'),
    });
    component.syncCollapsed(true);

    expect(component.collapsed).toBe(true);
    expect(component.lastEvent.kind).toBe('item');
    expect(component.lastEvent.path).toBe(
      'Products / Analytics / Live dashboard',
    );
  });

  it('switches between complete quick-start snippets', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    component.selectSnippet('template');
    fixture.detectChanges();

    expect(component.activeSnippet().id).toBe('template');
    expect(component.activeSnippet().code).toContain(
      '<ngx-multi-level-push-menu',
    );
  });

  it('resets all live configuration through one public-options update', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    component.setMode('overlap');
    component.toggleDirection();
    component.toggleTheme();
    component.toggleCloseOnNavigation();

    component.resetPlayground();

    expect(component.options.mode).toBe('cover');
    expect(component.options.direction).toBe('ltr');
    expect(component.options.closeOnNavigation).toBe(true);
    expect(component.theme).toBe('aurora');
    expect(component.collapsed).toBe(false);
    expect(component.lastEvent.label).toBe('Playground reset');
  });
});
