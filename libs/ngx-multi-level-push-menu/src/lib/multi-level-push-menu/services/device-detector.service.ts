import { Injectable } from '@angular/core';

@Injectable()
export class DeviceDetectorService {
    /**
     * Checks if the device is a mobile device
     * @returns true if the device is mobile, false otherwise
     */
    public isMobile(): boolean {
        // Check for touch capability
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            const userAgent = navigator.userAgent.toLowerCase();
            return /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        }

        // Fallback to screen size check
        return window.matchMedia('(max-width: 767px)').matches;
    }

    /**
     * Checks if swipe is enabled for the given device type
     * @param deviceType 'desktop' or 'touchscreen'
     * @param swipeOption the swipe option from configuration
     * @returns true if swipe is enabled for this device type
     */
    public isSwipeEnabled(deviceType: 'desktop' | 'touchscreen', swipeOption: string): boolean {
        if (swipeOption === 'none') return false;
        return deviceType === 'desktop' ?
            swipeOption !== 'touchscreen' :
            swipeOption !== 'desktop';
    }

    /**
     * Calculate the swipe threshold based on overlap width
     * @param overlapWidth the width of overlap between menu levels
     * @returns the calculated swipe threshold
     */
    public getSwipeThreshold(overlapWidth: number): number {
        return overlapWidth * 0.3;
    }
}