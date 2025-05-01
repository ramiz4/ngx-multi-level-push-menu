import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SwipeDirective } from './directives/swipe.directive';
import { MultiLevelPushMenuComponent } from './multi-level-push-menu.component';
import { MultiLevelPushMenuService } from './multi-level-push-menu.service';
import { DeviceDetectorService } from './services/device-detector.service';

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
      imports: [RouterTestingModule.withRoutes([]), SwipeDirective],
      declarations: [MultiLevelPushMenuComponent],
      providers: [MultiLevelPushMenuService, DeviceDetectorService],
      teardown: { destroyAfterEach: false },
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
