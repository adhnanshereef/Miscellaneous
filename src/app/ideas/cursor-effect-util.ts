import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { CursorEffectDirective } from '../ideas-dashboard/cursor-effect.directive';

/**
 * A utility service for applying cursor effects consistently across components
 */
export class CursorEffectUtil {
  /**
   * Applies the cursor effect to all interactive elements within a component
   * @param elementRef The component's ElementRef
   * @param renderer The Renderer2 instance
   * @param selector Optional CSS selector to target specific elements (default: buttons and clickable elements)
   */
  static applyToInteractiveElements(
    elementRef: ElementRef, 
    renderer: Renderer2, 
    selector: string = 'button, .card, .interactive, [role="button"]'
  ): void {
    // Wait for DOM to be ready
    setTimeout(() => {
      // Find all interactive elements
      const elements = elementRef.nativeElement.querySelectorAll(selector);
      
      // Add the appCursorEffect attribute to each element
      elements.forEach((element: HTMLElement) => {
        renderer.setAttribute(element, 'appCursorEffect', '');
      });
      
      console.log(`Cursor effect applied to ${elements.length} interactive elements`);
    }, 0);
  }
  
  /**
   * Applies cursor:none to an element and all its children 
   * @param element The HTML element to apply cursor:none to
   * @param applyToChildren Whether to apply to all child elements
   */
  applyCursorNone(element: HTMLElement, applyToChildren = true): void {
    element.style.cursor = 'none';
    
    if (applyToChildren) {
      const children = element.querySelectorAll('*');
      children.forEach((child) => {
        if (child instanceof HTMLElement) {
          child.style.cursor = 'none';
        }
      });
    }
  }
  
  /**
   * Adds cursor position tracking for custom cursor effects
   * @param element The container element
   * @param cursorElement The custom cursor element
   */
  addCursorTracking(element: HTMLElement, cursorElement: HTMLElement): () => void {
    let animFrameId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    
    const updateCursorPosition = () => {
      cursorElement.style.left = `${lastX}px`;
      cursorElement.style.top = `${lastY}px`;
      animFrameId = null;
    };
    
    const mouseMoveHandler = (event: MouseEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
      
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(updateCursorPosition);
      }
    };
    
    // Add event listener
    element.addEventListener('mousemove', mouseMoveHandler);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('mousemove', mouseMoveHandler);
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }
  
  /**
   * Creates a custom cursor element with a central dot
   * @param size The size of the cursor in pixels
   * @param color The color of the cursor (in hex, rgb, etc)
   * @returns The created cursor element
   */
  createCursorElement(size = 30, color = 'rgba(139, 92, 246, 0.4)'): HTMLElement {
    const cursorFollower = document.createElement('div');
    
    // Set base styles
    cursorFollower.classList.add('custom-cursor-follower');
    cursorFollower.style.position = 'fixed';
    cursorFollower.style.width = `${size}px`;
    cursorFollower.style.height = `${size}px`;
    cursorFollower.style.borderRadius = '50%';
    cursorFollower.style.background = `radial-gradient(circle, ${color} 0%, rgba(139, 92, 246, 0) 70%)`;
    cursorFollower.style.transform = 'translate(-50%, -50%)';
    cursorFollower.style.pointerEvents = 'none';
    cursorFollower.style.zIndex = '9999';
    cursorFollower.style.opacity = '0';
    cursorFollower.style.transition = 'opacity 0.15s ease, width 0.2s ease, height 0.2s ease';
    cursorFollower.style.willChange = 'left, top';
    
    // Add the center dot for precise alignment
    const cursorDot = document.createElement('div');
    cursorDot.style.position = 'absolute';
    cursorDot.style.top = '50%';
    cursorDot.style.left = '50%';
    cursorDot.style.width = '3px';
    cursorDot.style.height = '3px';
    cursorDot.style.backgroundColor = 'rgba(139, 92, 246, 1)';
    cursorDot.style.borderRadius = '50%';
    cursorDot.style.transform = 'translate(-50%, -50%)';
    
    cursorFollower.appendChild(cursorDot);
    
    return cursorFollower;
  }
  
  /**
   * Helper function to check if element already has cursor effect applied
   * @param element The element to check
   */
  hasCustomCursor(element: HTMLElement): boolean {
    return element.hasAttribute('appCursorEffect') || 
           element.style.cursor === 'none' ||
           element.classList.contains('has-custom-cursor');
  }
}

/**
 * A base class that all idea components can extend to get cursor effect functionality
 */
@Directive({
  standalone: true,
})
export class CursorEffectBaseComponent implements OnInit {
  constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {}
  
  ngOnInit(): void {
    // Apply cursor effects to the component
    this.applyCursorEffects();
  }
  
  /**
   * Apply cursor effects to interactive elements in the component
   * Override this method in child classes for custom selector behavior
   */
  protected applyCursorEffects(selector?: string): void {
    CursorEffectUtil.applyToInteractiveElements(this.elementRef, this.renderer, selector);
  }
}
