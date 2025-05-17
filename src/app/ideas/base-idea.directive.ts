import { Directive, ElementRef, OnInit, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { CursorEffectDirective } from '../ideas-dashboard/cursor-effect.directive';
import { CursorEffectUtil } from './cursor-effect-util';

/**
 * Base class to be extended by all idea components
 * Ensures consistent cursor effect implementation across all components
 * 
 * Usage:
 * 1. Extend this class in your component
 * 2. Add CursorEffectDirective to your component's imports
 * 3. Add appCursorEffect attribute to interactive elements in HTML
 * 4. Implement ngAfterViewInit if not already calling super.ngAfterViewInit()
 */
@Directive({
  standalone: true,
})
export class BaseIdeaDirective implements OnInit, AfterViewInit {
  @ViewChildren(CursorEffectDirective) cursorEffects!: QueryList<CursorEffectDirective>;
  
  // Utility instance for cursor effects
  protected cursorEffectUtil: CursorEffectUtil = new CursorEffectUtil();
  
  constructor(protected elementRef?: ElementRef) {}
  
  ngOnInit(): void {
    // Hide cursor on the whole component
    if (this.elementRef && this.elementRef.nativeElement) {
      this.elementRef.nativeElement.style.cursor = 'none';
    }
  }
  
  ngAfterViewInit(): void {
    // Set up cursor effects after the view is initialized
    setTimeout(() => {
      this.refreshCursorEffects();
      
      // Subscribe to cursor effects changes (when elements are added/removed dynamically)
      if (this.cursorEffects) {
        this.cursorEffects.changes.subscribe(() => {
          this.refreshCursorEffects();
        });
      }
    });
  }
  
  /**
   * Refreshes and synchronizes cursor effects across the component
   * Called after view init and when dynamic content changes
   */
  protected refreshCursorEffects(): void {
    if (!this.elementRef || !this.elementRef.nativeElement) return;
    
    // Find all interactive elements that should have cursor effects
    const interactiveElements = this.elementRef.nativeElement.querySelectorAll(
      'button, a, input, select, [role="button"], [tabindex], .card, .interactive'
    );
    
    // Apply cursor:none to all interactive elements
    interactiveElements.forEach((element: Element) => {
      if (element instanceof HTMLElement && !element.hasAttribute('appCursorEffect')) {
        element.style.cursor = 'none';
      }
    });
  }
}
