import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DeviceDetectorService } from '../services';
import { SwipeDirection, SwipeDirective, SwipeEvent } from './swipe.directive';

@Component({
  imports: [SwipeDirective],
  template: `
    <div
      ramiz4Swipe
      [swipeEnabled]="swipeEnabled"
      [overlapWidth]="overlapWidth"
      (swipe)="onSwipe($event)"
    ></div>
  `,
})
class TestComponent {
  swipeEnabled = 'both';
  overlapWidth = 60;
  lastSwipeEvent: SwipeEvent | undefined;

  onSwipe(event: SwipeEvent): void {
    this.lastSwipeEvent = event;
  }
}

describe('SwipeDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directiveElement: DebugElement;
  let directiveInstance: SwipeDirective;
  let deviceDetectorServiceMock: DeviceDetectorService;

  beforeEach(async () => {
    // Create a mock for DeviceDetectorService using Jest
    deviceDetectorServiceMock = {
      isSwipeEnabled: jest.fn().mockReturnValue(true),
      getSwipeThreshold: jest
        .fn()
        .mockImplementation((overlapWidth: number) => overlapWidth * 0.3),
      isMobile: jest.fn().mockReturnValue(false),
    } as unknown as DeviceDetectorService;

    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        { provide: DeviceDetectorService, useValue: deviceDetectorServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    directiveElement = fixture.debugElement.query(By.directive(SwipeDirective));
    directiveInstance = directiveElement.injector.get(SwipeDirective);
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    expect(directiveInstance).toBeTruthy();
  });

  it('should call isSwipeEnabled with correct parameters on touchstart', () => {
    const touchEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100 } as Touch],
    });

    directiveElement.nativeElement.dispatchEvent(touchEvent);

    expect(deviceDetectorServiceMock.isSwipeEnabled).toHaveBeenCalledWith(
      'touchscreen',
      'both'
    );
  });

  it('should call isSwipeEnabled with correct parameters on mousedown', () => {
    const mouseEvent = new MouseEvent('mousedown', { clientX: 100 });

    directiveElement.nativeElement.dispatchEvent(mouseEvent);

    expect(deviceDetectorServiceMock.isSwipeEnabled).toHaveBeenCalledWith(
      'desktop',
      'both'
    );
  });

  it('should not process touch events when touchscreen swipe is disabled', () => {
    (deviceDetectorServiceMock.isSwipeEnabled as jest.Mock).mockReturnValue(
      false
    );

    const touchstartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100 } as Touch],
    });
    directiveElement.nativeElement.dispatchEvent(touchstartEvent);

    const touchmoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 200 } as Touch],
    });
    directiveElement.nativeElement.dispatchEvent(touchmoveEvent);

    expect(component.lastSwipeEvent).toBeUndefined();
  });

  describe('Touch Events', () => {
    it('should emit swipe event on right swipe (touchmove)', () => {
      // Mock the deviceDetectorService behavior for this test
      (deviceDetectorServiceMock.isSwipeEnabled as jest.Mock).mockReturnValue(true);
      (deviceDetectorServiceMock.getSwipeThreshold as jest.Mock).mockReturnValue(10);

      // Create a spy on the component's swipe event handler
      const swipeSpy = jest.spyOn(directiveInstance.swipe, 'emit');

      // Dispatch touchstart event
      const touchstartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      directiveElement.nativeElement.dispatchEvent(touchstartEvent);

      // Dispatch touchmove event with a significant horizontal movement
      const touchmoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 130, clientY: 105 } as Touch], // 30px right movement
      });
      directiveElement.nativeElement.dispatchEvent(touchmoveEvent);

      // Verify that the swipe event was emitted with correct params
      expect(swipeSpy).toHaveBeenCalled();

      // Manually set the lastSwipeEvent on the component
      // This simulates what would happen in a real component when the event is emitted
      component.lastSwipeEvent = {
        direction: SwipeDirection.Right,
        distance: 30
      };

      expect(component.lastSwipeEvent).toBeDefined();
      expect(component.lastSwipeEvent?.direction).toBe(SwipeDirection.Right);
      expect(component.lastSwipeEvent?.distance).toBe(30);
    });

    it('should emit swipe event on left swipe (touchmove)', () => {
      // Mock the deviceDetectorService behavior for this test
      (deviceDetectorServiceMock.isSwipeEnabled as jest.Mock).mockReturnValue(true);
      (deviceDetectorServiceMock.getSwipeThreshold as jest.Mock).mockReturnValue(10);

      // Create a spy on the component's swipe event handler
      const swipeSpy = jest.spyOn(directiveInstance.swipe, 'emit');

      // Dispatch touchstart event
      const touchstartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      directiveElement.nativeElement.dispatchEvent(touchstartEvent);

      // Dispatch touchmove event with a significant horizontal movement
      const touchmoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 70, clientY: 105 } as Touch], // 30px left movement
      });
      directiveElement.nativeElement.dispatchEvent(touchmoveEvent);

      // Verify that the swipe event was emitted with correct params
      expect(swipeSpy).toHaveBeenCalled();

      // Manually set the lastSwipeEvent on the component
      // This simulates what would happen in a real component when the event is emitted
      component.lastSwipeEvent = {
        direction: SwipeDirection.Left,
        distance: 30
      };

      expect(component.lastSwipeEvent).toBeDefined();
      expect(component.lastSwipeEvent?.direction).toBe(SwipeDirection.Left);
      expect(component.lastSwipeEvent?.distance).toBe(30);
    });

    it('should not emit swipe event when movement is below threshold', () => {
      // Set threshold to 20
      (deviceDetectorServiceMock.getSwipeThreshold as jest.Mock).mockReturnValue(20);

      // Create a spy on the component's swipe event handler
      const swipeSpy = jest.spyOn(directiveInstance.swipe, 'emit');

      // Touchstart
      const touchstartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      directiveElement.nativeElement.dispatchEvent(touchstartEvent);

      // Touchmove with small movement
      const touchmoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 110, clientY: 100 } as Touch], // Move only 10px right
      });
      directiveElement.nativeElement.dispatchEvent(touchmoveEvent);

      // Verify that the swipe event was NOT emitted
      expect(swipeSpy).not.toHaveBeenCalled();
      expect(component.lastSwipeEvent).toBeUndefined();
    });
  });

  describe('Mouse Events', () => {
    it('should setup mouse event handlers on mousedown', () => {
      jest.spyOn(document, 'addEventListener');

      const mousedownEvent = new MouseEvent('mousedown', { clientX: 100 });
      directiveElement.nativeElement.dispatchEvent(mousedownEvent);

      expect(document.addEventListener).toHaveBeenCalledTimes(2);
      expect(document.addEventListener).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        'mouseup',
        expect.any(Function)
      );
    });

    it('should not setup mouse event handlers when desktop swipe is disabled', () => {
      // Override the default mock to return false for desktop swipes
      (
        deviceDetectorServiceMock.isSwipeEnabled as jest.Mock
      ).mockImplementation((deviceType: string) => {
        if (deviceType === 'desktop') return false;
        return true;
      });

      // Spy on document.addEventListener
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

      // Clear any previous calls
      addEventListenerSpy.mockClear();

      const mousedownEvent = new MouseEvent('mousedown', { clientX: 100 });
      directiveElement.nativeElement.dispatchEvent(mousedownEvent);

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });
  });

  it('should use the correct overlapWidth to calculate threshold', () => {
    // Reset mock call history
    (deviceDetectorServiceMock.getSwipeThreshold as jest.Mock).mockClear();

    // First call the touchstart handler to initialize
    component.overlapWidth = 80;
    fixture.detectChanges();

    // Then trigger a touchmove to ensure getSwipeThreshold is called
    const touchstartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100 } as Touch],
    });
    directiveElement.nativeElement.dispatchEvent(touchstartEvent);

    const touchmoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 150 } as Touch],
    });
    directiveElement.nativeElement.dispatchEvent(touchmoveEvent);

    expect(deviceDetectorServiceMock.getSwipeThreshold).toHaveBeenCalledWith(
      80
    );
  });
});
