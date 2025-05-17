import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursorEffectDirective } from '../../ideas-dashboard/cursor-effect.directive';

@Component({
  selector: 'app-color-wheel',
  standalone: true,
  imports: [CommonModule, CursorEffectDirective],
  templateUrl: './color-wheel.component.html',
  styleUrl: './color-wheel.component.css'
})
export class ColorWheelComponent implements OnChanges, AfterViewInit {
  @Input() baseColor: string = '';
  @Input() paletteType: string = 'monochromatic';
  @Input() colors: string[] = [];
  
  @ViewChild('colorWheel') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private centerX!: number;
  private centerY!: number;
  private radius!: number;
  
  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.drawColorWheel();
    
    if (this.colors.length > 0) {
      this.drawColorPositions();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // Only update if canvas is already initialized
    if (this.ctx) {
      if (changes['colors'] || changes['paletteType'] || changes['baseColor']) {
        this.drawColorWheel();
        
        if (this.colors.length > 0) {
          this.drawColorPositions();
        }
      }
    }
  }
  
  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    
    if (container) {
      // Make the canvas responsive
      const size = Math.min(container.clientWidth, 300);
      canvas.width = size;
      canvas.height = size;
    } else {
      canvas.width = 200;
      canvas.height = 200;
    }
    
    this.ctx = canvas.getContext('2d')!;
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
    this.radius = Math.min(this.centerX, this.centerY) - 20;
  }
  
  private drawColorWheel(): void {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    
    // Draw the color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
      this.ctx.closePath();
      
      const hue = angle;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      this.ctx.fill();
    }
    
    // Draw the center white circle for a cleaner look
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius * 0.2, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fill();
    
    // Add harmony guidelines based on palette type
    this.drawHarmonyGuidelines();
  }
  
  private drawHarmonyGuidelines(): void {
    if (!this.baseColor || this.colors.length === 0) return;
    
    // Convert base color to HSL to get the hue
    const hsl = this.hexToHsl(this.baseColor);
    const baseHue = hsl.h;
    const baseAngle = baseHue * Math.PI / 180;
    
    // Draw a reference line for the base color
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    const endX = this.centerX + this.radius * Math.cos(baseAngle);
    const endY = this.centerY + this.radius * Math.sin(baseAngle);
    this.ctx.lineTo(endX, endY);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Draw harmony guidelines based on palette type
    switch (this.paletteType) {
      case 'complementary':
        // Draw line to the complementary color (180° opposite)
        this.drawGuideLine((baseHue + 180) % 360);
        break;
        
      case 'analogous':
        // Draw lines to analogous colors (±30°)
        this.drawGuideLine((baseHue + 30) % 360);
        this.drawGuideLine((baseHue - 30 + 360) % 360);
        break;
        
      case 'triadic':
        // Draw lines to triadic colors (120° apart)
        this.drawGuideLine((baseHue + 120) % 360);
        this.drawGuideLine((baseHue + 240) % 360);
        break;
        
      case 'tetradic':
        // Draw lines to tetradic colors (90° apart)
        this.drawGuideLine((baseHue + 90) % 360);
        this.drawGuideLine((baseHue + 180) % 360);
        this.drawGuideLine((baseHue + 270) % 360);
        break;
    }
  }
  
  private drawGuideLine(hue: number): void {
    const angle = hue * Math.PI / 180;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    const endX = this.centerX + this.radius * Math.cos(angle);
    const endY = this.centerY + this.radius * Math.sin(angle);
    this.ctx.lineTo(endX, endY);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }
  
  private drawColorPositions(): void {
    // Place dots for each color in the palette
    this.colors.forEach((hexColor) => {
      const hsl = this.hexToHsl(hexColor);
      const hue = hsl.h;
      const angle = hue * Math.PI / 180;
      
      // Calculate position based on hue and a distance from center based on saturation
      const distance = this.radius * (0.4 + (hsl.s * 0.6)); // Scale to keep within the wheel
      const x = this.centerX + distance * Math.cos(angle);
      const y = this.centerY + distance * Math.sin(angle);
      
      // Draw a circle representing this color
      this.ctx.beginPath();
      this.ctx.arc(x, y, 8, 0, Math.PI * 2);
      this.ctx.fillStyle = hexColor;
      this.ctx.fill();
      
      // Add border for better visibility
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });
  }
  
  // Helper method to convert hex to HSL
  private hexToHsl(hex: string): { h: number, s: number, l: number } {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    
    // Convert RGB to HSL
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
}
