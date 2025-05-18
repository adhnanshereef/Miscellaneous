import { Component, ElementRef, Renderer2, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { BaseIdeaDirective } from '../base-idea.directive';
import { CursorEffectDirective } from '../../ideas-dashboard/cursor-effect.directive';
import { CursorEffectUtil } from '../cursor-effect-util';
import { ElementCategory, elementsData, Element } from '../../../chemical-elements';


@Component({
  selector: 'app-periodic-table',
  standalone: true,
  imports: [CommonModule, FormsModule, CursorEffectDirective],
  templateUrl: './periodic-table.component.html',
  styleUrl: './periodic-table.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('elementExpand', [
      state('closed', style({
        height: '0px',
        opacity: 0
      })),
      state('open', style({
        height: '*',
        opacity: 1
      })),
      transition('closed => open', [
        animate('300ms ease-out')
      ]),
      transition('open => closed', [
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class PeriodicTableComponent extends BaseIdeaDirective implements OnInit, AfterViewInit {
  // Display options
  view: 'table' | 'list' = 'table';
  selectedCategory: ElementCategory | 'all' = 'all';
  searchTerm: string = '';
  sortBy: 'atomicNumber' | 'name' | 'atomicWeight' = 'atomicNumber';
  sortDirection: 'asc' | 'desc' = 'asc';
  showLegend: boolean = true;

  // Element data
  elements: Element[] = elementsData;
  
  // Element details state
  selectedElement: Element | null = null;
    // UI state
  isMobile: boolean = false;
  isTablet: boolean = false;
  tableZoom: number = 0.845;
  
  // Categories for filtering
  categories: {id: ElementCategory | 'all', name: string}[] = [
    {id: 'all', name: 'All Elements'},
    {id: 'noble-gas', name: 'Noble Gases'},
    {id: 'alkali-metal', name: 'Alkali Metals'},
    {id: 'alkaline-earth', name: 'Alkaline Earth Metals'},
    {id: 'transition-metal', name: 'Transition Metals'},
    {id: 'post-transition-metal', name: 'Post-Transition Metals'},
    {id: 'metalloid', name: 'Metalloids'},
    {id: 'nonmetal', name: 'Nonmetals'},
    {id: 'lanthanide', name: 'Lanthanides'},
    {id: 'actinide', name: 'Actinides'}
  ];

  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    super(elementRef);
  }
  override ngOnInit(): void {
    super.ngOnInit();
    this.checkScreenSize();
    
    // Ensure the proper initial zoom level is applied
    if (this.view === 'table') {
      if (this.isMobile) {
        this.tableZoom = 0.6;
      } else if (this.isTablet) {
        this.tableZoom = 0.7;
      } else {
        this.tableZoom = 0.845;
      }
    }
  }
  
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    
    // Ensure cursor effects are applied
    setTimeout(() => {
      this.refreshCursorEffects();
      
      // Apply cursor effects to interactive elements
      CursorEffectUtil.applyToInteractiveElements(
        this.elementRef!, 
        this.renderer, 
        'button, select, .element-card, .category-filter, .view-toggle, .search-input, .table-container, .element-details'
      );
    });
  }
    @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    if (this.isMobile && this.view === 'table') {
      this.tableZoom = 0.6;
    } else if (this.isTablet && this.view === 'table') {
      this.tableZoom = 0.7;
    } else {
      this.tableZoom = 0.8;
    }
  }

  protected override refreshCursorEffects(): void {
    // Call the parent method first
    super.refreshCursorEffects();
    
    if (!this.elementRef || !this.elementRef.nativeElement) return;
    
    // Find all interactive elements
    const interactiveElements = this.elementRef.nativeElement.querySelectorAll(
      'button, a, input, select, [role="button"], [tabindex], .element-card, .category-filter, .view-toggle'
    );
    
    // Apply cursor:none to all interactive elements
    interactiveElements.forEach((element: Element) => {
      if (element instanceof HTMLElement) {
        this.renderer.setStyle(element, 'cursor', 'none');
      }
    });
  }
  
  selectElement(element: Element): void {
    this.selectedElement = element;
  }
  
  closeElementDetails(): void {
    this.selectedElement = null;
  }
  
  toggleView(): void {
    this.view = this.view === 'table' ? 'list' : 'table';
  }
  
  setCategory(category: ElementCategory | 'all'): void {
    this.selectedCategory = category;
  }
  
  toggleLegend(): void {
    this.showLegend = !this.showLegend;
  }
    adjustZoom(amount: number): void {
    const previousZoom = this.tableZoom;
    this.tableZoom = Math.max(0.5, Math.min(2, this.tableZoom + amount));
    
    // Center the view after zooming
    setTimeout(() => {
      this.centerPeriodicTable(previousZoom);
    }, 50);
  }
  
  /**
   * Centers the periodic table in the container after zooming
   */
  centerPeriodicTable(previousZoom: number): void {
    const tableContainer = this.elementRef?.nativeElement?.querySelector('.table-container');
    if (tableContainer) {
      // Calculate how much to adjust scroll position based on zoom change
      const zoomRatio = this.tableZoom / previousZoom;
      const currentScrollLeft = tableContainer.scrollLeft;
      const currentScrollTop = tableContainer.scrollTop;
      
      // Adjust scroll position to keep centered content visible
      tableContainer.scrollLeft = currentScrollLeft * zoomRatio;
      tableContainer.scrollTop = currentScrollTop * zoomRatio;
    }
  }
    resetZoom(): void {
    // Reset to the appropriate zoom level based on screen size
    if (this.isMobile) {
      this.tableZoom = 0.6;
    } else if (this.isTablet) {
      this.tableZoom = 0.7;
    } else {
      this.tableZoom = 0.8;
    }
  }
  
  setSortBy(sortOption: 'atomicNumber' | 'name' | 'atomicWeight'): void {
    if (this.sortBy === sortOption) {
      // Toggle direction if clicking the same sort option
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortOption;
      this.sortDirection = 'asc';
    }
  }
  
  get filteredElements(): Element[] {
    return this.elements
      .filter(element => {
        const matchesCategory = this.selectedCategory === 'all' || element.category === this.selectedCategory;
        const matchesSearch = this.searchTerm === '' || 
          element.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
          element.symbol.toLowerCase() === this.searchTerm.toLowerCase() || 
          element.atomicNumber.toString() === this.searchTerm;
        
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        if (this.sortBy === 'atomicNumber') {
          comparison = a.atomicNumber - b.atomicNumber;
        } else if (this.sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else { // atomicWeight
          comparison = a.atomicWeight - b.atomicWeight;
        }
        
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
  }
  
  // Helper method to get CSS class for element category
  getElementClass(category: ElementCategory): string {
    return `element-${category}`;
  }
    getPositionStyles(atomicNumber: number): any {
    // Define positions for each element in the standard periodic table layout
    const positions: {[key: number]: {row: number, col: number}} = {
      // Period 1
      1: {row: 1, col: 1},    // H
      2: {row: 1, col: 18},   // He
      
      // Period 2
      3: {row: 2, col: 1},    // Li
      4: {row: 2, col: 2},    // Be
      5: {row: 2, col: 13},   // B
      6: {row: 2, col: 14},   // C
      7: {row: 2, col: 15},   // N
      8: {row: 2, col: 16},   // O
      9: {row: 2, col: 17},   // F
      10: {row: 2, col: 18},  // Ne
      
      // Period 3
      11: {row: 3, col: 1},   // Na
      12: {row: 3, col: 2},   // Mg
      13: {row: 3, col: 13},  // Al
      14: {row: 3, col: 14},  // Si
      15: {row: 3, col: 15},  // P
      16: {row: 3, col: 16},  // S
      17: {row: 3, col: 17},  // Cl
      18: {row: 3, col: 18},  // Ar
      
      // Period 4
      19: {row: 4, col: 1},   // K
      20: {row: 4, col: 2},   // Ca
      21: {row: 4, col: 3},   // Sc
      22: {row: 4, col: 4},   // Ti
      23: {row: 4, col: 5},   // V
      24: {row: 4, col: 6},   // Cr
      25: {row: 4, col: 7},   // Mn
      26: {row: 4, col: 8},   // Fe
      27: {row: 4, col: 9},   // Co
      28: {row: 4, col: 10},  // Ni
      29: {row: 4, col: 11},  // Cu
      30: {row: 4, col: 12},  // Zn
      31: {row: 4, col: 13},  // Ga
      32: {row: 4, col: 14},  // Ge
      33: {row: 4, col: 15},  // As
      34: {row: 4, col: 16},  // Se
      35: {row: 4, col: 17},  // Br
      36: {row: 4, col: 18},  // Kr
      
      // Period 5
      37: {row: 5, col: 1},   // Rb
      38: {row: 5, col: 2},   // Sr
      39: {row: 5, col: 3},   // Y
      40: {row: 5, col: 4},   // Zr
      41: {row: 5, col: 5},   // Nb
      42: {row: 5, col: 6},   // Mo
      43: {row: 5, col: 7},   // Tc
      44: {row: 5, col: 8},   // Ru
      45: {row: 5, col: 9},   // Rh
      46: {row: 5, col: 10},  // Pd
      47: {row: 5, col: 11},  // Ag
      48: {row: 5, col: 12},  // Cd
      49: {row: 5, col: 13},  // In
      50: {row: 5, col: 14},  // Sn
      51: {row: 5, col: 15},  // Sb
      52: {row: 5, col: 16},  // Te
      53: {row: 5, col: 17},  // I
      54: {row: 5, col: 18},  // Xe
      
      // Period 6
      55: {row: 6, col: 1},   // Cs
      56: {row: 6, col: 2},   // Ba
      
      // Lanthanides (shown in row 8 for layout)
      57: {row: 9, col: 3},   // La
      58: {row: 9, col: 4},   // Ce
      59: {row: 9, col: 5},   // Pr
      60: {row: 9, col: 6},   // Nd
      61: {row: 9, col: 7},   // Pm
      62: {row: 9, col: 8},   // Sm
      63: {row: 9, col: 9},   // Eu
      64: {row: 9, col: 10},  // Gd
      65: {row: 9, col: 11},  // Tb
      66: {row: 9, col: 12},  // Dy
      67: {row: 9, col: 13},  // Ho
      68: {row: 9, col: 14},  // Er
      69: {row: 9, col: 15},  // Tm
      70: {row: 9, col: 16},  // Yb
      71: {row: 9, col: 17},  // Lu
      
      // Back to Period 6
      72: {row: 6, col: 4},   // Hf
      73: {row: 6, col: 5},   // Ta
      74: {row: 6, col: 6},   // W
      75: {row: 6, col: 7},   // Re
      76: {row: 6, col: 8},   // Os
      77: {row: 6, col: 9},   // Ir
      78: {row: 6, col: 10},  // Pt
      79: {row: 6, col: 11},  // Au
      80: {row: 6, col: 12},  // Hg
      81: {row: 6, col: 13},  // Tl
      82: {row: 6, col: 14},  // Pb
      83: {row: 6, col: 15},  // Bi
      84: {row: 6, col: 16},  // Po
      85: {row: 6, col: 17},  // At
      86: {row: 6, col: 18},  // Rn
      
      // Period 7
      87: {row: 7, col: 1},   // Fr
      88: {row: 7, col: 2},   // Ra
      
      // Actinides (shown in row 9 for layout)
      89: {row: 10, col: 3},   // Ac
      90: {row: 10, col: 4},   // Th
      91: {row: 10, col: 5},   // Pa
      92: {row: 10, col: 6},   // U
      93: {row: 10, col: 7},   // Np
      94: {row: 10, col: 8},   // Pu
      95: {row: 10, col: 9},   // Am
      96: {row: 10, col: 10},  // Cm
      97: {row: 10, col: 11},  // Bk
      98: {row: 10, col: 12},  // Cf
      99: {row: 10, col: 13},  // Es
      100: {row: 10, col: 14}, // Fm
      101: {row: 10, col: 15}, // Md
      102: {row: 10, col: 16}, // No
      103: {row: 10, col: 17}, // Lr
      
      // Back to Period 7
      104: {row: 7, col: 4},  // Rf
      105: {row: 7, col: 5},  // Db
      106: {row: 7, col: 6},  // Sg
      107: {row: 7, col: 7},  // Bh
      108: {row: 7, col: 8},  // Hs
      109: {row: 7, col: 9},  // Mt
      110: {row: 7, col: 10}, // Ds
      111: {row: 7, col: 11}, // Rg
      112: {row: 7, col: 12}, // Cn
      113: {row: 7, col: 13}, // Nh
      114: {row: 7, col: 14}, // Fl
      115: {row: 7, col: 15}, // Mc
      116: {row: 7, col: 16}, // Lv
      117: {row: 7, col: 17}, // Ts
      118: {row: 7, col: 18}  // Og
    };
    
    const position = positions[atomicNumber];
    if (!position) {
      console.warn(`No position defined for element ${atomicNumber}`);
      return {gridRow: 1, gridColumn: 1}; // default position
    }
    
    return {
      gridRow: position.row,
      gridColumn: position.col
    };
  }
  
  getCategoryDisplayName(): string {
    if (this.selectedCategory === 'all') {
      return 'All Elements';
    } else {
      const category = this.categories.find(c => c.id === this.selectedCategory);
      return category ? category.name : 'All Elements';
    }
  }
}
