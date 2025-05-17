# Cursor Effect Implementation Guide

This document provides guidelines for implementing the precise cursor effect in idea components.

## Using Cursor Effects in Components

### Step 1: Import the CursorEffectDirective

```typescript
import { CursorEffectDirective } from '../../ideas-dashboard/cursor-effect.directive';
import { CursorEffectUtil } from '../cursor-effect-util';
```

### Step 2: Add to Component Imports and Implement AfterViewInit

```typescript
@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [CommonModule, FormsModule, CursorEffectDirective],
  // other metadata
})
export class YourComponent implements OnInit, AfterViewInit {
  @ViewChildren(CursorEffectDirective) cursorEffects!: QueryList<CursorEffectDirective>;
  
  // Create a utility instance
  private cursorEffectUtil: CursorEffectUtil = new CursorEffectUtil();
  
  // Implement AfterViewInit to apply cursor effects after the view is initialized
  ngAfterViewInit(): void {
    // Refresh cursor effects after the view loads
    setTimeout(() => {
      this.refreshCursorEffects();
    });
  }
  
  // Helper method to ensure cursor effects are applied properly
  private refreshCursorEffects(): void {
    const interactiveElements = document.querySelectorAll(
      '.your-component button, .your-component [role="button"]'
    );
    
    interactiveElements.forEach((element: Element) => {
      if (element instanceof HTMLElement) {
        element.style.cursor = 'none';
      }
    });
  }
}
```

### Step 3: Apply the Directive in the Template

Add the `appCursorEffect` attribute to interactive elements in your template:

```html
<div class="your-container" appCursorEffect>
  <button appCursorEffect>Click Me</button>
  
  <!-- For interactive elements that should have the effect -->
  <div class="card" appCursorEffect>
    <!-- Card content -->
  </div>
</div>
```

### Step 4: Add CSS for Better Cursor Effect Support

Add these styles to your component's CSS:

```css
/* Hide cursor for better custom cursor experience */
:host {
  cursor: none;
}

/* Global cursor hide for all interactive elements in the component */
:host button, 
:host a, 
:host input, 
:host select,
:host [role="button"],
:host [tabindex] {
  cursor: none !important;
}

/* Ensure no pointer events on the cursor dot */
.cursor-follower {
  pointer-events: none !important;
}
```

## Best Practices

1. **Apply to Container Elements**: Add the directive to container elements to ensure the effect works across the entire component area.

2. **Interactive Elements**: Always add to buttons, cards, and other interactive elements.

3. **Don't Over-Apply**: Applying to too many nested elements can cause performance issues or overlapping effects.

4. **Test on Mobile**: The directive has different behavior on mobile devices - make sure it works correctly on both desktop and mobile.

## Troubleshooting

If the cursor effect is not working properly:

1. Verify the directive is imported in the component
2. Check that the directive is added to the imports array
3. Ensure the `appCursorEffect` attribute is applied to elements
4. Check the browser console for any errors

## Implementation for New Components

For new components, consider extending the `BaseIdeaDirective` which already has the cursor effect imported:

```typescript
import { Component } from '@angular/core';
import { BaseIdeaDirective } from '../base-idea.directive';

@Component({
  // component metadata
})
export class YourNewIdeaComponent extends BaseIdeaDirective {
  // component logic
}
```
