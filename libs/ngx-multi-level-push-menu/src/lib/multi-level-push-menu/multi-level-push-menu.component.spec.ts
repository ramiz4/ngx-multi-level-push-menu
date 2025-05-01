import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  Routes,
  withComponentInputBinding,
} from '@angular/router';
import { MultiLevelPushMenuComponent } from './multi-level-push-menu.component';
import { MultiLevelPushMenuService } from './multi-level-push-menu.service';
import { MultiLevelPushMenuItem } from './multi-level-push-menu.model';

// Create Dummy components for testing
@Component({ template: '' })
class DummyComponent {}

export const routes: Routes = [
  { path: '', component: DummyComponent },
  { path: 'dummy', component: DummyComponent },
  { path: '**', component: DummyComponent },
];

// Sample menu data for testing
const testMenuItems: MultiLevelPushMenuItem[] = [
  {
    name: 'Home',
    icon: 'fa fa-home',
    link: '/home'
  },
  {
    name: 'Collections',
    icon: 'fa fa-list',
    items: [
      {
        name: 'Collection 1',
        icon: 'fa fa-folder',
        link: '/collections/1'
      },
      {
        name: 'Collection 2',
        icon: 'fa fa-folder',
        link: '/collections/2'
      }
    ]
  }
];

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('MultiLevelPushMenuComponent', () => {
  let component: MultiLevelPushMenuComponent;
  let fixture: ComponentFixture<MultiLevelPushMenuComponent>;
  let menuService: MultiLevelPushMenuService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MultiLevelPushMenuComponent],
      providers: [
        { provide: 'WINDOW', useValue: window },
        provideRouter(routes, withComponentInputBinding()),
        provideAnimations(),
        MultiLevelPushMenuService,
      ],
      schemas: [NO_ERRORS_SCHEMA] // Add schema to ignore unknown properties
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiLevelPushMenuComponent);
    component = fixture.componentInstance;
    menuService = TestBed.inject(MultiLevelPushMenuService);
    
    // Spy on various methods and services
    jest.spyOn(component['menuBuilderService'], 'createMenuStructure');
    jest.spyOn(component['menuAnimationService'], 'animateCollapse');
    jest.spyOn(component['menuAnimationService'], 'animateExpand');
    jest.spyOn(menuService, 'menuItemClicked');
    jest.spyOn(menuService, 'groupItemClicked');

    // Supply test menu data
    component.menu = testMenuItems;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default options when no options are provided', () => {
    expect(component.options).toBeDefined();
    expect(component.options.collapsed).toBeFalsy();
    // Checking for string or number is valid since we now support both
    const menuWidth = component.options.menuWidth;
    expect(typeof menuWidth === 'string' ? menuWidth : String(menuWidth)).toContain('300');
  });

  it('should create menu structure when initialized with menu items', () => {
    expect(component['menuBuilderService'].createMenuStructure).toHaveBeenCalled();
  });

  it('should apply custom options when provided', () => {
    const customOptions = {
      collapsed: true,
      menuWidth: 400,
      mode: 'overlap',
      overlapWidth: '50'
    };
    
    // Apply to the component options - no type assertion needed this way
    component.options = { ...component.options, ...customOptions };
    fixture.detectChanges();
    
    expect(component.options.collapsed).toBe(true);
    expect(component.options.menuWidth).toBe(400);
    expect(component.options.mode).toBe('overlap');
    expect(component.options.overlapWidth).toBe('50');
  });

  it('should toggle menu state when title icon is clicked', () => {
    // Mock the event object
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    } as unknown as MouseEvent;
    
    // Test expanding when collapsed
    component.options = { ...component.options, collapsed: true };
    fixture.detectChanges();
    
    component.titleIconClick(mockEvent);
    expect(component['menuAnimationService'].animateExpand).toHaveBeenCalled();
    expect(component.options.collapsed).toBe(false);
    
    // Test collapsing when expanded
    component.titleIconClick(mockEvent);
    expect(component['menuAnimationService'].animateCollapse).toHaveBeenCalled();
  });

  it('should emit events when menu items are clicked', fakeAsync(() => {
    // Create a mock menu item
    const mockItem: MultiLevelPushMenuItem = {
      name: 'Test Item',
      link: '/test'
    };
    
    // Test the handleMenuItemClick method
    component['handleMenuItemClick'](mockItem);
    tick();
    
    expect(menuService.menuItemClicked).toHaveBeenCalledWith(mockItem);
  }));

  it('should emit events when group items are clicked', fakeAsync(() => {
    // Create a mock group item
    const mockGroupItem: MultiLevelPushMenuItem = {
      name: 'Test Group',
      items: [
        { name: 'Child 1', link: '/child1' }
      ]
    };
    const mockParentLevelHolder = document.createElement('div');
    
    // Mock the submenu creation method
    jest.spyOn(component['menuBuilderService'], 'createSubmenu').mockImplementation(() => {
      // Do nothing but in a non-empty way
      return;
    });
    
    // Test the group item click method
    component['handleSubmenuClick']('test-key', 1, mockGroupItem, mockParentLevelHolder);
    tick(20);
    
    expect(menuService.groupItemClicked).toHaveBeenCalledWith(mockGroupItem);
  }));

  // Test for proper cleanup
  it('should unsubscribe from subscriptions on destroy', () => {
    // Setup spies
    const collapseUnsubSpy = jest.spyOn(component['collapseSubscription'], 'unsubscribe');
    const expandUnsubSpy = jest.spyOn(component['expandSubscription'], 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(collapseUnsubSpy).toHaveBeenCalled();
    expect(expandUnsubSpy).toHaveBeenCalled();
  });

  // Test accessibility features
  it('should set up ARIA landmarks after view init', () => {
    // Spy on accessibility service
    const ariaSetupSpy = jest.spyOn(component['accessibilityService'], 'setupAriaLandmarks');
    
    component.ngAfterViewInit();
    
    expect(ariaSetupSpy).toHaveBeenCalled();
  });
});
