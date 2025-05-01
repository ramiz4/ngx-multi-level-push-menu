import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes, withComponentInputBinding } from '@angular/router';
import { MultiLevelPushMenuComponent } from './multi-level-push-menu.component';
import { MultiLevelPushMenuService } from './multi-level-push-menu.service';

// Create Dummy components for testing
@Component({ template: '' })
class DummyComponent {}

export const routes: Routes = [
  { path: '', component: DummyComponent },
  { path: 'dummy', component: DummyComponent },
  { path: '**', component: DummyComponent },
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MultiLevelPushMenuComponent],
      providers: [
        { provide: 'WINDOW', useValue: window },
        provideRouter(routes, withComponentInputBinding()),
        provideAnimations(),
        MultiLevelPushMenuService
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiLevelPushMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
