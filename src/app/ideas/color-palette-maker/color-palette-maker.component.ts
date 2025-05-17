import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorPaletteService, Color, ColorPalette, PaletteType } from '../../services/color-palette.service';
import { ColorWheelComponent } from '../../components/color-wheel/color-wheel.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-color-palette-maker',
  standalone: true,
  imports: [CommonModule, FormsModule, ColorWheelComponent],
  templateUrl: './color-palette-maker.component.html',
  styleUrl: './color-palette-maker.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('{{duration}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ], { params: { duration: 300 } }),
      transition(':leave', [
        animate('{{duration}}ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ], { params: { duration: 300 } })
    ]),
    trigger('expandCollapse', [
      transition(':enter', [
        style({ opacity: 0, height: '0px', overflow: 'hidden' }),
        animate('{{duration}}ms ease-out', style({ opacity: 1, height: '*' }))
      ], { params: { duration: 300 } }),
      transition(':leave', [
        style({ opacity: 1, height: '*', overflow: 'hidden' }),
        animate('{{duration}}ms ease-in', style({ opacity: 0, height: '0px' }))
      ], { params: { duration: 300 } })
    ])
  ]
})
export class ColorPaletteMakerComponent implements OnInit, OnDestroy {
  // Available palette types
  paletteTypes: { id: PaletteType, name: string, description: string }[] = [
    { id: 'monochromatic', name: 'Monochromatic', description: 'Shades of a single color' },
    { id: 'analogous', name: 'Analogous', description: 'Adjacent colors on the color wheel' },
    { id: 'complementary', name: 'Complementary', description: 'Opposite colors on the color wheel' },
    { id: 'triadic', name: 'Triadic', description: 'Three colors evenly spaced on the color wheel' },
    { id: 'tetradic', name: 'Tetradic', description: 'Four colors forming a rectangle on the color wheel' },
    { id: 'random', name: 'Random', description: 'Completely random colors' },
  ];  // Component state
  selectedType: PaletteType = 'random';
  currentPalette: Color[] = [];
  paletteHexColors: string[] = [];
  baseColor: string = '';
  paletteName: string = '';
  savedPalettes: ColorPalette[] = [];  showSavedPalettes: boolean = false;
  isMobile: boolean = false;
  isTablet: boolean = false;
  isTinyScreen: boolean = false;
  touchEnabled: boolean = false;
  copySuccess: boolean = false;
  saveSuccess: boolean = false;
  isLoading: boolean = false;
  activeColorIndex: number = -1;
  resizeTimeout: any;
  copyTimeout: any;
  saveTimeout: any;
  loadingTimeout: any;
  
  // Touch gesture properties
  touchStartX: number = 0;
  touchEndX: number = 0;
  constructor(private colorService: ColorPaletteService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.checkDeviceSize();
    this.detectTouchSupport();
    this.loadSavedPalettes();
    this.generateNewPalette();
  }
  ngOnDestroy(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.checkDeviceSize();
    }, 250);
  }
  checkDeviceSize(): void {
    this.isMobile = window.innerWidth < 768;
    this.isTablet = window.innerWidth >= 768 && window.innerWidth < 992;
    this.isTinyScreen = window.innerWidth <= 350;
  }
  
  detectTouchSupport(): void {
    this.touchEnabled = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      (navigator as any).msMaxTouchPoints > 0;
  }
  
  // Handle touch gestures for color cards
  handleTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
  }
  
  handleTouchEnd(event: TouchEvent, color: Color, index: number): void {
    this.touchEndX = event.changedTouches[0].clientX;
    const diff = this.touchStartX - this.touchEndX;
    
    // If it's a proper swipe (more than 50px) and not just a tap
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - generate new palette
        this.generateNewPalette();
      } else {
        // Swipe right - copy color
        this.copyColor(color, index);
      }
    }
  }  // Generate a new color palette
  generateNewPalette(): void {
    // Show loading state briefly for better UX feedback
    this.isLoading = true;
    
    // Small timeout to allow UI to update before heavy computation
    this.loadingTimeout = setTimeout(() => {
      this.currentPalette = this.colorService.generatePalette(this.selectedType, this.baseColor || undefined);
      this.updatePaletteHexColors();
      this.isLoading = false;
    }, this.isTinyScreen ? 150 : this.isMobile ? 100 : 0); // Longer delay for tiny screens for better UX
  }
  
  // Update hex colors array for the color wheel component
  private updatePaletteHexColors(): void {
    this.paletteHexColors = this.currentPalette.map(color => color.hex);
  }

  // Select a palette type
  selectPaletteType(type: PaletteType): void {
    this.selectedType = type;
    this.generateNewPalette();
  }
  // Handle base color change
  onBaseColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.baseColor = input.value;
    this.generateNewPalette();
  }
  
  // Randomize the base color
  randomizeBaseColor(): void {
    this.baseColor = this.colorService.generateRandomColor();
    this.generateNewPalette();
  }

  // Save current palette
  savePalette(): void {
    if (!this.paletteName) {
      this.paletteName = `Palette ${new Date().toLocaleDateString()}`;
    }

    const palette: ColorPalette = {
      id: 'palette_' + Date.now(),
      name: this.paletteName,
      colors: [...this.currentPalette],
      createdAt: Date.now()
    };

    this.colorService.savePalette(palette);
    this.loadSavedPalettes();
    this.paletteName = '';
    
    this.saveSuccess = true;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSuccess = false;
    }, 2000);
  }

  // Load saved palettes
  loadSavedPalettes(): void {
    this.savedPalettes = this.colorService.getSavedPalettes();
  }

  // Delete a saved palette
  deletePalette(id: string): void {
    this.colorService.deletePalette(id);
    this.loadSavedPalettes();
  }  // Load a saved palette
  loadPalette(palette: ColorPalette): void {
    this.currentPalette = [...palette.colors];
    this.paletteName = palette.name;
    this.updatePaletteHexColors();
    
    // Scroll to the top of the palette display for better UX
    if (this.isMobile) {
      setTimeout(() => {
        const paletteDisplay = this.elementRef.nativeElement.querySelector('.colors-display');
        if (paletteDisplay) {
          paletteDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  // Toggle display of saved palettes
  toggleSavedPalettes(): void {
    this.showSavedPalettes = !this.showSavedPalettes;
  }
  // Copy color to clipboard
  copyColor(color: Color, index: number): void {
    navigator.clipboard.writeText(color.hex).then(() => {
      this.activeColorIndex = index;
      this.copySuccess = true;
      
      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }
      
      // Shorter timeout on mobile for better experience
      const timeout = this.isMobile ? 1000 : 1500;
      
      this.copyTimeout = setTimeout(() => {
        this.copySuccess = false;
        this.activeColorIndex = -1;
      }, timeout);
    });
  }

  // Check if text should be light or dark based on background color
  isLightText(hex: string): boolean {
    return !this.colorService.isLightColor(hex);
  }

  // Format date for display
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
}
