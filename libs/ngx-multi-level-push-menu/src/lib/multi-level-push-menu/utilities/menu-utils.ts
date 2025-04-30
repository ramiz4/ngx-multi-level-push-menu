/**
 * Utility class with helper methods for the multi-level push menu
 */
export class MenuUtils {
    /**
     * Parses a size string (px, %, em) to a pixel number
     * @param size The size string to parse
     * @returns The size in pixels
     */
    public static parseSize(size: string): number {
        if (!size) return 0;

        if (size.endsWith('px')) {
            return parseInt(size, 10);
        } else if (size.endsWith('%')) {
            const percentage = parseInt(size, 10);
            return (percentage / 100) * window.innerWidth;
        } else if (size.endsWith('em')) {
            const emSize = parseInt(size, 10);
            const fontSize = parseFloat(
                getComputedStyle(document.documentElement).fontSize
            );
            return emSize * fontSize;
        } else {
            return parseInt(size, 10);
        }
    }

    /**
     * Gets the width of an HTML element
     * @param element The element to measure
     * @returns The width in pixels
     */
    public static getElementWidth(element: HTMLElement): number {
        return element ? element.offsetWidth : 0;
    }

    /**
     * Forces a reflow of an element to ensure styles are applied
     * @param element The element to force reflow on
     * @returns The element's width as confirmation of reflow
     */
    public static forceReflow(element: HTMLElement): number {
        return element.offsetWidth;
    }
}