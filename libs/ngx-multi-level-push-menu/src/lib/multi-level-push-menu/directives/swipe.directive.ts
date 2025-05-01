import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { SwipeEvent } from '../interfaces';
import { DeviceDetectorService } from '../services';

export enum SwipeDirection {
  Left = 'left',
  Right = 'right',
}

/**
 * Enhanced directive to handle swipe gestures on mobile and desktop devices
 * with improved touch detection and velocity tracking
 */
@Directive({
  selector: '[ramiz4Swipe]',
  exportAs: 'swipe',
  standalone: true,
})
export class SwipeDirective implements OnInit, OnChanges, OnDestroy {
  @Input() swipeEnabled: 'both' | 'left' | 'right' = 'both';
  @Input() swipeThreshold: number | null = null;
  @Input() overlapWidth = 60;
  @Input() preventBodyScroll = true;

  @Output() swipe = new EventEmitter<SwipeEvent>();
  @Output() swipeStart = new EventEmitter<{ x: number; y: number }>();
  @Output() swipeCancel = new EventEmitter<void>();

  private isTracking = false;
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private threshold = 30; // Default threshold - will be updated based on device and input
  private originalBodyOverflow: string | null = null;

  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private mouseUpHandler: ((e: MouseEvent) => void) | null = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private deviceDetectorService: DeviceDetectorService
  ) { }

  ngOnInit(): void {
    this.updateThreshold();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['overlapWidth'] || changes['swipeThreshold']) {
      this.updateThreshold();
    }
  }

  private updateThreshold(): void {
    // Set threshold based on input or device
    this.threshold = this.swipeThreshold ||
      this.deviceDetectorService.getSwipeThreshold(this.overlapWidth);
  }

  /**
   * Handle touch start event
   */
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (!this.deviceDetectorService.isSwipeEnabled('touchscreen', this.swipeEnabled))
      return;

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.startTracking(touch.clientX, touch.clientY);
    }
  }

  /**
   * Handle touch move event with improved tracking
   */
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isTracking) return;

    const touch = event.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;

    // Calculate horizontal and vertical distance
    const diffX = currentX - this.startX;
    const diffY = currentY - this.startY;

    // Update threshold from current overlapWidth to ensure it's current
    this.updateThreshold();

    // Determine if this is primarily a horizontal or vertical swipe
    // For menu purposes, we only care about horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.threshold) {
      // This is a horizontal swipe that exceeds threshold
      const duration = Date.now() - this.startTime;
      let velocity = 0; // Default velocity to 0
      if (duration > 0) {
        velocity = Math.abs(diffX) / duration; // pixels per millisecond
      }

      this.emitSwipeEvent(diffX, velocity);
      this.resetTracking();
      // Prevent default to avoid page scrolling
      event.preventDefault();
    } else if (Math.abs(diffY) > Math.abs(diffX) * 2) {
      // This is a vertical swipe - cancel the tracking as it's not relevant for our menu
      this.swipeCancel.emit();
      this.resetTracking();
    }
  }

  /**
   * Handle touch end event
   */
  @HostListener('touchend')
  onTouchEnd(): void {
    this.resetTracking();
  }

  /**
   * Handle touch cancel event
   */
  @HostListener('touchcancel')
  onTouchCancel(): void {
    this.swipeCancel.emit();
    this.resetTracking();
  }

  /**
   * Handle mouse down event for desktop devices
   */
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!this.deviceDetectorService.isSwipeEnabled('desktop', this.swipeEnabled))
      return;

    this.startTracking(event.clientX, event.clientY);

    // Setup document-level listeners for mouse move and up
    this.setupMouseEventHandlers();
  }

  /**
   * Set up tracking on start of a touch/drag
   */
  private startTracking(x: number, y: number): void {
    this.isTracking = true;
    this.startX = x;
    this.startY = y;
    this.startTime = Date.now();
    this.swipeStart.emit({ x, y });

    // Prevent body scrolling if enabled
    if (this.preventBodyScroll) {
      this.originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Reset tracking flags and data
   */
  private resetTracking(): void {
    this.isTracking = false;
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;

    // Restore body scrolling
    if (this.preventBodyScroll && this.originalBodyOverflow !== null) {
      document.body.style.overflow = this.originalBodyOverflow;
      this.originalBodyOverflow = null;
    }

    // Clean up mouse event handlers if they exist
    this.cleanupMouseEventHandlers();
  }

  /**
   * Emit a swipe event based on the distance moved
   */
  private emitSwipeEvent(diffX: number, velocity: number): void {
    const direction = diffX > 0 ? SwipeDirection.Right : SwipeDirection.Left;
    const distance = Math.abs(diffX);

    this.swipe.emit({
      direction,
      distance,
      velocity,
    });
  }

  /**
   * Set up document-level mouse event handlers for desktop swipe
   */
  private setupMouseEventHandlers(): void {
    // Clean up existing handlers if any
    this.cleanupMouseEventHandlers();

    // Create new handlers
    this.mouseMoveHandler = (e: MouseEvent) => {
      if (!this.isTracking) return;

      const diffX = e.clientX - this.startX;
      const diffY = e.clientY - this.startY;

      // Use the same threshold as for touch events
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.threshold) {
        const duration = Date.now() - this.startTime;
        const velocity = Math.abs(diffX) / duration;

        this.emitSwipeEvent(diffX, velocity);
        this.resetTracking();
      } else if (Math.abs(diffY) > Math.abs(diffX) * 2) {
        // Vertical movement - cancel swipe
        this.swipeCancel.emit();
        this.resetTracking();
      }
    };

    this.mouseUpHandler = () => {
      this.resetTracking();
    };

    // Attach handlers to document
    document.addEventListener('mousemove', this.mouseMoveHandler);
    document.addEventListener('mouseup', this.mouseUpHandler);
  }

  /**
   * Clean up document-level mouse event handlers
   */
  private cleanupMouseEventHandlers(): void {
    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
      this.mouseMoveHandler = null;
    }

    if (this.mouseUpHandler) {
      document.removeEventListener('mouseup', this.mouseUpHandler);
      this.mouseUpHandler = null;
    }
  }

  /**
   * Ensure all event handlers are removed when directive is destroyed
   */
  ngOnDestroy(): void {
    // Restore body overflow if it was changed
    if (this.preventBodyScroll && this.originalBodyOverflow !== null) {
      document.body.style.overflow = this.originalBodyOverflow;
    }

    this.cleanupMouseEventHandlers();
  }
}
