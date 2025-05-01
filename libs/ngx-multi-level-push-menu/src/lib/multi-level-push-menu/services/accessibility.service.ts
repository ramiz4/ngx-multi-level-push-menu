import { Injectable, Renderer2 } from '@angular/core';

/**
 * Service to manage accessibility features like keyboard navigation and focus management
 */
@Injectable()
export class AccessibilityService {
  // Cache for live region to avoid repeated DOM lookups
  private liveRegion: HTMLElement | null = null;

  // Store the previous announcement to avoid duplicate announcements
  private lastAnnouncement = '';
  private announcementDebounceTimer: ReturnType<typeof setTimeout> | null =
    null;

  /**
   * Creates a focus trap within the specified container
   * This keeps focus within the container when Tab/Shift+Tab are pressed
   */
  public createFocusTrap(
    renderer: Renderer2,
    container: HTMLElement
  ): () => void {
    // Store original tabindex values to restore later
    const elementsWithTabIndex = new Map<HTMLElement, string | null>();

    // Find all focusable elements
    const focusableElements = this.getFocusableElements(container);

    // If no focusable elements, nothing to trap
    if (focusableElements.length === 0) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }

    // Handle keydown events to trap focus
    const keydownListener = renderer.listen(
      container,
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        // Handle Tab and Shift+Tab
        if (event.shiftKey && document.activeElement === focusableElements[0]) {
          // If Shift+Tab on first element, move to last
          event.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
        } else if (
          !event.shiftKey &&
          document.activeElement ===
            focusableElements[focusableElements.length - 1]
        ) {
          // If Tab on last element, move to first
          event.preventDefault();
          focusableElements[0].focus();
        }
      }
    );

    // Add escape key handler to dismiss menu (will trigger a focus out)
    const escapeKeyListener = renderer.listen(
      container,
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.announceToScreenReader('Menu closed with escape key');

          // Find closest button with menu-toggle role or class
          const menuToggle = container.querySelector(
            '.menu-toggle'
          ) as HTMLElement;
          if (menuToggle) {
            menuToggle.focus();
            menuToggle.click();
          }
        }
      }
    );

    // Auto-focus first element in the trap
    if (focusableElements.length > 0) {
      setTimeout(() => focusableElements[0].focus(), 10);
    }

    // Return cleanup function
    return () => {
      keydownListener();
      escapeKeyListener();
      // Restore original tabindex values
      elementsWithTabIndex.forEach((value, element) => {
        if (value === null) {
          renderer.removeAttribute(element, 'tabindex');
        } else {
          renderer.setAttribute(element, 'tabindex', value);
        }
      });
    };
  }

  /**
   * Handle keyboard navigation between menu items in a level
   */
  public handleKeyboardNavigation(
    direction: 'up' | 'down' | 'left' | 'right',
    sourceElement: HTMLElement,
    container: HTMLElement,
    isRtl = false
  ): void {
    // Get all focusable menu items within this level
    const menuItems = Array.from(
      container.querySelectorAll('[ramiz4MenuItem]')
    ) as HTMLElement[];

    if (menuItems.length === 0) return;

    // Find current index
    const currentIndex = menuItems.indexOf(sourceElement);
    if (currentIndex === -1) return;

    let nextIndex: number;

    // Adapt directions based on RTL setting
    const effectiveDirection = this.getEffectiveDirection(direction, isRtl);

    switch (effectiveDirection) {
      case 'up':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        // Announce the new position for screen readers
        this.announcePositionChange(nextIndex + 1, menuItems.length, 'up');
        break;

      case 'down':
        nextIndex = (currentIndex + 1) % menuItems.length;
        // Announce the new position for screen readers
        this.announcePositionChange(nextIndex + 1, menuItems.length, 'down');
        break;

      case 'left':
        // In LTR, left means go back. In RTL, left means go forward to submenu
        if (isRtl) {
          // Handle submenu navigation (if item has a submenu)
          this.handleSubmenuNavigation(sourceElement);
          this.announceToScreenReader('Entering submenu');
        } else {
          // Handle back navigation
          this.handleBackNavigation(container);
          this.announceToScreenReader('Returning to previous menu');
        }
        return;

      case 'right':
        // In LTR, right means go to submenu. In RTL, right means go back
        if (isRtl) {
          // Handle back navigation
          this.handleBackNavigation(container);
          this.announceToScreenReader('Returning to previous menu');
        } else {
          // Handle submenu navigation (if item has a submenu)
          this.handleSubmenuNavigation(sourceElement);
          this.announceToScreenReader('Entering submenu');
        }
        return;

      default:
        return;
    }

    // Focus the next element
    if (menuItems[nextIndex]) {
      menuItems[nextIndex].focus();

      // Announce the item text for screen readers
      const itemText = this.getMenuItemText(menuItems[nextIndex]);
      if (itemText) {
        this.announceToScreenReader(itemText);
      }
    }
  }

  /**
   * Announce a message to screen readers using the aria-live region
   */
  public announceToScreenReader(message: string): void {
    // Prevent duplicate announcements in quick succession
    if (message === this.lastAnnouncement) {
      return;
    }

    // Clear any pending announcements
    if (this.announcementDebounceTimer) {
      clearTimeout(this.announcementDebounceTimer);
    }

    this.lastAnnouncement = message;

    // Get or create the live region
    if (!this.liveRegion) {
      this.liveRegion = document.getElementById('menu-live-region');
    }

    if (this.liveRegion) {
      // Clear before setting new content (helps with some screen readers)
      this.liveRegion.textContent = '';

      // Use a small timeout to ensure the clear registers
      this.announcementDebounceTimer = setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = message;
        }

        // Reset last announcement after a reasonable delay
        setTimeout(() => {
          this.lastAnnouncement = '';
        }, 1000);
      }, 50);
    }
  }

  /**
   * Add ARIA landmarks to the menu container
   */
  public setupAriaLandmarks(
    renderer: Renderer2,
    menuContainer: HTMLElement
  ): void {
    // Set appropriate ARIA attributes for the menu
    renderer.setAttribute(menuContainer, 'role', 'navigation');
    renderer.setAttribute(menuContainer, 'aria-label', 'Main navigation menu');

    // Ensure the menu container is reachable by keyboard navigation
    if (!menuContainer.hasAttribute('tabindex')) {
      renderer.setAttribute(menuContainer, 'tabindex', '-1');
    }
  }

  /**
   * Get all focusable elements within a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }

  /**
   * Get effective navigation direction based on RTL setting
   */
  private getEffectiveDirection(
    direction: 'up' | 'down' | 'left' | 'right',
    isRtl: boolean
  ): 'up' | 'down' | 'left' | 'right' {
    if (!isRtl || direction === 'up' || direction === 'down') {
      return direction;
    }

    // Flip left/right for RTL
    return direction === 'left' ? 'right' : 'left';
  }

  /**
   * Handle navigation to back button
   */
  private handleBackNavigation(container: HTMLElement): void {
    const backButton = container.querySelector(
      '[data-is-back-item="true"]'
    ) as HTMLElement;
    if (backButton) {
      backButton.focus();
      // Announce the back navigation to screen readers
      this.announceToScreenReader('Back to previous menu');

      // Simulate click after delay for better user experience
      setTimeout(() => backButton.click(), 150);
    }
  }

  /**
   * Handle navigation to submenu
   */
  private handleSubmenuNavigation(sourceElement: HTMLElement): void {
    const isSubmenu = sourceElement.getAttribute('data-is-submenu') === 'true';
    if (isSubmenu) {
      // Announce the submenu navigation
      const menuTitle = sourceElement.textContent?.trim() || 'submenu';
      this.announceToScreenReader(`Opening ${menuTitle}`);

      // Focus will be handled by the component after the submenu is opened
      sourceElement.click();
    }
  }

  /**
   * Get the text of a menu item for screen reader announcements
   */
  private getMenuItemText(element: HTMLElement): string {
    // Try to get the text content of the element
    let text = element.textContent?.trim() || '';

    // If the element has an aria-label, use that instead
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      text = ariaLabel;
    }

    // Check if this is a submenu item and enhance the announcement
    const isSubmenu = element.getAttribute('data-is-submenu') === 'true';
    if (isSubmenu) {
      text += ' (submenu)';
    }

    // Check if this is a back item
    const isBackItem = element.getAttribute('data-is-back-item') === 'true';
    if (isBackItem) {
      text = 'Back to previous menu';
    }

    return text;
  }

  /**
   * Announce the position change in a list for screen readers
   */
  private announcePositionChange(
    current: number,
    total: number,
    direction: 'up' | 'down'
  ): void {
    this.announceToScreenReader(
      `Item ${current} of ${total}, moved ${direction}`
    );
  }
}
