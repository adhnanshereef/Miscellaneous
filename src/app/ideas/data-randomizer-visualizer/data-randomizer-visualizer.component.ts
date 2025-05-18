import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseIdeaDirective } from '../base-idea.directive';
import { CursorEffectDirective } from '../../ideas-dashboard/cursor-effect.directive';
import { CursorEffectUtil } from '../cursor-effect-util';
import { DataPoint, DataShape, DataCategory, RandomDataService } from '../../services/random-data.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-data-randomizer-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule, CursorEffectDirective],
  templateUrl: './data-randomizer-visualizer.component.html',
  styleUrl: './data-randomizer-visualizer.component.css'
})
export class DataRandomizerVisualizerComponent extends BaseIdeaDirective implements OnInit, AfterViewInit {
  // Chart instances
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  
  pieChart: Chart | null = null;
  barChart: Chart | null = null;
  
  // Form controls
  dataCount = 5;
  minValue = 10;
  maxValue = 1000;
  dataShape: DataShape = 'normal';
  dataCategory: DataCategory = 'custom';
  
  // Display options
  viewMode: 'pie' | 'bar' | 'list' = 'pie';
  
  // Data
  generatedData: DataPoint[] = [];
  
  // Available shapes for the dropdown
  dataShapes: { id: DataShape; name: string }[] = [
    { id: 'normal', name: 'Normal Distribution' },
    { id: 'skewed', name: 'Skewed Distribution' },
    { id: 'uniform', name: 'Uniform Distribution' },
    { id: 'bimodal', name: 'Bimodal Distribution' },
    { id: 'exponential', name: 'Exponential Distribution' }
  ];
  
  // Available categories for the dropdown
  dataCategories: { id: DataCategory; name: string }[] = [
    { id: 'custom', name: 'Custom Data' },
    { id: 'sales', name: 'Sales Data' },
    { id: 'performance', name: 'Performance Metrics' },
    { id: 'engagement', name: 'Engagement Levels' },
    { id: 'demographics', name: 'Demographic Groups' },
    { id: 'growth', name: 'Growth Trajectory' }
  ];
  
  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2,
    private randomDataService: RandomDataService
  ) {
    super(elementRef);
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
    // Generate initial data
    this.generateData();
  }
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    
    // Initialize charts after a longer delay to ensure canvas elements are fully rendered
    setTimeout(() => {
      this.createCharts();
      this.refreshCursorEffects();
    }, 500);
  }
  
  protected override refreshCursorEffects(): void {
    // Call the parent method first
    super.refreshCursorEffects();
    
    if (!this.elementRef || !this.elementRef.nativeElement) return;
    
    // Find all interactive elements
    CursorEffectUtil.applyToInteractiveElements(
      this.elementRef, 
      this.renderer, 
      'button, input, select, .view-toggle, .randomizer-card, .option-toggle, .data-point'
    );
  }
  
  /**
   * Generate random data based on the current settings
   */
  generateData(): void {
    this.generatedData = this.randomDataService.generateData(
      this.dataCount,
      this.minValue,
      this.maxValue,
      this.dataShape,
      this.dataCategory
    );
    
    // Update the charts if they exist
    if (this.pieChart || this.barChart) {
      this.updateCharts();
    }
  }
  /**
   * Create the initial chart instances
   */
  createCharts(): void {
    try {
      // Check if canvas elements exist and are accessible
      if (this.pieCanvas?.nativeElement && this.barCanvas?.nativeElement) {
        console.log('Creating charts with canvas elements:', 
          this.pieCanvas.nativeElement, 
          this.barCanvas.nativeElement
        );
        
        // Clear any existing charts
        if (this.pieChart) {
          this.pieChart.destroy();
          this.pieChart = null;
        }
        if (this.barChart) {
          this.barChart.destroy();
          this.barChart = null;
        }
        
        // Force canvas dimensions
        const pieCtx = this.pieCanvas.nativeElement.getContext('2d');
        const barCtx = this.barCanvas.nativeElement.getContext('2d');
        
        if (!pieCtx || !barCtx) {
          console.error('Failed to get canvas context');
          return;
        }
        
        // Create pie chart
        this.pieChart = new Chart(pieCtx, {
          type: 'pie',
          data: {
            labels: this.generatedData.map(d => d.label),
            datasets: [{
              data: this.generatedData.map(d => d.value),
              backgroundColor: this.generatedData.map(d => d.color || '#000'),
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: 'rgba(255, 255, 255, 0.8)',
                  font: {
                    family: "'Inter', sans-serif",
                    size: 12
                  },
                  padding: 20
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${context.label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
        
        // Create bar chart
        this.barChart = new Chart(barCtx, {
          type: 'bar',
          data: {
            labels: this.generatedData.map(d => d.label),
            datasets: [{
              label: 'Value',
              data: this.generatedData.map(d => d.value),
              backgroundColor: this.generatedData.map(d => d.color || '#000'),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.8)'
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: 'rgba(255, 255, 255, 0.8)'
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
        
        console.log('Charts created successfully:', this.pieChart, this.barChart);
      } else {
        console.error('Canvas elements not found or not accessible yet', {
          pieCanvas: this.pieCanvas,
          barCanvas: this.barCanvas
        });
      }
    } catch (error) {
      console.error('Error creating charts:', error);
    }
  }
  
  /**
   * Update the charts with the latest data
   */
  updateCharts(): void {
    if (this.pieChart) {
      this.pieChart.data.labels = this.generatedData.map(d => d.label);
      this.pieChart.data.datasets[0].data = this.generatedData.map(d => d.value);
      this.pieChart.data.datasets[0].backgroundColor = this.generatedData.map(d => d.color || '#000');
      this.pieChart.update();
    }
    
    if (this.barChart) {
      this.barChart.data.labels = this.generatedData.map(d => d.label);
      this.barChart.data.datasets[0].data = this.generatedData.map(d => d.value);
      this.barChart.data.datasets[0].backgroundColor = this.generatedData.map(d => d.color || '#000');
      this.barChart.update();
    }
  }
  /**
   * Set the current view mode
   */
  setViewMode(mode: 'pie' | 'bar' | 'list'): void {
    this.viewMode = mode;
    
    // Give the DOM time to update, then re-render charts if needed
    setTimeout(() => {
      if (mode === 'pie' || mode === 'bar') {
        // If switching to a chart view, ensure charts are created or updated
        if (!this.pieChart || !this.barChart) {
          console.log('Creating charts on view mode change');
          this.createCharts();
        } else {
          // Force charts to update and resize properly
          if (mode === 'pie' && this.pieChart) {
            console.log('Updating pie chart');
            this.pieChart.resize();
            this.pieChart.update();
          } else if (mode === 'bar' && this.barChart) {
            console.log('Updating bar chart');
            this.barChart.resize();
            this.barChart.update();
          }
        }
      }
      // Refresh cursor effects after view change
      this.refreshCursorEffects();
    }, 200);
  }
  
  /**
   * Calculate the total of all values
   */
  getTotalValue(): number {
    return this.generatedData.reduce((total, point) => total + point.value, 0);
  }
  
  /**
   * Calculate the percentage for a specific data point
   */
  getPercentage(value: number): string {
    const total = this.getTotalValue();
    return ((value / total) * 100).toFixed(1);
  }
  
  /**
   * Handle data count changes and regenerate the data
   */
  onDataCountChange(): void {
    // Ensure count is within reasonable limits
    if (this.dataCount < 2) this.dataCount = 2;
    if (this.dataCount > 15) this.dataCount = 15;
    
    this.generateData();
  }
  
  /**
   * Handle min/max value changes
   */
  onValueRangeChange(): void {
    // Ensure min is less than max
    if (this.minValue >= this.maxValue) {
      this.minValue = this.maxValue - 10;
    }
    
    this.generateData();
  }
  
  /**
   * Export current data to CSV
   */
  exportToCSV(): void {
    const csvContent = [
      // Header row
      ['Label', 'Value', 'Percentage'].join(','),
      // Data rows
      ...this.generatedData.map(d => 
        [d.label, d.value, this.getPercentage(d.value) + '%'].join(',')
      )
    ].join('\n');
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `random-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
