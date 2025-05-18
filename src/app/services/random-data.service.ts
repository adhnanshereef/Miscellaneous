import { Injectable } from '@angular/core';

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export type DataShape = 'normal' | 'skewed' | 'uniform' | 'bimodal' | 'exponential';
export type DataCategory = 'sales' | 'performance' | 'engagement' | 'demographics' | 'growth' | 'custom';

@Injectable({
  providedIn: 'root'
})
export class RandomDataService {
  // Color palettes for different categories
  private colorPalettes: Record<DataCategory, string[]> = {
    sales: ['#3A0CA3', '#4361EE', '#4CC9F0', '#4895EF', '#560BAD'],
    performance: ['#F72585', '#B5179E', '#7209B7', '#560BAD', '#480CA8'],
    engagement: ['#80FFDB', '#72EFDD', '#64DFDF', '#56CFE1', '#48BFE3'],
    demographics: ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D'],
    growth: ['#2B9348', '#55A630', '#80B918', '#AACC00', '#BFD200'],
    custom: ['#FF6B6B', '#4ECDC4', '#1A535C', '#FF9F1C', '#E71D36']
  };

  // Names for each category
  private categoryNames: Record<DataCategory, string[]> = {
    sales: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'],
    performance: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'],
    engagement: ['Very High', 'High', 'Medium', 'Low', 'Very Low'],
    demographics: ['18-24', '25-34', '35-44', '45-54', '55+'],
    growth: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    custom: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E']
  };

  constructor() { }

  /**
   * Generates random data points based on specified parameters
   */
  generateData(
    count: number = 5, 
    minValue: number = 0, 
    maxValue: number = 1000, 
    dataShape: DataShape = 'normal',
    category: DataCategory = 'custom',
    customLabels?: string[],
    customColors?: string[]
  ): DataPoint[] {
    // Use custom labels or get labels from the category
    const labels = customLabels || this.getCategoryLabels(category, count);
    const colors = customColors || this.getCategoryColors(category, count);
    
    // Generate values based on the specified distribution
    const values = this.generateValues(count, minValue, maxValue, dataShape);
    
    // Combine data
    return labels.map((label, index) => ({
      label,
      value: values[index],
      color: colors[index]
    }));
  }

  /**
   * Returns a set of labels for the specified category
   */
  private getCategoryLabels(category: DataCategory, count: number): string[] {
    const baseLabels = this.categoryNames[category];
    
    // If we need more labels than the base set provides, we'll generate them
    if (count <= baseLabels.length) {
      return baseLabels.slice(0, count);
    }
    
    // For additional labels, we'll add numeric suffixes
    const result = [...baseLabels];
    for (let i = baseLabels.length; i < count; i++) {
      result.push(`${category} ${i + 1}`);
    }
    
    return result;
  }

  /**
   * Returns a set of colors for the specified category
   */
  private getCategoryColors(category: DataCategory, count: number): string[] {
    const basePalette = this.colorPalettes[category];
    
    // If we need more colors than the palette provides, we'll generate them
    if (count <= basePalette.length) {
      return basePalette.slice(0, count);
    }
    
    // For additional colors, we'll interpolate between existing ones
    const result = [...basePalette];
    for (let i = basePalette.length; i < count; i++) {
      // Simple color interpolation - in a real app you might use a more sophisticated approach
      const idx1 = i % basePalette.length;
      const idx2 = (i + 1) % basePalette.length;
      result.push(this.interpolateColor(basePalette[idx1], basePalette[idx2], 0.5));
    }
    
    return result;
  }

  /**
   * Generates random values based on the specified distribution shape
   */
  private generateValues(count: number, min: number, max: number, shape: DataShape): number[] {
    const values: number[] = [];
    
    for (let i = 0; i < count; i++) {
      let value: number;
      
      switch (shape) {
        case 'normal':
          // Approximation of normal distribution using Box-Muller transform
          value = this.generateNormalValue(min, max);
          break;
          
        case 'skewed':
          // Generate a skewed distribution to the right
          value = min + Math.pow(Math.random(), 2) * (max - min);
          break;
          
        case 'uniform':
          // Simple uniform distribution
          value = min + Math.random() * (max - min);
          break;
          
        case 'bimodal':
          // Bimodal distribution - two peaks
          if (Math.random() < 0.5) {
            value = min + Math.random() * (max - min) * 0.4; // First peak near min
          } else {
            value = max - Math.random() * (max - min) * 0.4; // Second peak near max
          }
          break;
          
        case 'exponential':
          // Approximation of exponential distribution
          value = min + (-Math.log(1 - Math.random()) / 0.5) * (max - min) / 6;
          value = Math.min(value, max); // Cap at max
          break;
          
        default:
          value = min + Math.random() * (max - min);
      }
      
      // Round to integer for cleaner display
      values.push(Math.round(value));
    }
    
    return values;
  }

  /**
   * Generates a value approximating normal distribution
   */
  private generateNormalValue(min: number, max: number): number {
    // Box-Muller transform to approximate normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Map from standard normal to our desired range
    // We'll map the middle 95% of the standard normal (-2 to 2) to our min-max range
    const mean = (min + max) / 2;
    const stdDev = (max - min) / 4;  // 4 standard deviations cover ~95% of data
    
    const result = mean + z0 * stdDev;
    
    // Clamp to our range
    return Math.max(min, Math.min(max, result));
  }
  
  /**
   * Simple linear interpolation between two hex colors
   */
  private interpolateColor(color1: string, color2: string, factor: number): string {
    // Convert hex to RGB
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    // Interpolate
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    // Convert back to hex
    const toHex = (c: number): string => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
