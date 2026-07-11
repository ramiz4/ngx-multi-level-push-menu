import { ElementRef, Renderer2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwipeDirection, SwipeDirective } from './swipe.directive';

describe('SwipeDirective', () => {
  let directive: SwipeDirective;
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    element.setPointerCapture = jest.fn();
    element.releasePointerCapture = jest.fn();
    element.hasPointerCapture = jest.fn().mockReturnValue(true);
    TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useValue: new ElementRef(element) },
        {
          provide: Renderer2,
          useValue: {
            listen: (
              target: HTMLElement,
              eventName: string,
              callback: EventListener,
              options?: AddEventListenerOptions,
            ) => {
              target.addEventListener(eventName, callback, options);
              return () =>
                target.removeEventListener(eventName, callback, options);
            },
          },
        },
      ],
    });
    directive = TestBed.runInInjectionContext(() => new SwipeDirective());
  });

  afterEach(() => directive.ngOnDestroy());

  it('emits a measured right swipe once', () => {
    const emit = jest.spyOn(directive.swipe, 'emit');
    directive.onPointerDown(pointerEvent({ clientX: 10, clientY: 10 }));
    directive.onPointerMove(pointerEvent({ clientX: 90, clientY: 12 }));
    directive.onPointerUp(pointerEvent({ clientX: 90, clientY: 12 }));

    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        direction: SwipeDirection.Right,
        distance: 80,
      }),
    );
  });

  it('honors left/right direction restrictions', () => {
    const emit = jest.spyOn(directive.swipe, 'emit');
    directive.swipeEnabled = 'left';
    directive.onPointerDown(pointerEvent({ clientX: 0 }));
    directive.onPointerUp(pointerEvent({ clientX: 100 }));
    expect(emit).not.toHaveBeenCalled();

    directive.onPointerDown(pointerEvent({ clientX: 100 }));
    directive.onPointerUp(pointerEvent({ clientX: 0 }));
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ direction: SwipeDirection.Left }),
    );
  });

  it('still blocks the drag click when the swipe direction is disabled', () => {
    const button = document.createElement('button');
    button.setPointerCapture = jest.fn();
    button.releasePointerCapture = jest.fn();
    button.hasPointerCapture = jest.fn().mockReturnValue(true);
    const click = jest.fn();
    button.addEventListener('click', click);
    element.append(button);
    directive.swipeEnabled = 'left';

    directive.onPointerDown(
      pointerEvent({ target: button, clientX: 0, clientY: 0 }),
    );
    directive.onPointerMove(
      pointerEvent({ target: button, clientX: 100, clientY: 0 }),
    );
    directive.onPointerUp(
      pointerEvent({ target: button, clientX: 100, clientY: 0 }),
    );
    button.click();

    expect(click).not.toHaveBeenCalled();
  });

  it('cancels vertical gestures without changing body overflow', () => {
    const cancel = jest.spyOn(directive.swipeCancel, 'emit');
    document.body.style.overflow = 'auto';

    directive.onPointerDown(pointerEvent({ clientX: 10, clientY: 10 }));
    directive.onPointerMove(pointerEvent({ clientX: 12, clientY: 100 }));

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('supports touchscreen-only mode', () => {
    const start = jest.spyOn(directive.swipeStart, 'emit');
    directive.swipeEnabled = 'touchscreen';

    directive.onPointerDown(pointerEvent({ pointerType: 'mouse' }));
    expect(start).not.toHaveBeenCalled();

    directive.onPointerDown(pointerEvent({ pointerType: 'touch' }));
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('keeps normal child clicks intact and does not capture on pointerdown', () => {
    const button = document.createElement('button');
    const click = jest.fn();
    button.addEventListener('click', click);
    element.append(button);

    directive.onPointerDown(pointerEvent({ target: button }));
    directive.onPointerUp(pointerEvent({ target: button }));
    button.click();

    expect(element.setPointerCapture).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('captures horizontal intent on the original target and blocks its drag click', () => {
    const button = document.createElement('button');
    button.setPointerCapture = jest.fn();
    button.releasePointerCapture = jest.fn();
    button.hasPointerCapture = jest.fn().mockReturnValue(true);
    const click = jest.fn();
    button.addEventListener('click', click);
    element.append(button);

    directive.onPointerDown(
      pointerEvent({ target: button, clientX: 10, clientY: 10 }),
    );
    directive.onPointerMove(
      pointerEvent({ target: button, clientX: 90, clientY: 12 }),
    );
    directive.onPointerUp(
      pointerEvent({ target: button, clientX: 90, clientY: 12 }),
    );
    button.click();

    expect(button.setPointerCapture).toHaveBeenCalledWith(1);
    expect(click).not.toHaveBeenCalled();
  });

  it('uses native touch behavior when swipe handling is disabled', () => {
    directive.swipeEnabled = 'none';
    expect(directive.touchAction).toBe('auto');
  });

  function pointerEvent(overrides: Partial<PointerEvent> = {}): PointerEvent {
    return {
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
      clientX: 0,
      clientY: 0,
      ...overrides,
    } as PointerEvent;
  }
});
