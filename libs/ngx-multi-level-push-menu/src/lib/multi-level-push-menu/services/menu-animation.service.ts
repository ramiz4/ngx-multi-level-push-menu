import { Injectable, Renderer2 } from '@angular/core';
import { MenuLevelData } from '../multi-level-push-menu.model';
import { MenuUtils } from '../utilities/menu-utils';

// Animation duration constants
const ANIMATION_DURATION = {
  normal: 400,
  fast: 250
};

@Injectable()
export class MenuAnimationService {
  /**
   * Slide a level element in (show it)
   * @param renderer Angular renderer
   * @param element The element to animate
   * @param animationSpeed Speed of animation ('normal' or 'fast')
   */
  public slideIn(
    renderer: Renderer2, 
    element: HTMLElement,
    animationSpeed: 'fast' | 'normal' = 'normal'
  ): void {
    // Ensure the element is visible first
    renderer.setStyle(element, 'visibility', 'visible');
    MenuUtils.forceReflow(element);

    // Apply animation
    renderer.setProperty(element, '_slideState', 'in');
    renderer.setStyle(element, 'transform', 'translateX(0)');
    
    // Set animation duration based on speed
    const duration = ANIMATION_DURATION[animationSpeed];
    renderer.setStyle(element, 'transition', `transform ${duration}ms ease-in-out`);
  }

  /**
   * Slide a level element out (hide it)
   * @param renderer Angular renderer
   * @param element The element to animate
   * @param isRtl Whether the direction is right-to-left
   * @param callback Optional callback to execute after animation completes
   * @param animationSpeed Speed of animation ('normal' or 'fast')
   */
  public slideOut(
    renderer: Renderer2,
    element: HTMLElement,
    isRtl: boolean,
    callback?: () => void,
    animationSpeed: 'fast' | 'normal' = 'normal'
  ): void {
    MenuUtils.forceReflow(element);

    // Set animation duration based on speed
    const duration = ANIMATION_DURATION[animationSpeed];
    renderer.setStyle(element, 'transition', `transform ${duration}ms ease-in-out`);

    // Apply animation state
    const animState = isRtl ? 'outRtl' : 'out';
    renderer.setProperty(element, '_slideState', animState);

    // Set transform for animation
    const transform = isRtl ? 'translateX(100%)' : 'translateX(-100%)';
    renderer.setStyle(element, 'transform', transform);

    // Execute callback after animation completes
    if (callback) {
      setTimeout(callback, duration);
    }
  }

  /**
   * Handles the collapse animation
   * @param renderer Angular renderer
   * @param element The element to collapse
   * @param isRtl Whether direction is right-to-left
   * @param fullCollapse Whether to fully collapse the menu
   * @param width The element width
   * @param overlapWidth The overlap width
   * @param animationSpeed Speed of animation ('normal' or 'fast')
   * @param callback Optional callback to execute after animation
   */
  public animateCollapse(
    renderer: Renderer2,
    element: HTMLElement,
    isRtl: boolean,
    fullCollapse: boolean,
    width: number,
    overlapWidth: number,
    animationSpeed: 'fast' | 'normal' = 'normal',
    callback?: () => void
  ): void {
    MenuUtils.forceReflow(element);

    // Set animation duration based on speed
    const duration = ANIMATION_DURATION[animationSpeed];
    renderer.setStyle(element, 'transition', `transform ${duration}ms ease-in-out`);

    const marginLeft = fullCollapse ? -width : -width + overlapWidth;

    // Apply transform based on direction
    const transform = isRtl
      ? `translateX(${-marginLeft}px)`
      : `translateX(${marginLeft}px)`;
    renderer.setStyle(element, 'transform', transform);

    // Execute callback after animation completes
    if (callback) {
      setTimeout(callback, duration);
    }
  }

  /**
   * Handles the expand animation
   * @param renderer Angular renderer
   * @param element The element to expand
   * @param animationSpeed Speed of animation ('normal' or 'fast')
   */
  public animateExpand(
    renderer: Renderer2, 
    element: HTMLElement,
    animationSpeed: 'fast' | 'normal' = 'normal'
  ): void {
    // Set animation duration based on speed
    const duration = ANIMATION_DURATION[animationSpeed];
    renderer.setStyle(element, 'transition', `transform ${duration}ms ease-in-out`);
    
    // Reset transform
    renderer.setStyle(element, 'transform', 'translateX(0)');
  }

  /**
   * Animates levels higher than the given target level out of view
   * @param renderer Angular renderer
   * @param menuLevels Map of menu levels
   * @param targetLevel The target level
   * @param isRtl Whether direction is right-to-left
   * @param animationSpeed Speed of animation ('normal' or 'fast')
   */
  public animateHigherLevelsOut(
    renderer: Renderer2,
    menuLevels: Map<string, MenuLevelData>,
    targetLevel: number,
    isRtl: boolean,
    animationSpeed: 'fast' | 'normal' = 'normal'
  ): void {
    Array.from(menuLevels.entries())
      .filter(([, value]) => {
        const levelAttr = value.element.getAttribute('data-level');
        return parseInt(levelAttr ?? '0', 10) > targetLevel;
      })
      .forEach(([, value]) => {
        this.slideOut(
          renderer, 
          value.element, 
          isRtl, 
          () => renderer.setStyle(value.element, 'visibility', 'hidden'),
          animationSpeed
        );
      });
  }

  /**
   * Get the animation duration based on speed
   * @param speed The animation speed ('normal' or 'fast')
   */
  public getAnimationDuration(speed: 'fast' | 'normal' = 'normal'): number {
    return ANIMATION_DURATION[speed];
  }
}
