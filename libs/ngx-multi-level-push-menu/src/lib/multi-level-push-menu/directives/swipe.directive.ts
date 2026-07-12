import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  OnDestroy,
  Output,
  Renderer2,
} from '@angular/core';
import { SwipeEvent } from '../interfaces';

export enum SwipeDirection {
  Left = 'left',
  Right = 'right',
}

export type SwipeMode =
  | 'both'
  | 'left'
  | 'right'
  | 'touchscreen'
  | 'desktop'
  | 'none';

/** Pointer-event based horizontal swipe detection that preserves page scroll. */
@Directive({
  selector: '[ramiz4Swipe]',
  exportAs: 'swipe',
  standalone: true,
})
export class SwipeDirective implements OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly removeCapturedClickListener: () => void;

  @Input() swipeEnabled: SwipeMode = 'both';
  @Input() swipeThreshold: number | null = null;
  @Input() overlapWidth = 60;

  /** @deprecated Body scroll is no longer mutated; `touch-action: pan-y` is used. */
  @Input() preventBodyScroll = true;

  @Output() readonly swipe = new EventEmitter<SwipeEvent>();
  @Output() readonly swipeStart = new EventEmitter<{ x: number; y: number }>();
  @Output() readonly swipeCancel = new EventEmitter<void>();
  @Output() readonly swipeEnd = new EventEmitter<void>();

  @HostBinding('style.touch-action')
  get touchAction(): 'auto' | 'pan-y' {
    return this.swipeEnabled === 'none' || this.swipeEnabled === 'desktop'
      ? 'auto'
      : 'pan-y';
  }

  private pointerId: number | null = null;
  private pointerType = '';
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private startTime = 0;
  private suppressNextClick = false;
  private suppressionTimer: ReturnType<typeof globalThis.setTimeout> | null =
    null;
  private captureTarget: HTMLElement | null = null;

  constructor() {
    this.removeCapturedClickListener = this.renderer.listen(
      this.elementRef.nativeElement,
      'click',
      (event: MouseEvent) => this.onCapturedClick(event),
      { capture: true },
    );
  }

  ngOnDestroy(): void {
    this.removeCapturedClickListener();
    this.clearClickSuppression();
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (this.isNoSwipeTarget(event.target)) {
      this.clearClickSuppression();
      return;
    }

    if (
      this.pointerId !== null ||
      !event.isPrimary ||
      (event.pointerType === 'mouse' && event.button !== 0) ||
      !this.isPointerTypeEnabled(event.pointerType)
    ) {
      return;
    }

    this.clearClickSuppression();
    this.pointerId = event.pointerId;
    this.pointerType = event.pointerType;
    this.startX = this.currentX = event.clientX;
    this.startY = this.currentY = event.clientY;
    this.startTime = performance.now();
    this.swipeStart.emit({ x: event.clientX, y: event.clientY });
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;

    this.currentX = event.clientX;
    this.currentY = event.clientY;
    const diffX = this.currentX - this.startX;
    const diffY = this.currentY - this.startY;

    if (Math.abs(diffY) > Math.abs(diffX) * 1.25) {
      this.cancelTracking(event.pointerId);
      return;
    }

    if (
      !this.captureTarget &&
      Math.abs(diffX) >= Math.min(this.effectiveThreshold(), 24) &&
      Math.abs(diffX) > Math.abs(diffY) * 1.25
    ) {
      const target = event.target as HTMLElement | null;
      if (target?.setPointerCapture) {
        target.setPointerCapture(event.pointerId);
        this.captureTarget = target;
      }
    }
  }

  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;

    this.currentX = event.clientX;
    this.currentY = event.clientY;
    const diffX = this.currentX - this.startX;
    const diffY = this.currentY - this.startY;
    const duration = Math.max(performance.now() - this.startTime, 1);
    const threshold = this.effectiveThreshold();
    const direction = diffX > 0 ? SwipeDirection.Right : SwipeDirection.Left;

    const isHorizontalSwipe =
      Math.abs(diffX) >= threshold && Math.abs(diffX) > Math.abs(diffY);

    if (isHorizontalSwipe || this.captureTarget) this.armClickSuppression();

    if (isHorizontalSwipe && this.isDirectionEnabled(direction)) {
      this.swipe.emit({
        direction,
        distance: Math.abs(diffX),
        velocity: Math.abs(diffX) / duration,
      });
    } else {
      this.swipeCancel.emit();
    }

    this.finishTracking(event.pointerId);
  }

  @HostListener('pointercancel', ['$event'])
  onPointerCancel(event: PointerEvent): void {
    if (event.pointerId === this.pointerId) {
      this.cancelTracking(event.pointerId);
    }
  }

  @HostListener('lostpointercapture', ['$event'])
  onLostPointerCapture(event: PointerEvent): void {
    if (event.pointerId === this.pointerId) {
      this.cancelTracking(event.pointerId);
    }
  }

  private onCapturedClick(event: MouseEvent): void {
    if (this.isNoSwipeTarget(event.target)) {
      this.clearClickSuppression();
      return;
    }
    if (!this.suppressNextClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    this.clearClickSuppression();
  }

  private isPointerTypeEnabled(pointerType: string): boolean {
    if (this.swipeEnabled === 'none') return false;
    if (this.swipeEnabled === 'touchscreen') return pointerType !== 'mouse';
    if (this.swipeEnabled === 'desktop') return pointerType === 'mouse';
    return true;
  }

  private isNoSwipeTarget(target: EventTarget | null): boolean {
    const element = target as Element | null;
    return (
      typeof element?.closest === 'function' &&
      element.closest('[data-menu-no-swipe]') !== null
    );
  }

  private isDirectionEnabled(direction: SwipeDirection): boolean {
    return (
      (this.swipeEnabled !== 'left' && this.swipeEnabled !== 'right') ||
      this.swipeEnabled === direction
    );
  }

  private cancelTracking(pointerId: number): void {
    if (this.captureTarget) this.armClickSuppression();
    this.swipeCancel.emit();
    this.finishTracking(pointerId);
  }

  private effectiveThreshold(): number {
    if (this.swipeThreshold !== null && Number.isFinite(this.swipeThreshold)) {
      return Math.max(this.swipeThreshold, 1);
    }
    const overlap = Number.isFinite(this.overlapWidth)
      ? Math.max(this.overlapWidth, 0)
      : 60;
    return Math.max(overlap * 0.3, 24);
  }

  private finishTracking(pointerId: number): void {
    const captureTarget = this.captureTarget;
    this.pointerId = null;
    this.pointerType = '';
    this.captureTarget = null;
    if (captureTarget?.hasPointerCapture?.(pointerId)) {
      captureTarget.releasePointerCapture(pointerId);
    }
    this.swipeEnd.emit();
  }

  private armClickSuppression(): void {
    this.clearClickSuppression();
    this.suppressNextClick = true;
    this.suppressionTimer = globalThis.setTimeout(
      () => this.clearClickSuppression(),
      250,
    );
  }

  private clearClickSuppression(): void {
    this.suppressNextClick = false;
    if (this.suppressionTimer !== null) {
      globalThis.clearTimeout(this.suppressionTimer);
      this.suppressionTimer = null;
    }
  }
}
