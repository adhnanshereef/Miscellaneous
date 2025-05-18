import { Component, ElementRef, AfterViewInit, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { BaseIdeaDirective } from '../base-idea.directive';
import { CursorEffectDirective } from '../../ideas-dashboard/cursor-effect.directive';
import { CursorEffectUtil } from '../cursor-effect-util';

interface LightingTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  ambientColor: string;
  intensity: number;
  ambientIntensity: number;
  speed: number;
  effect: 'pulse' | 'flicker' | 'rainbow' | 'spot' | 'static';
  description: string;
}

@Component({
  selector: 'app-lighting-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule, CursorEffectDirective],
  templateUrl: './lighting-visualizer.component.html',
  styleUrl: './lighting-visualizer.component.css',
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in')
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class LightingVisualizerComponent extends BaseIdeaDirective implements OnInit, AfterViewInit, OnDestroy {
  // Available themes
  themes: LightingTheme[] = [
    {
      id: 'cozy',
      name: 'Cozy Warm',
      primaryColor: '#ff8c42',
      secondaryColor: '#ffb142',
      ambientColor: '#ffd28c',
      intensity: 0.8,
      ambientIntensity: 0.4,
      speed: 2,
      effect: 'pulse',
      description: 'A warm, cozy lighting setup perfect for living rooms and relaxing spaces.'
    },
    {
      id: 'gaming',
      name: 'Gaming Rig',
      primaryColor: '#ff0057',
      secondaryColor: '#00b0ff',
      ambientColor: '#290742',
      intensity: 1,
      ambientIntensity: 0.3,
      speed: 4,
      effect: 'rainbow',
      description: 'Dynamic RGB lighting optimized for gaming setups and entertainment centers.'
    },
    {
      id: 'focus',
      name: 'Productivity',
      primaryColor: '#4fc3f7',
      secondaryColor: '#b3e5fc',
      ambientColor: '#f5f5f5',
      intensity: 0.9,
      ambientIntensity: 0.6,
      speed: 0,
      effect: 'static',
      description: 'Clean, crisp lighting designed for focus and productivity in work environments.'
    },
    {
      id: 'nightclub',
      name: 'Nightclub',
      primaryColor: '#d600ff',
      secondaryColor: '#00ffcc',
      ambientColor: '#120024',
      intensity: 1,
      ambientIntensity: 0.2,
      speed: 5,
      effect: 'spot',
      description: 'Vibrant, high-energy lighting effects reminiscent of nightclubs and dance venues.'
    },
    {
      id: 'cinema',
      name: 'Cinema Mode',
      primaryColor: '#311b92',
      secondaryColor: '#b39ddb',
      ambientColor: '#1a1a1a',
      intensity: 0.6,
      ambientIntensity: 0.1,
      speed: 1,
      effect: 'flicker',
      description: 'Subtle, atmospheric lighting perfect for home theaters and movie watching.'
    }
  ];
  
  // UI state
  selectedTheme: LightingTheme;
  isCustomizing: boolean = false;
  customTheme: LightingTheme;
  previewRoom: 'living-room' | 'bedroom' | 'office' | 'gaming' = 'living-room';
  isFullscreen: boolean = false;
  
  // Animation properties
  animationFrameId: number | null = null;
  lightElements: HTMLElement[] = [];
  isMobile: boolean = false;
  
  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    super(elementRef);
    this.selectedTheme = this.themes[0];
    this.customTheme = { ...this.selectedTheme };
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
    this.checkDeviceSize();
    window.addEventListener('resize', this.checkDeviceSize.bind(this));
  }
  
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    
    // Ensure cursor effects are applied
    setTimeout(() => {
      this.initLightElements();
      this.startLightAnimation();
      
      // Apply cursor effects to interactive elements
      CursorEffectUtil.applyToInteractiveElements(
        this.elementRef!, 
        this.renderer, 
        'button, .light-control, .theme-card, .room-option, select, input[type="range"], .color-picker'
      );
    });
  }
  
  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.checkDeviceSize.bind(this));
  }
  
  protected override refreshCursorEffects(): void {
    // Call the parent method first
    super.refreshCursorEffects();
    
    if (!this.elementRef || !this.elementRef.nativeElement) return;
    
    // Find all interactive elements
    const interactiveElements = this.elementRef.nativeElement.querySelectorAll(
      'button, a, input, select, [role="button"], [tabindex], .card, .interactive, .light-control, .theme-card, .room-option'
    );
    
    // Apply cursor:none to all interactive elements
    interactiveElements.forEach((element: Element) => {
      if (element instanceof HTMLElement) {
        this.renderer.setStyle(element, 'cursor', 'none');
      }
    });
  }
  
  checkDeviceSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }
  
  selectTheme(theme: LightingTheme): void {
    this.selectedTheme = theme;
    this.customTheme = { ...theme };
    
    // Restart animation with new theme
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.startLightAnimation();
  }
  
  startCustomizing(): void {
    this.isCustomizing = true;
    this.customTheme = { ...this.selectedTheme };
  }
  
  saveCustomTheme(): void {
    // Find if a theme with this id already exists
    const existingIndex = this.themes.findIndex(t => t.id === this.customTheme.id);
    
    if (existingIndex >= 0) {
      // Update existing theme
      this.themes[existingIndex] = { ...this.customTheme };
      this.selectedTheme = this.themes[existingIndex];
    } else {
      // Add new theme
      this.customTheme.id = `custom-${Date.now()}`;
      this.themes.push({ ...this.customTheme });
      this.selectedTheme = this.themes[this.themes.length - 1];
    }
    
    this.isCustomizing = false;
    
    // Restart animation
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.startLightAnimation();
  }
  
  cancelCustomizing(): void {
    this.isCustomizing = false;
    this.customTheme = { ...this.selectedTheme };
  }
  
  changeRoom(room: 'living-room' | 'bedroom' | 'office' | 'gaming'): void {
    this.previewRoom = room;
    
    // Reinitialize light elements for the new room
    setTimeout(() => {
      this.initLightElements();
      this.startLightAnimation();
    });
  }
  
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    
    // Reinitialize light elements for the new size
    setTimeout(() => {
      this.initLightElements();
      this.startLightAnimation();
    });
  }
  
  private initLightElements(): void {
    if (!this.elementRef || !this.elementRef.nativeElement) return;
    
    // Find light elements in the room
    const room = this.elementRef.nativeElement.querySelector('.room-preview');
    if (!room) return;
    
    this.lightElements = Array.from(room.querySelectorAll('.light-source'));
  }
  
  private startLightAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    let startTime = performance.now();
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const theme = this.selectedTheme;
      
      // Apply different animations based on theme effect
      this.lightElements.forEach((element, index) => {
        if (theme.effect === 'static') {
          this.renderer.setStyle(element, 'box-shadow', `0 0 ${theme.intensity * 50}px ${theme.intensity * 30}px ${theme.primaryColor}`);
        } 
        else if (theme.effect === 'pulse') {
          const intensity = theme.intensity * (0.7 + 0.3 * Math.sin(elapsed * 0.001 * theme.speed));
          this.renderer.setStyle(element, 'box-shadow', `0 0 ${intensity * 50}px ${intensity * 30}px ${theme.primaryColor}`);
        }
        else if (theme.effect === 'flicker') {
          const flicker = Math.random() * 0.2 + 0.8;
          const intensity = theme.intensity * flicker;
          this.renderer.setStyle(element, 'box-shadow', `0 0 ${intensity * 50}px ${intensity * 30}px ${theme.primaryColor}`);
        }
        else if (theme.effect === 'rainbow') {
          const hue = (elapsed * 0.05 * theme.speed + index * 30) % 360;
          const color = `hsl(${hue}, 100%, 50%)`;
          this.renderer.setStyle(element, 'box-shadow', `0 0 ${theme.intensity * 50}px ${theme.intensity * 30}px ${color}`);
        }
        else if (theme.effect === 'spot') {
          const angle = (elapsed * 0.001 * theme.speed + index * Math.PI/4) % (Math.PI * 2);
          const x = Math.cos(angle) * 20;
          const y = Math.sin(angle) * 20;
          this.renderer.setStyle(element, 'box-shadow', `${x}px ${y}px ${theme.intensity * 50}px ${theme.intensity * 30}px ${theme.primaryColor}`);
        }
      });
      
      // Update ambient light
      const roomElement = this.elementRef?.nativeElement.querySelector('.room-preview');
      if (roomElement) {
        if (theme.effect === 'rainbow') {
          const hue = (elapsed * 0.02 * theme.speed) % 360;
          const ambientColor = `hsla(${hue}, 70%, 30%, ${theme.ambientIntensity})`;
          this.renderer.setStyle(roomElement, 'background-color', ambientColor);
        } else {
          this.renderer.setStyle(roomElement, 'background-color', theme.ambientColor);
          this.renderer.setStyle(roomElement, 'opacity', theme.ambientIntensity.toString());
        }
      }
      
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }
}
