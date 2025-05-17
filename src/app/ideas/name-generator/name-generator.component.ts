import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NameService, NameTheme, GeneratedName } from '../../services/name.service';

@Component({
  selector: 'app-name-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './name-generator.component.html',
  styleUrls: ['./name-generator.component.css'],  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('expandCollapse', [
      transition(':enter', [
        style({ opacity: 0, height: '0px', overflow: 'hidden' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, height: '*', overflow: 'hidden' }),
        animate('300ms ease-in', style({ opacity: 0, height: '0px' }))
      ])
    ])
  ]
})
export class NameGeneratorComponent implements OnInit, OnDestroy {
  themes: NameTheme[] = [];
  selectedTheme: NameTheme | null = null;
  generatedName: { firstName: string, lastName: string } | null = null;
  copySuccess: boolean = false;
  isMobile: boolean = false;
  copyTimeout: any;
  resizeTimeout: any;
  favoriteNames: GeneratedName[] = [];
  showFavorites: boolean = false;
  favoriteSuccess: boolean = false;
  favoriteTimeout: any;

  constructor(private nameService: NameService) { }
  ngOnInit(): void {
    this.checkDeviceSize();
    this.themes = this.nameService.getThemes();
    this.loadFavorites();
    
    // Pre-select first theme for better UX
    if (this.themes.length > 0) {
      setTimeout(() => {
        this.selectTheme(this.themes[0]);
        this.generateNewName();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.favoriteTimeout) {
      clearTimeout(this.favoriteTimeout);
    }
  }
  
  loadFavorites(): void {
    this.favoriteNames = this.nameService.getFavorites();
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
  }

  selectTheme(theme: NameTheme): void {
    this.selectedTheme = theme;
    // Generate name if none exists for this theme
    if (!this.generatedName) {
      this.generateNewName();
    }
  }

  generateNewName(): void {
    if (this.selectedTheme) {
      this.generatedName = this.nameService.generateName(this.selectedTheme.id);
    }
  }

  copyToClipboard(): void {
    if (!this.generatedName) return;
    
    const fullName = `${this.generatedName.firstName} ${this.generatedName.lastName}`;
    navigator.clipboard.writeText(fullName).then(() => {
      this.copySuccess = true;
      
      // Clear previous timeout if exists
      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }
      
      // Hide notification after 2 seconds
      this.copyTimeout = setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    });
  }
  
  copyNameToClipboard(name: GeneratedName): void {
    const fullName = `${name.firstName} ${name.lastName}`;
    navigator.clipboard.writeText(fullName).then(() => {
      this.copySuccess = true;
      
      // Clear previous timeout if exists
      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }
      
      // Hide notification after 2 seconds
      this.copyTimeout = setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    });
  }
  
  addToFavorites(): void {
    if (!this.generatedName || !this.selectedTheme) return;
    
    this.nameService.saveFavorite(this.generatedName, this.selectedTheme.id);
    this.loadFavorites();
    
    this.favoriteSuccess = true;
    
    // Clear previous timeout if exists
    if (this.favoriteTimeout) {
      clearTimeout(this.favoriteTimeout);
    }
    
    // Hide notification after 2 seconds
    this.favoriteTimeout = setTimeout(() => {
      this.favoriteSuccess = false;
    }, 2000);
  }
  
  removeFavorite(index: number): void {
    this.nameService.removeFavorite(index);
    this.loadFavorites();
  }
  
  toggleFavorites(): void {
    this.showFavorites = !this.showFavorites;
  }
  
  getThemeName(themeId: string): string {
    const theme = this.nameService.getTheme(themeId);
    return theme ? theme.name : 'Unknown';
  }
  
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
}
