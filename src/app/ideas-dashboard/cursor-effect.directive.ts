import { Directive, ElementRef, HostListener, Renderer2, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appCursorEffect]',
  standalone: true
})
export class CursorEffectDirective implements OnInit {
  private cursorFollower: HTMLElement | null = null;
  private glowEffect: HTMLElement | null = null;
  private rect: DOMRect | null = null;
  private isMobile: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;
  private animationFrameId: number | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // Check if we're on a mobile device
    this.isMobile = window.innerWidth <= 768 || 
                  ('ontouchstart' in window) ||
                  (navigator.maxTouchPoints > 0);
  }
  ngOnInit() {
    // Don't apply cursor effects on mobile
    if (this.isMobile) {
      // Just add a simple hover effect instead
      this.addMobileHoverEffect();
      return;
    }
    
    // For desktop, apply the full cursor effect
    // Get the element's bounding rectangle
    this.rect = this.el.nativeElement.getBoundingClientRect();
    // Hide default cursor on the element and all child elements
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'none');
    
    // Apply cursor:none to all focusable elements within the container
    const focusableElements = this.el.nativeElement.querySelectorAll('button, a, input, select, textarea, [tabindex]');
    focusableElements.forEach((element: HTMLElement) => {
      this.renderer.setStyle(element, 'cursor', 'none');
    });
    
    // Create the cursor follower element with a visible cursor point at center
    this.cursorFollower = this.renderer.createElement('div');
    this.renderer.addClass(this.cursorFollower, 'cursor-follower');
    this.renderer.setStyle(this.cursorFollower, 'position', 'fixed');  // Use fixed position for better tracking
    this.renderer.setStyle(this.cursorFollower, 'width', '30px');
    this.renderer.setStyle(this.cursorFollower, 'height', '30px');
    this.renderer.setStyle(this.cursorFollower, 'border-radius', '50%');
    this.renderer.setStyle(this.cursorFollower, 'background', 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)');
    this.renderer.setStyle(this.cursorFollower, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(this.cursorFollower, 'pointer-events', 'none'); // Prevents interference with clicks
    this.renderer.setStyle(this.cursorFollower, 'z-index', '9999');
    this.renderer.setStyle(this.cursorFollower, 'opacity', '0');
    this.renderer.setStyle(this.cursorFollower, 'transition', 'opacity 0.15s ease, width 0.2s ease, height 0.2s ease');
    this.renderer.setStyle(this.cursorFollower, 'will-change', 'left, top'); // Performance optimization for animation
    
    // Add a small dot in the center to precisely align with the actual cursor position
    const cursorDot = this.renderer.createElement('div');
    this.renderer.setStyle(cursorDot, 'position', 'absolute');
    this.renderer.setStyle(cursorDot, 'top', '50%');
    this.renderer.setStyle(cursorDot, 'left', '50%');
    this.renderer.setStyle(cursorDot, 'width', '3px'); // Smaller for better precision
    this.renderer.setStyle(cursorDot, 'height', '3px');
    this.renderer.setStyle(cursorDot, 'background-color', 'rgba(139, 92, 246, 1)'); // More visible
    this.renderer.setStyle(cursorDot, 'border-radius', '50%');
    this.renderer.setStyle(cursorDot, 'transform', 'translate(-50%, -50%)');
    this.renderer.appendChild(this.cursorFollower, cursorDot);
    
    // Create the glow effect
    this.glowEffect = this.renderer.createElement('div');
    this.renderer.addClass(this.glowEffect, 'glow-effect');
    this.renderer.setStyle(this.glowEffect, 'position', 'absolute');
    this.renderer.setStyle(this.glowEffect, 'pointer-events', 'none');
    this.renderer.setStyle(this.glowEffect, 'z-index', '1');
    this.renderer.setStyle(this.glowEffect, 'width', '100%');
    this.renderer.setStyle(this.glowEffect, 'height', '100%');
    this.renderer.setStyle(this.glowEffect, 'top', '0');
    this.renderer.setStyle(this.glowEffect, 'left', '0');
    this.renderer.setStyle(this.glowEffect, 'opacity', '0');
    this.renderer.setStyle(this.glowEffect, 'transition', 'opacity 0.5s ease');
    this.renderer.setStyle(this.glowEffect, 'background', 'radial-gradient(circle 100px at var(--x) var(--y), rgba(139, 92, 246, 0.15), transparent 40%)');
    
    // Add the glow effect to the host element
    this.renderer.appendChild(this.el.nativeElement, this.glowEffect);
    
    // Add the cursor follower to the body
    this.renderer.appendChild(document.body, this.cursorFollower);
  }

  // Add a simpler effect for mobile devices
  private addMobileHoverEffect() {
    // Create a touch-based glow effect for mobile
    this.glowEffect = this.renderer.createElement('div');
    this.renderer.addClass(this.glowEffect, 'mobile-glow-effect');
    this.renderer.setStyle(this.glowEffect, 'position', 'absolute');
    this.renderer.setStyle(this.glowEffect, 'pointer-events', 'none');
    this.renderer.setStyle(this.glowEffect, 'z-index', '1');
    this.renderer.setStyle(this.glowEffect, 'width', '100%');
    this.renderer.setStyle(this.glowEffect, 'height', '100%');
    this.renderer.setStyle(this.glowEffect, 'top', '0');
    this.renderer.setStyle(this.glowEffect, 'left', '0');
    this.renderer.setStyle(this.glowEffect, 'opacity', '0');
    this.renderer.setStyle(this.glowEffect, 'transition', 'opacity 0.3s ease');
    this.renderer.setStyle(this.glowEffect, 'background', 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15), transparent 70%)');
    
    // Add the glow effect to the host element
    this.renderer.appendChild(this.el.nativeElement, this.glowEffect);
    
    // Add touch event listeners
    this.el.nativeElement.addEventListener('touchstart', () => {
      if (this.glowEffect) {
        this.renderer.setStyle(this.glowEffect, 'opacity', '1');
      }
    });
    
    this.el.nativeElement.addEventListener('touchend', () => {
      if (this.glowEffect) {
        this.renderer.setStyle(this.glowEffect, 'opacity', '0');
      }
    });
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    if (this.isMobile) return;

    // Get the accurate cursor position from the event
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    
    // Update cursor position immediately to avoid jump
    if (this.cursorFollower) {
      // First set position without animation to avoid jumps
      this.renderer.setStyle(this.cursorFollower, 'transition', 'none');
      this.renderer.setStyle(this.cursorFollower, 'left', `${event.clientX}px`);
      this.renderer.setStyle(this.cursorFollower, 'top', `${event.clientY}px`);
      
      // Force a reflow to make the position take effect immediately
      void this.cursorFollower.offsetWidth;
      
      // Then restore the transitions and apply the enter state
      this.renderer.setStyle(this.cursorFollower, 'transition', 'opacity 0.15s ease, width 0.2s ease, height 0.2s ease');
      this.renderer.setStyle(this.cursorFollower, 'opacity', '1');
      this.renderer.setStyle(this.cursorFollower, 'width', '40px');
      this.renderer.setStyle(this.cursorFollower, 'height', '40px');
      
      // Mark the element type for specific cursor behaviors
      const isButton = this.el.nativeElement.tagName === 'BUTTON' || 
                      this.el.nativeElement.closest('button') ||
                      this.el.nativeElement.classList.contains('btn') ||
                      this.el.nativeElement.querySelector('button');
      
      if (isButton) {
        // Create a "clickable" cursor effect for buttons
        this.renderer.setStyle(this.cursorFollower, 'border', '2px solid rgba(139, 92, 246, 0.5)');
        this.renderer.setStyle(this.cursorFollower, 'background', 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0) 70%)');
      }
    }
    
    if (this.glowEffect) {
      this.renderer.setStyle(this.glowEffect, 'opacity', '1');
    }
    
    // Make sure underlying element and its children hide the cursor
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'none');
    const allElements = this.el.nativeElement.querySelectorAll('*');
    allElements.forEach((element: HTMLElement) => {
      this.renderer.setStyle(element, 'cursor', 'none');
    });
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    if (this.isMobile) return;

    // Update the last position when leaving
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    
    if (this.cursorFollower) {
      // Keep the follower at the exit position
      this.renderer.setStyle(this.cursorFollower, 'left', `${event.clientX}px`);
      this.renderer.setStyle(this.cursorFollower, 'top', `${event.clientY}px`);
      this.renderer.setStyle(this.cursorFollower, 'opacity', '0');
      this.renderer.setStyle(this.cursorFollower, 'width', '30px');
      this.renderer.setStyle(this.cursorFollower, 'height', '30px');
      
      // Remove any specific styling from enter events
      this.renderer.removeStyle(this.cursorFollower, 'border');
      this.renderer.setStyle(this.cursorFollower, 'background', 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)');
    }
    
    if (this.glowEffect) {
      this.renderer.setStyle(this.glowEffect, 'opacity', '0');
    }
    
    // For elements outside of our components, we need to restore the default cursor
    this.renderer.removeStyle(this.el.nativeElement, 'cursor');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isMobile) return;
    
    // Update the last known position
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    
    // Use a single RAF for better performance
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(() => this.updateCursorPosition());
    }
    
    // Update the element's bounding rectangle on movement to ensure accuracy
    // especially important when scrolling or resizing
    this.rect = this.el.nativeElement.getBoundingClientRect();
    
    if (this.glowEffect && this.rect) {
      const x = event.clientX - this.rect.left;
      const y = event.clientY - this.rect.top;
      this.renderer.setStyle(this.glowEffect, 'background', `radial-gradient(circle 100px at ${x}px ${y}px, rgba(139, 92, 246, 0.15), transparent 40%)`);
    }
  }
  
  // Separate method for cursor position updates to optimize performance
  private updateCursorPosition(): void {
    if (this.cursorFollower) {
      // Apply position with zero delay
      this.renderer.setStyle(this.cursorFollower, 'left', `${this.lastX}px`);
      this.renderer.setStyle(this.cursorFollower, 'top', `${this.lastY}px`);
      
      // Allow subsequent animation frames
      this.animationFrameId = null;
    }
  }
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.isMobile) return;

    if (this.cursorFollower) {
      // First shrink the cursor follower for click feedback
      if (this.cursorFollower) {
        // Remember current size for restoration
        const currentWidth = this.cursorFollower.style.width;
        const currentHeight = this.cursorFollower.style.height;
        
        // Quick shrink animation
        this.renderer.setStyle(this.cursorFollower, 'width', '20px');
        this.renderer.setStyle(this.cursorFollower, 'height', '20px');
        this.renderer.setStyle(this.cursorFollower, 'opacity', '0.8');
        
        // Restore after a short delay
        setTimeout(() => {
          if (this.cursorFollower) {
            this.renderer.setStyle(this.cursorFollower, 'width', currentWidth);
            this.renderer.setStyle(this.cursorFollower, 'height', currentHeight);
            this.renderer.setStyle(this.cursorFollower, 'opacity', '1');
          }
        }, 150);
      }
    
      // Create improved ripple effect with precise positioning
      const ripple = this.renderer.createElement('div');
      this.renderer.addClass(ripple, 'ripple');
      this.renderer.setStyle(ripple, 'position', 'fixed'); // Use fixed for better positioning
      this.renderer.setStyle(ripple, 'border-radius', '50%');
      this.renderer.setStyle(ripple, 'background', 'rgba(139, 92, 246, 0.3)');
      this.renderer.setStyle(ripple, 'transform', 'translate(-50%, -50%)');
      this.renderer.setStyle(ripple, 'pointer-events', 'none');
      this.renderer.setStyle(ripple, 'z-index', '9998');
      this.renderer.setStyle(ripple, 'left', `${this.lastX}px`); // Use tracked position for precision
      this.renderer.setStyle(ripple, 'top', `${this.lastY}px`);
      this.renderer.setStyle(ripple, 'width', '0');
      this.renderer.setStyle(ripple, 'height', '0');
      this.renderer.setStyle(ripple, 'will-change', 'width, height, opacity');
      
      // Add ripple to the body
      this.renderer.appendChild(document.body, ripple);
      
      // Animate ripple with smoother easing
      requestAnimationFrame(() => {
        this.renderer.setStyle(ripple, 'width', '200px');
        this.renderer.setStyle(ripple, 'height', '200px');
        this.renderer.setStyle(ripple, 'opacity', '0');
        this.renderer.setStyle(ripple, 'transition', 'width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.6s ease-out');
      });
      
      // Remove ripple
      setTimeout(() => {
        if (document.body.contains(ripple)) {
          this.renderer.removeChild(document.body, ripple);
        }
      }, 600);
    }
  }

  ngOnDestroy() {
    // Clean up the cursor follower when the directive is destroyed
    if (this.cursorFollower && document.body.contains(this.cursorFollower)) {
      this.renderer.removeChild(document.body, this.cursorFollower);
    }
    if (this.glowEffect && this.el.nativeElement.contains(this.glowEffect)) {
      this.renderer.removeChild(this.el.nativeElement, this.glowEffect);
    }
    
    // Remove touch event listeners if on mobile
    if (this.isMobile) {
      this.el.nativeElement.removeEventListener('touchstart', () => {});
      this.el.nativeElement.removeEventListener('touchend', () => {});
    }
  }
}

