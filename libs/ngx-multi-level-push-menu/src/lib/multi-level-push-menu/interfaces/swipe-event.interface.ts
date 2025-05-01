import { SwipeDirection } from '../directives/swipe.directive';

/**
 * Event emitted during a swipe gesture
 */
export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  velocity?: number;
}
