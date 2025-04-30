import { Injectable, Renderer2 } from '@angular/core';
import { MenuLevelData } from '../multi-level-push-menu.model';
import { MenuUtils } from '../utilities/menu-utils';

// Animation duration constant
const ANIMATION_DURATION = 400;

@Injectable()
export class MenuAnimationService {
    /**
     * Slide a level element in (show it)
     * @param renderer Angular renderer
     * @param element The element to animate
     * @param isRtl Whether the direction is right-to-left
     */
    public slideIn(renderer: Renderer2, element: HTMLElement): void {
        // Ensure the element is visible first
        renderer.setStyle(element, 'visibility', 'visible');
        MenuUtils.forceReflow(element);

        // Apply animation
        renderer.setProperty(element, '_slideState', 'in');
        renderer.setStyle(element, 'transform', 'translateX(0)');
    }

    /**
     * Slide a level element out (hide it)
     * @param renderer Angular renderer
     * @param element The element to animate
     * @param isRtl Whether the direction is right-to-left
     * @param callback Optional callback to execute after animation completes
     */
    public slideOut(
        renderer: Renderer2,
        element: HTMLElement,
        isRtl: boolean,
        callback?: () => void
    ): void {
        MenuUtils.forceReflow(element);

        // Apply animation state
        const animState = isRtl ? 'outRtl' : 'out';
        renderer.setProperty(element, '_slideState', animState);

        // Set transform for animation
        const transform = isRtl ? 'translateX(100%)' : 'translateX(-100%)';
        renderer.setStyle(element, 'transform', transform);

        // Execute callback after animation completes
        if (callback) {
            setTimeout(callback, ANIMATION_DURATION);
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
     * @param callback Optional callback to execute after animation
     */
    public animateCollapse(
        renderer: Renderer2,
        element: HTMLElement,
        isRtl: boolean,
        fullCollapse: boolean,
        width: number,
        overlapWidth: number,
        callback?: () => void
    ): void {
        MenuUtils.forceReflow(element);

        const marginLeft = fullCollapse ? -width : -width + overlapWidth;

        // Apply transform based on direction
        const transform = isRtl ?
            `translateX(${-marginLeft}px)` : `translateX(${marginLeft}px)`;
        renderer.setStyle(element, 'transform', transform);

        // Execute callback after animation completes
        if (callback) {
            setTimeout(callback, ANIMATION_DURATION);
        }
    }

    /**
     * Handles the expand animation
     * @param renderer Angular renderer
     * @param element The element to expand
     */
    public animateExpand(renderer: Renderer2, element: HTMLElement): void {
        // Reset transform
        renderer.setStyle(element, 'transform', 'translateX(0)');
    }

    /**
     * Animates levels higher than the given target level out of view
     * @param renderer Angular renderer
     * @param menuLevels Map of menu levels
     * @param targetLevel The target level
     * @param isRtl Whether direction is right-to-left
     */
    public animateHigherLevelsOut(
        renderer: Renderer2,
        menuLevels: Map<string, MenuLevelData>,
        targetLevel: number,
        isRtl: boolean
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
                    () => renderer.setStyle(value.element, 'visibility', 'hidden')
                );
            });
    }

    /**
     * Get the animation duration
     */
    public getAnimationDuration(): number {
        return ANIMATION_DURATION;
    }
}