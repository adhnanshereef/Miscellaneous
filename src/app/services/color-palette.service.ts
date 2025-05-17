import { Injectable } from '@angular/core';

export interface Color {
  hex: string;
  rgb: string;
  name?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: Color[];
  createdAt: number;
}

export type PaletteType = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'random';

@Injectable({
  providedIn: 'root'
})
export class ColorPaletteService {
  private savedPalettes: ColorPalette[] = [];

  constructor() { 
    this.loadSavedPalettes();
  }

  // Generate a random color in hex format
  generateRandomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

  // Convert hex to RGB
  hexToRgb(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  // Convert RGB to hex
  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // Get RGB string from hex
  getRgbString(hex: string): string {
    const { r, g, b } = this.hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Calculate brightness of a color (0-255)
  getBrightness(hex: string): number {
    const { r, g, b } = this.hexToRgb(hex);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  // Check if a color is light or dark
  isLightColor(hex: string): boolean {
    return this.getBrightness(hex) > 128;
  }

  // Generate a palette based on the type and base color
  generatePalette(type: PaletteType, baseColor?: string): Color[] {
    const colors: Color[] = [];
    const baseHex = baseColor || this.generateRandomColor();
    
    switch(type) {
      case 'monochromatic':
        colors.push(...this.generateMonochromaticPalette(baseHex));
        break;
      case 'analogous':
        colors.push(...this.generateAnalogousPalette(baseHex));
        break;
      case 'complementary':
        colors.push(...this.generateComplementaryPalette(baseHex));
        break;
      case 'triadic':
        colors.push(...this.generateTriadicPalette(baseHex));
        break;
      case 'tetradic':
        colors.push(...this.generateTetradicPalette(baseHex));
        break;
      case 'random':
      default:
        colors.push(...this.generateRandomPalette());
        break;
    }
    
    return colors;
  }

  // Generate a random palette with 5 colors
  private generateRandomPalette(): Color[] {
    const colors: Color[] = [];
    for (let i = 0; i < 5; i++) {
      const hex = this.generateRandomColor();
      colors.push({
        hex,
        rgb: this.getRgbString(hex)
      });
    }
    return colors;
  }

  // Generate a monochromatic palette (same hue, different saturation/lightness)
  private generateMonochromaticPalette(baseHex: string): Color[] {
    const { h, s, l } = this.hexToHsl(baseHex);
    const colors: Color[] = [];
    
    // Generate 5 colors with different lightness values
    for (let i = 0; i < 5; i++) {
      // Adjust lightness while keeping the same hue
      const newL = Math.max(0.1, Math.min(0.9, 0.2 + (i * 0.15)));
      const hex = this.hslToHex(h, s, newL);
      colors.push({
        hex,
        rgb: this.getRgbString(hex)
      });
    }
    
    return colors;
  }

  // Generate an analogous palette (adjacent colors on the color wheel)
  private generateAnalogousPalette(baseHex: string): Color[] {
    const { h, s, l } = this.hexToHsl(baseHex);
    const colors: Color[] = [];
    
    // Generate 5 colors with hues spaced around the base hue
    for (let i = 0; i < 5; i++) {
      // Adjust the hue by -40, -20, 0, +20, +40 degrees
      const hueAdjust = (i - 2) * 20;
      let newH = (h + hueAdjust) % 360;
      if (newH < 0) newH += 360;
      
      const hex = this.hslToHex(newH, s, l);
      colors.push({
        hex,
        rgb: this.getRgbString(hex)
      });
    }
    
    return colors;
  }

  // Generate a complementary palette (opposite hues)
  private generateComplementaryPalette(baseHex: string): Color[] {
    const { h, s, l } = this.hexToHsl(baseHex);
    const colors: Color[] = [];
    
    // Base color
    colors.push({
      hex: baseHex,
      rgb: this.getRgbString(baseHex)
    });
    
    // Complementary color (opposite on the color wheel)
    const complementaryH = (h + 180) % 360;
    const complementaryHex = this.hslToHex(complementaryH, s, l);
    colors.push({
      hex: complementaryHex,
      rgb: this.getRgbString(complementaryHex)
    });
    
    // Add variations of both colors
    colors.push({
      hex: this.hslToHex(h, s * 0.7, l * 1.2),
      rgb: this.getRgbString(this.hslToHex(h, s * 0.7, l * 1.2))
    });
    
    colors.push({
      hex: this.hslToHex(complementaryH, s * 0.7, l * 1.2),
      rgb: this.getRgbString(this.hslToHex(complementaryH, s * 0.7, l * 1.2))
    });
    
    // Add a neutral color
    colors.push({
      hex: this.hslToHex(h, s * 0.25, l * 0.8),
      rgb: this.getRgbString(this.hslToHex(h, s * 0.25, l * 0.8))
    });
    
    return colors;
  }

  // Generate a triadic palette (three colors evenly spaced on color wheel)
  private generateTriadicPalette(baseHex: string): Color[] {
    const { h, s, l } = this.hexToHsl(baseHex);
    const colors: Color[] = [];
    
    // Generate 3 main triadic colors (120° apart)
    for (let i = 0; i < 3; i++) {
      const newH = (h + i * 120) % 360;
      const hex = this.hslToHex(newH, s, l);
      colors.push({
        hex,
        rgb: this.getRgbString(hex)
      });
    }
    
    // Add two more variations for a 5-color palette
    colors.push({
      hex: this.hslToHex(h, s * 0.7, l * 1.2),
      rgb: this.getRgbString(this.hslToHex(h, s * 0.7, l * 1.2))
    });
    
    colors.push({
      hex: this.hslToHex((h + 240) % 360, s * 0.7, l * 1.2),
      rgb: this.getRgbString(this.hslToHex((h + 240) % 360, s * 0.7, l * 1.2))
    });
    
    return colors;
  }

  // Generate a tetradic palette (four colors forming a rectangle on color wheel)
  private generateTetradicPalette(baseHex: string): Color[] {
    const { h, s, l } = this.hexToHsl(baseHex);
    const colors: Color[] = [];
    
    // Generate 4 tetradic colors (90° apart)
    for (let i = 0; i < 4; i++) {
      const newH = (h + i * 90) % 360;
      const hex = this.hslToHex(newH, s, l);
      colors.push({
        hex,
        rgb: this.getRgbString(hex)
      });
    }
    
    // Add one more variation for a 5-color palette
    colors.push({
      hex: this.hslToHex(h, s * 0.5, l * 0.9),
      rgb: this.getRgbString(this.hslToHex(h, s * 0.5, l * 0.9))
    });
    
    return colors;
  }

  // Convert hex to HSL
  private hexToHsl(hex: string): { h: number, s: number, l: number } {
    const { r, g, b } = this.hexToRgb(hex);
    return this.rgbToHsl(r, g, b);
  }

  // Convert RGB to HSL
  private rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h *= 60;
    }
    
    return { h, s, l };
  }

  // Convert HSL to hex
  private hslToHex(h: number, s: number, l: number): string {
    const { r, g, b } = this.hslToRgb(h, s, l);
    return this.rgbToHex(r, g, b);
  }

  // Convert HSL to RGB
  private hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, (h / 360) + 1/3);
      g = hue2rgb(p, q, h / 360);
      b = hue2rgb(p, q, (h / 360) - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  // Save a color palette
  savePalette(palette: ColorPalette): void {
    this.savedPalettes.push(palette);
    localStorage.setItem('savedPalettes', JSON.stringify(this.savedPalettes));
  }

  // Get all saved palettes
  getSavedPalettes(): ColorPalette[] {
    return this.savedPalettes;
  }

  // Delete a saved palette
  deletePalette(id: string): void {
    this.savedPalettes = this.savedPalettes.filter(p => p.id !== id);
    localStorage.setItem('savedPalettes', JSON.stringify(this.savedPalettes));
  }

  // Load saved palettes from localStorage
  private loadSavedPalettes(): void {
    try {
      const savedData = localStorage.getItem('savedPalettes');
      if (savedData) {
        this.savedPalettes = JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading saved palettes:', error);
      this.savedPalettes = [];
    }
  }
}
