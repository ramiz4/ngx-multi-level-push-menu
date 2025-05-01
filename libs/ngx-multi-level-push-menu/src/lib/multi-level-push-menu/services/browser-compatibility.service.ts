import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service to handle browser-specific compatibility issues
 * Detects browser types and versions to apply targeted fixes
 */
@Injectable({
  providedIn: 'root'
})
export class BrowserCompatibilityService {
  private readonly isBrowser: boolean;
  private userAgent = '';
  
  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.userAgent = navigator.userAgent.toLowerCase();
    }
  }
  
  /**
   * Determines if the current browser is Safari
   */
  isSafari(): boolean {
    if (!this.isBrowser) return false;
    return this.userAgent.includes('safari') && !this.userAgent.includes('chrome');
  }
  
  /**
   * Determines if the current browser is Internet Explorer
   */
  isIE(): boolean {
    if (!this.isBrowser) return false;
    return this.userAgent.includes('trident') || this.userAgent.includes('msie');
  }
  
  /**
   * Determines if the current browser is Edge (old Edge, not Chromium-based)
   */
  isEdgeLegacy(): boolean {
    if (!this.isBrowser) return false;
    return this.userAgent.includes('edge/');
  }
  
  /**
   * Determines if the current browser is Firefox
   */
  isFirefox(): boolean {
    if (!this.isBrowser) return false;
    return this.userAgent.includes('firefox');
  }
  
  /**
   * Determines if the current browser is Chrome or Chromium-based
   */
  isChrome(): boolean {
    if (!this.isBrowser) return false;
    return this.userAgent.includes('chrome') && !this.userAgent.includes('edge/');
  }
  
  /**
   * Determines if the current device is iOS
   */
  isIOS(): boolean {
    if (!this.isBrowser) return false;
    return /iPad|iPhone|iPod/.test(this.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  
  /**
   * Checks if current browser requires fixes for transform-origin
   */
  requiresTransformOriginFix(): boolean {
    return this.isSafari() || this.isIOS();
  }
  
  /**
   * Gets CSS prefixes needed for this browser
   */
  getCssPrefixes(): string[] {
    if (this.isIE() || this.isEdgeLegacy()) return ['-ms-'];
    if (this.isSafari() || this.isIOS()) return ['-webkit-'];
    if (this.isFirefox()) return ['-moz-'];
    
    return [];
  }
  
  /**
   * Applies browser-specific CSS to an element
   */
  applyBrowserFixes(element: HTMLElement): void {
    if (!this.isBrowser || !element) return;
    
    // Safari and iOS fixes for transform-origin
    if (this.requiresTransformOriginFix()) {
      element.style.webkitTransformOrigin = 'left top';
    }
    
    // IE fixes for flex
    if (this.isIE()) {
      // Use standard flexDirection property instead of vendor-prefixed version
      element.style.flexDirection = 'column';
    }
  }
}