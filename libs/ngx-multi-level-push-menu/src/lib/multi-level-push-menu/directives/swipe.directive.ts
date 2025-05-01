import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { DeviceDetectorService } from '../services/device-detector.service';

/**
 * Direction of the swipe
 */
export enum SwipeDirection {
  Left = 'left',
  Right = 'right',
}

/**
 * Event emitted when a swipe is detected
 */
export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
}

/**
 * Directive to handle swipe gestures on both mobile and desktop devices
 */
@Directive({
  selector: '[ramiz4Swipe], [swipeEnabled], [overlapWidth]',
  standalone: true,
})
export class SwipeDirective {
  // Inputs
  @Input() swipeEnabled = 'both'; // 'touchscreen', 'desktop', 'both', or 'none'
  @Input() overlapWidth = 55; // Used to calculate threshold

  // Outputs
  @Output() swipe = new EventEmitter<SwipeEvent>();

  private startX = 0;

  constructor(
    private el: ElementRef,
    private deviceDetectorService: DeviceDetectorService
  ) {}

  /**
   * Handle touch start event
   */
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (
      !this.deviceDetectorService.isSwipeEnabled(
        'touchscreen',
        this.swipeEnabled
      )
    )
      return;
    this.startX = event.touches[0].clientX;
  }

  /**
   * Handle touch move event
   */
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (
      !this.deviceDetectorService.isSwipeEnabled(
        'touchscreen',
        this.swipeEnabled
      )
    )
      return;
    if (this.startX === 0) return;

    const currentX = event.touches[0].clientX;
    const diff = currentX - this.startX;
    const threshold = this.deviceDetectorService.getSwipeThreshold(
      this.overlapWidth
    );

    if (Math.abs(diff) > threshold) {
      this.emitSwipeEvent(diff);
      this.startX = 0;
    }
  }

  /**
   * Handle mouse down event (for desktop swipe)
   */
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (
      !this.deviceDetectorService.isSwipeEnabled('desktop', this.swipeEnabled)
    )
      return;

    this.startX = event.clientX;
    this.setupMouseSwipeHandlers();
  }

  /**
   * Set up handlers for mouse move and mouse up during a swipe operation
   */
  private setupMouseSwipeHandlers(): void {
    const threshold = this.deviceDetectorService.getSwipeThreshold(
      this.overlapWidth
    );

    const mouseMoveHandler = (e: MouseEvent) => {
      if (this.startX === 0) return;

      const diff = e.clientX - this.startX;
      if (Math.abs(diff) > threshold) {
        this.emitSwipeEvent(diff);
        this.startX = 0;
        document.removeEventListener('mousemove', mouseMoveHandler);
      }
    };

    const mouseUpHandler = () => {
      this.startX = 0;
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  /**
   * Emit a swipe event with the appropriate direction
   */
  private emitSwipeEvent(diff: number): void {
    const direction = diff > 0 ? SwipeDirection.Right : SwipeDirection.Left;
    this.swipe.emit({
      direction,
      distance: Math.abs(diff),
    });
  }
}
