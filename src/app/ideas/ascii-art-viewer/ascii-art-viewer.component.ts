import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AsciiArtService, AsciiArt } from '../../services/ascii-art.service';

@Component({
  selector: 'app-ascii-art-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ascii-art-viewer.component.html',
  styleUrl: './ascii-art-viewer.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class AsciiArtViewerComponent implements OnInit {
  // Collection data
  allArt: AsciiArt[] = [];
  filteredArt: AsciiArt[] = [];
  categories: string[] = [];
  
  // UI state
  viewMode: 'grid' | 'list' = 'grid';
  expandedArtId: string | null = null;
  copiedArtId: string | null = null;
  showNewArtForm: boolean = false;
  isMobile: boolean = false;
  resizeTimeout: any;
  copyTimeout: any;
  
  // Filters
  searchTerm: string = '';
  selectedCategory: string = '';
  
  // New art form
  newArt: Partial<AsciiArt> = {
    title: '',
    category: '',
    content: ''
  };
  
  constructor(private asciiArtService: AsciiArtService) { }
  
  ngOnInit(): void {
    this.loadArt();
    this.checkDeviceSize();
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
    
    // Switch to list view on small screens
    if (this.isMobile && this.viewMode === 'grid') {
      this.viewMode = 'list';
    }
  }
  
  loadArt(): void {
    this.allArt = this.asciiArtService.getAsciiArt();
    this.categories = this.asciiArtService.getCategories();
    this.filterArt();
  }
  
  filterArt(): void {
    this.filteredArt = this.allArt.filter(art => {
      const matchesSearch = !this.searchTerm || 
        art.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || 
        art.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }
  
  toggleExpand(id: string): void {
    if (this.expandedArtId === id) {
      this.expandedArtId = null;
    } else {
      this.expandedArtId = id;
    }
  }
  
  toggleFavorite(id: string): void {
    if (this.asciiArtService.toggleFavorite(id)) {
      this.loadArt();
    }
  }
  
  copyArt(content: string, id: string): void {
    navigator.clipboard.writeText(content).then(() => {
      this.copiedArtId = id;
      
      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }
      
      this.copyTimeout = setTimeout(() => {
        this.copiedArtId = null;
      }, 1500);
    });
  }
  
  deleteArt(id: string): void {
    if (confirm('Are you sure you want to delete this ASCII art?')) {
      if (this.asciiArtService.deleteAsciiArt(id)) {
        this.loadArt();
        if (this.expandedArtId === id) {
          this.expandedArtId = null;
        }
      }
    }
  }
  
  saveNewArt(): void {
    if (this.newArt.title && this.newArt.category && this.newArt.content) {
      this.asciiArtService.addAsciiArt({
        title: this.newArt.title,
        category: this.newArt.category,
        content: this.newArt.content
      });
      
      // Reset form
      this.newArt = {
        title: '',
        category: '',
        content: ''
      };
      
      this.showNewArtForm = false;
      this.loadArt();
    }
  }
  
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
}
