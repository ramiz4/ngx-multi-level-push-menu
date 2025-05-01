/**
 * Event emitted when keyboard navigation is needed
 */
export interface KeyNavigationEvent {
  direction: 'up' | 'down' | 'left' | 'right';
  sourceElement: HTMLElement;
}
