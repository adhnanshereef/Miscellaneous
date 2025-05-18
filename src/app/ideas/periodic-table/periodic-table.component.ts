import { Component, ElementRef, Renderer2, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { BaseIdeaDirective } from '../base-idea.directive';
import { CursorEffectDirective } from '../../ideas-dashboard/cursor-effect.directive';
import { CursorEffectUtil } from '../cursor-effect-util';

interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicWeight: number;
  category: ElementCategory;
  electronConfiguration: string;
  electronegativity?: number | null;
  density?: number;
  meltingPoint?: number;
  boilingPoint?: number;
  discoveredBy?: string;
  discoveryYear?: number | null;
  description: string;
  commonUses?: string[];
}

type ElementCategory = 
  | 'noble-gas'
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'lanthanide'
  | 'actinide'
  | 'unknown';

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
  
  // Element details state
  selectedElement: Element | null = null;
  
  // UI state
  isMobile: boolean = false;
  isTablet: boolean = false;
  tableZoom: number = 1;
  
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

  // Periodic table data - includes all elements
  elements: Element[] = [
    {
      atomicNumber: 1,
      symbol: 'H',
      name: 'Hydrogen',
      atomicWeight: 1.008,
      category: 'nonmetal',
      electronConfiguration: '1s¹',
      electronegativity: 2.2,
      density: 0.0000899,
      meltingPoint: -259.16,
      boilingPoint: -252.879,
      discoveredBy: 'Henry Cavendish',
      discoveryYear: 1766,
      description: 'Hydrogen is the lightest and most abundant chemical element in the universe, constituting approximately 75% of all normal matter.',
      commonUses: ['Fuel', 'Ammonia production', 'Oil refining', 'Rocket fuel']
    },
    {
      atomicNumber: 2,
      symbol: 'He',
      name: 'Helium',
      atomicWeight: 4.0026,
      category: 'noble-gas',
      electronConfiguration: '1s²',
      electronegativity: null,
      density: 0.0001785,
      meltingPoint: -272.2,
      boilingPoint: -268.93,
      discoveredBy: 'Pierre Janssen, Norman Lockyer',
      discoveryYear: 1868,
      description: 'Helium is a colorless, odorless, tasteless, non-toxic, inert, monatomic gas, the first in the noble gas group in the periodic table.',
      commonUses: ['Balloons', 'Cooling MRI machines', 'Diving mixture', 'Leak detection']
    },
    {
      atomicNumber: 3,
      symbol: 'Li',
      name: 'Lithium',
      atomicWeight: 6.94,
      category: 'alkali-metal',
      electronConfiguration: '1s² 2s¹',
      electronegativity: 0.98,
      density: 0.534,
      meltingPoint: 180.50,
      boilingPoint: 1342,
      discoveredBy: 'Johan August Arfwedson',
      discoveryYear: 1817,
      description: 'Lithium is a soft, silvery-white alkali metal. Under standard conditions, it is the lightest metal and the lightest solid element.',
      commonUses: ['Batteries', 'Medication', 'Aerospace alloys', 'Nuclear fusion']
    },
    {
      atomicNumber: 6,
      symbol: 'C',
      name: 'Carbon',
      atomicWeight: 12.011,
      category: 'nonmetal',
      electronConfiguration: '1s² 2s² 2p²',
      electronegativity: 2.55,
      density: 2.267,
      meltingPoint: 3550,
      boilingPoint: 4027,
      discoveredBy: 'Known since antiquity',
      discoveryYear: null,
      description: 'Carbon is a nonmetal that has been known since ancient times. Carbon is present in all known life forms and is the 4th most abundant element in the universe by mass.',
      commonUses: ['Steel making', 'Construction', 'Fuel', 'Nanotechnology']
    },
    {
      atomicNumber: 8,
      symbol: 'O',
      name: 'Oxygen',
      atomicWeight: 15.999,
      category: 'nonmetal',
      electronConfiguration: '1s² 2s² 2p⁴',
      electronegativity: 3.44,
      density: 0.001429,
      meltingPoint: -218.79,
      boilingPoint: -182.962,
      discoveredBy: 'Carl Wilhelm Scheele, Joseph Priestley',
      discoveryYear: 1774,
      description: 'Oxygen is a member of the chalcogen group on the periodic table, a highly reactive nonmetal, and an oxidizing agent that readily forms oxides with most elements as well as with other compounds.',
      commonUses: ['Medical treatment', 'Steel making', 'Rocket propellant', 'Life support']
    },
    {
      atomicNumber: 11,
      symbol: 'Na',
      name: 'Sodium',
      atomicWeight: 22.990,
      category: 'alkali-metal',
      electronConfiguration: '1s² 2s² 2p⁶ 3s¹',
      electronegativity: 0.93,
      density: 0.968,
      meltingPoint: 97.794,
      boilingPoint: 882.940,
      discoveredBy: 'Humphry Davy',
      discoveryYear: 1807,
      description: 'Sodium is a soft, silvery-white, highly reactive metal. Sodium is an alkali metal, being in group 1 of the periodic table.',
      commonUses: ['Table salt (NaCl)', 'Street lights', 'Chemical manufacturing', 'Nuclear reactors']
    },
    {
      atomicNumber: 17,
      symbol: 'Cl',
      name: 'Chlorine',
      atomicWeight: 35.45,
      category: 'nonmetal',
      electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁵',
      electronegativity: 3.16,
      density: 0.003214,
      meltingPoint: -101.5,
      boilingPoint: -34.04,
      discoveredBy: 'Carl Wilhelm Scheele',
      discoveryYear: 1774,
      description: 'Chlorine is a yellow-green gas at room temperature and atmospheric pressure. It is an extremely reactive element and a strong oxidizing agent.',
      commonUses: ['Water disinfection', 'Bleaches', 'PVC production', 'Chemical manufacturing']
    },
    {
      atomicNumber: 26,
      symbol: 'Fe',
      name: 'Iron',
      atomicWeight: 55.845,
      category: 'transition-metal',
      electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶',
      electronegativity: 1.83,
      density: 7.874,
      meltingPoint: 1538,
      boilingPoint: 2862,
      discoveredBy: 'Known since ancient times',
      discoveryYear: null,
      description: 'Iron is a metal that belongs to the transition metals and is, by mass, the most common element on Earth, forming much of Earth\'s outer and inner core.',
      commonUses: ['Steel production', 'Construction', 'Automotive industry', 'Tools']
    },
    {
      atomicNumber: 29,
      symbol: 'Cu',
      name: 'Copper',
      atomicWeight: 63.546,
      category: 'transition-metal',
      electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹ 3d¹⁰',
      electronegativity: 1.9,
      density: 8.96,
      meltingPoint: 1084.62,
      boilingPoint: 2560,
      discoveredBy: 'Middle East (9000 BCE)',
      discoveryYear: null,
      description: 'Copper is a soft, malleable, and ductile metal with high thermal and electrical conductivity. It is one of the few metals that can occur in nature in a directly usable metallic form.',
      commonUses: ['Electrical wiring', 'Plumbing', 'Cookware', 'Electronics']
    },
    {
      atomicNumber: 47,
      symbol: 'Ag',
      name: 'Silver',
      atomicWeight: 107.8682,
      category: 'transition-metal',
      electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s¹ 4d¹⁰',
      electronegativity: 1.93,
      density: 10.49,
      meltingPoint: 961.78,
      boilingPoint: 2162,
      discoveredBy: 'Known since antiquity',
      discoveryYear: null,
      description: 'Silver is a soft, white, lustrous transition metal, exhibiting the highest electrical conductivity, thermal conductivity, and reflectivity of any metal.',
      commonUses: ['Jewelry', 'Photography', 'Electronics', 'Silverware']
    },
    {
      atomicNumber: 79,
      symbol: 'Au',
      name: 'Gold',
      atomicWeight: 196.9665,
      category: 'transition-metal',
      electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s¹ 4d¹⁰ 5p⁶ 6s¹ 4f¹⁴ 5d¹⁰',
      electronegativity: 2.54,
      density: 19.3,
      meltingPoint: 1064.18,
      boilingPoint: 2856,
      discoveredBy: 'Middle East (Before 6000 BCE)',
      discoveryYear: null,
      description: 'Gold is a bright, slightly reddish yellow, dense, soft, malleable, and ductile metal. It is one of the least reactive chemical elements and is solid under standard conditions.',
      commonUses: ['Jewelry', 'Currency', 'Electronics', 'Dentistry']
    },
    {
      atomicNumber: 80,
      symbol: 'Hg',
      name: 'Mercury',
      atomicWeight: 200.59,
      category: 'transition-metal',
      electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰ 5p⁶ 6s² 4f¹⁴ 5d¹⁰',
      electronegativity: 2.00,
      density: 13.546,
      meltingPoint: -38.83,
      boilingPoint: 356.73,
      discoveredBy: 'Ancient Chinese and Indians',
      discoveryYear: null,
      description: 'Mercury is a heavy, silvery-white metal. It is the only metallic element that is liquid at standard conditions for temperature and pressure.',
      commonUses: ['Thermometers', 'Fluorescent lamps', 'Dental amalgam', 'Batteries']
    },
    {
      atomicNumber: 82,
      symbol: 'Pb',
      name: 'Lead',
      atomicWeight: 207.2,
      category: 'post-transition-metal',
      electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰ 5p⁶ 6s² 4f¹⁴ 5d¹⁰ 6p²',
      electronegativity: 2.33,
      density: 11.34,
      meltingPoint: 327.462,
      boilingPoint: 1749,
      discoveredBy: 'Known since ancient times',
      discoveryYear: null,
      description: 'Lead is a heavy metal that is denser than most common materials. It is soft and malleable, and also has a relatively low melting point.',
      commonUses: ['Batteries', 'Radiation protection', 'Bullets', 'Construction']
    },
    {
      atomicNumber: 92,
      symbol: 'U',
      name: 'Uranium',
      atomicWeight: 238.0289,
      category: 'actinide',
      electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰ 5p⁶ 6s² 4f¹⁴ 5d¹⁰ 6p⁶ 7s² 5f⁴ 6d¹',
      electronegativity: 1.38,
      density: 19.05,
      meltingPoint: 1132.9,
      boilingPoint: 4131,
      discoveredBy: 'Martin Heinrich Klaproth',
      discoveryYear: 1789,
      description: 'Uranium is a silvery-white metal in the actinide series of the periodic table. It is weakly radioactive because all isotopes of uranium are unstable.',
      commonUses: ['Nuclear energy', 'Nuclear weapons', 'Radiation shielding', 'Aircraft counterweights']
    },
    // More elements would be added in a complete implementation
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
      this.tableZoom = 0.7;
    } else {
      this.tableZoom = 1;
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
    this.tableZoom = Math.max(0.5, Math.min(2, this.tableZoom + amount));
  }
  
  resetZoom(): void {
    this.tableZoom = 1;
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
    // Define positions for each element in the periodic table layout
    // This is a simplified version - a full implementation would have proper positions for all elements
    const positions: {[key: number]: {row: number, col: number}} = {
      1: {row: 1, col: 1},
      2: {row: 1, col: 18},
      3: {row: 2, col: 1},
      6: {row: 2, col: 14},
      8: {row: 2, col: 16},
      11: {row: 3, col: 1},
      17: {row: 3, col: 17},
      26: {row: 4, col: 8},
      29: {row: 4, col: 11},
      47: {row: 5, col: 11},
      79: {row: 6, col: 11},
      80: {row: 6, col: 12},
      82: {row: 6, col: 14},
      92: {row: 7, col: 4}
    };
    
    const position = positions[atomicNumber];
    if (!position) return {gridRow: 1, gridColumn: 1}; // default position
    
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
