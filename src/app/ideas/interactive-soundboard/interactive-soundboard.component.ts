import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, HostListener, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BaseIdeaDirective } from '../base-idea.directive';
import { CursorEffectDirective } from '../../ideas-dashboard/cursor-effect.directive';
import { CursorEffectUtil } from '../cursor-effect-util';
import { Sound, SoundService, SoundPlayEvent } from '../../services/sound.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-interactive-soundboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CursorEffectDirective],
  templateUrl: './interactive-soundboard.component.html',
  styleUrl: './interactive-soundboard.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('ripple', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0.5 }),
        animate('1s cubic-bezier(0, 0.55, 0.45, 1)', 
          style({ transform: 'scale(2)', opacity: 0 }))
      ])
    ])
  ]
})
export class InteractiveSoundboardComponent extends BaseIdeaDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('soundboardCanvas') soundboardCanvas!: ElementRef<HTMLCanvasElement>;
  
  // Sound data
  sounds: Sound[] = [];
  selectedSound: Sound | null = null;
  lastPlayedSound: Sound | null = null;
  filteredSounds: Sound[] = [];
  
  // Categories for filtering
  categories: {id: string | 'all', name: string}[] = [
    { id: 'all', name: 'All Sounds' },
    { id: 'effects', name: 'Sound Effects' },
    { id: 'alert', name: 'Alerts & Notifications' },
    { id: 'ambient', name: 'Ambient' },
    { id: 'music', name: 'Music' },
    { id: 'voice', name: 'Voice' }
  ];
  
  selectedCategory: string = 'all';
  searchTerm: string = '';
  
  // UI control
  volume: number = 75; // 0-100 range for UI
  isMobile: boolean = false;
  helpVisible: boolean = false;
  
  // Canvas context and animation
  canvasCtx: CanvasRenderingContext2D | null = null;
  waveformData: number[] = [];
  animationFrame: number = 0;
  
  // Subscriptions for cleanup
  private soundPlaySub: Subscription | null = null;
  private selectedSoundSub: Subscription | null = null;

  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2,
    private soundService: SoundService
  ) {
    super(elementRef);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    
    // Get all sounds from service
    this.sounds = this.soundService.getSounds();
    this.filteredSounds = [...this.sounds];
    
    // Initially select the first sound
    if (this.sounds.length > 0) {
      this.selectSound(this.sounds[0]);
    }
    
    // Set the volume from service
    this.volume = this.soundService.getVolume() * 100;
    
    // Subscribe to sound playing events
    this.soundPlaySub = this.soundService.soundPlaying$.subscribe(
      (event: SoundPlayEvent) => this.handleSoundPlaying(event)
    );
    
    // Subscribe to selected sound changes
    this.selectedSoundSub = this.soundService.selectedSound$.subscribe(
      (sound: Sound | null) => {
        this.selectedSound = sound;
      }
    );
    
    // Check if device is mobile
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile.bind(this));
  }
  
  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    
    // Initialize canvas for waveform visualization
    setTimeout(() => {
      this.initializeCanvas();
      this.refreshCursorEffects();
    }, 200);
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.soundPlaySub) {
      this.soundPlaySub.unsubscribe();
    }
    
    if (this.selectedSoundSub) {
      this.selectedSoundSub.unsubscribe();
    }
    
    // Clean up event listeners
    window.removeEventListener('resize', this.checkIfMobile.bind(this));
    
    // Cancel animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
  
  protected override refreshCursorEffects(): void {
    // Call the parent method first
    super.refreshCursorEffects();
    
    if (!this.elementRef || !this.elementRef.nativeElement) return;
    
    // Find all interactive elements
    CursorEffectUtil.applyToInteractiveElements(
      this.elementRef, 
      this.renderer, 
      'button, input[type="range"], .sound-pad, .category-filter, .help-button'
    );
  }
  
  /**
   * Initialize the canvas for waveform display
   */
  initializeCanvas(): void {
    if (!this.soundboardCanvas) return;
    
    const canvas = this.soundboardCanvas.nativeElement;
    this.canvasCtx = canvas.getContext('2d');
    
    if (!this.canvasCtx) return;
    
    // Set initial canvas dimensions
    this.resizeCanvas();
    
    // Start the animation loop
    this.animateWaveform();
  }
  
  /**
   * Handle window resize
   */
  @HostListener('window:resize', [])
  onResize(): void {
    this.checkIfMobile();
    this.resizeCanvas();
  }
  
  /**
   * Resize the canvas to fill its container
   */
  resizeCanvas(): void {
    if (!this.canvasCtx || !this.soundboardCanvas) return;
    
    const canvas = this.soundboardCanvas.nativeElement;
    const container = canvas.parentElement;
    
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }
  
  /**
   * Create and animate the audio waveform
   */
  animateWaveform(): void {
    if (!this.canvasCtx || !this.soundboardCanvas) return;
    
    const canvas = this.soundboardCanvas.nativeElement;
    const ctx = this.canvasCtx;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // If we have a selected sound, draw its waveform
    if (this.selectedSound) {
      // Generate waveform data if we don't have it
      if (this.waveformData.length === 0) {
        this.generateWaveformData(canvas.width);
      }
      
      // Draw the waveform
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      
      const soundColor = this.selectedSound.color || '#3A86FF';
      
      // Choose color based on sound
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, this.adjustColor(soundColor, -30));
      gradient.addColorStop(0.5, soundColor);
      gradient.addColorStop(1, this.adjustColor(soundColor, 30));
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      
      // Draw each point of the waveform
      const centerY = canvas.height / 2;
      const scale = canvas.height / 4; // Scale factor for amplitude
      
      for (let i = 0; i < this.waveformData.length; i++) {
        const x = (i / this.waveformData.length) * canvas.width;
        const y = centerY + this.waveformData[i] * scale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }
    
    // Continue the animation loop
    this.animationFrame = requestAnimationFrame(() => this.animateWaveform());
  }
  
  /**
   * Generate random waveform data for visualization
   * In a real app, this would use actual audio analysis
   */
  generateWaveformData(points: number): void {
    this.waveformData = [];
    
    // Generate some random but smooth data
    let lastValue = 0;
    for (let i = 0; i < points; i++) {
      // Generate a value that's somewhat related to the previous value
      // for a more realistic waveform
      const change = (Math.random() - 0.5) * 0.2;
      lastValue = Math.max(-1, Math.min(1, lastValue + change));
      this.waveformData.push(lastValue);
    }
  }
  
  /**
   * Handle when a sound is played
   */
  handleSoundPlaying(event: SoundPlayEvent): void {
    const sound = this.sounds.find(s => s.id === event.soundId);
    if (sound) {
      this.lastPlayedSound = sound;
      
      // Generate new waveform data for visualization
      if (this.canvasCtx && this.soundboardCanvas) {
        this.generateWaveformData(this.soundboardCanvas.nativeElement.width);
      }
    }
  }
  
  /**
   * Play a sound by id
   */
  playSound(sound: Sound): void {
    this.soundService.playSound(sound.id);
    this.selectSound(sound);
  }
  
  /**
   * Select a sound
   */
  selectSound(sound: Sound): void {
    this.soundService.selectSound(sound);
  }
  
  /**
   * Handle volume changes
   */
  onVolumeChange(): void {
    // Convert 0-100 range to 0-1
    this.soundService.setVolume(this.volume / 100);
  }
  
  /**
   * Filter sounds by category
   */
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }
  
  /**
   * Handle search term changes
   */
  onSearchChange(): void {
    this.applyFilters();
  }
  
  /**
   * Apply both category and search filters
   */
  applyFilters(): void {
    this.filteredSounds = this.sounds.filter(sound => {
      // Check category
      const categoryMatch = this.selectedCategory === 'all' || 
                           sound.category === this.selectedCategory;
      
      // Check search term
      const searchMatch = !this.searchTerm || 
                         sound.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         (sound.description && sound.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return categoryMatch && searchMatch;
    });
  }
  
  /**
   * Handle keyboard hotkeys
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Only handle key events when not typing in an input
    if (event.target instanceof HTMLInputElement) return;
    
    // Check if the pressed key matches any sound hotkey
    const sound = this.sounds.find(s => s.hotkey && s.hotkey === event.key);
    if (sound) {
      this.playSound(sound);
    }
  }
  
  /**
   * Check if device is mobile
   */
  checkIfMobile(): void {
    this.isMobile = window.innerWidth < 768;
  }
  
  /**
   * Toggle help display
   */
  toggleHelp(): void {
    this.helpVisible = !this.helpVisible;
  }
  
  /**
   * Adjust color brightness
   * Used for generating gradient colors
   */
  adjustColor(color: string, amount: number): string {
    let hexColor = color;
    
    // If the color is not a hex color, return it as is
    if (!color.startsWith('#')) return color;
    
    // Remove # if present
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
    }
    
    // Convert to RGB
    let r = parseInt(hexColor.slice(0, 2), 16);
    let g = parseInt(hexColor.slice(2, 4), 16);
    let b = parseInt(hexColor.slice(4, 6), 16);
    
    // Adjust each component
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
