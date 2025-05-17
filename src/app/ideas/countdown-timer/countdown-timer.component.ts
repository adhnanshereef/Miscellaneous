import { Component, OnInit, OnDestroy, HostListener, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { CountdownService, CountdownTimer, TimeRemaining } from '../../services/countdown.service';
import { CursorEffectDirective } from '../../ideas-dashboard/cursor-effect.directive';
import { Subscription } from 'rxjs';
import { CursorEffectUtil } from '../cursor-effect-util';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule, FormsModule, CursorEffectDirective],
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.css'],
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
export class CountdownTimerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren(CursorEffectDirective) cursorEffects!: QueryList<CursorEffectDirective>;
  
  // Timer data
  timers: CountdownTimer[] = [];
  timerStates: { [key: string]: TimeRemaining } = {};
  
  // Form data
  newTimer: Partial<CountdownTimer> = {
    title: '',
    targetDate: new Date(Date.now() + 86400000), // Default to tomorrow
    color: '#6a11cb',
    sound: 'bell'
  };
  
  // UI state
  viewMode: 'grid' | 'list' = 'grid';
  showNewTimerForm: boolean = false;
  isMobile: boolean = false;
  isSoundPlaying: boolean = false;
  resizeTimeout: any;
  
  // Cursor effect utilities
  private cursorEffectUtil: CursorEffectUtil = new CursorEffectUtil();
  
  // Subscriptions
  private timerSubscriptions: { [key: string]: Subscription } = {};
  private timersSubscription?: Subscription;
  
  get minDate(): string {
    const now = new Date();
    return now.toISOString().split('.')[0];
  }
  
  get availableSounds() {
    return this.countdownService.availableSounds;
  }
  
  constructor(private countdownService: CountdownService) { }
  
  ngOnInit(): void {
    this.loadTimers();
    this.checkDeviceSize();
    
    // Subscribe to timer changes
    this.timersSubscription = this.countdownService.getTimersObservable()
      .subscribe(timers => {
        this.timers = timers;
        
        // Subscribe to new timers
        timers.forEach(timer => {
          if (!this.timerSubscriptions[timer.id]) {
            this.subscribeToTimer(timer.id);
          }
        });
      });
  }
  
  ngAfterViewInit(): void {
    // Set up cursor effects after the view is initialized
    setTimeout(() => {
      // Apply cursor effect to dynamically created elements
      this.refreshCursorEffects();
      
      // Subscribe to cursor effects changes (when elements are added/removed)
      this.cursorEffects.changes.subscribe(() => {
        this.refreshCursorEffects();
      });
    });
  }
  
  // Refresh and synchronize cursor effects
  private refreshCursorEffects(): void {
    // Apply cursor effects to any elements that might have been missed
    const interactiveElements = document.querySelectorAll(
      '.countdown-container button, .countdown-container [role="button"], .timer-card'
    );
    
    interactiveElements.forEach((element: Element) => {
      if (element instanceof HTMLElement && !element.hasAttribute('appCursorEffect')) {
        // Set cursor style to none for all interactive elements
        element.style.cursor = 'none';
      }
    });
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.timersSubscription) {
      this.timersSubscription.unsubscribe();
    }
    
    Object.values(this.timerSubscriptions).forEach(sub => sub.unsubscribe());
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
  
  // Set view mode
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }
  
  // Load timers
  loadTimers(): void {
    this.timers = this.countdownService.getTimers();
    
    // Initialize timer states
    this.timers.forEach(timer => {
      this.subscribeToTimer(timer.id);
    });
  }
  
  // Subscribe to timer updates
  private subscribeToTimer(id: string): void {
    // Clean up existing subscription first
    if (this.timerSubscriptions[id]) {
      this.timerSubscriptions[id].unsubscribe();
    }
    
    this.timerSubscriptions[id] = this.countdownService.getCountdown(id)
      .subscribe(time => {
        this.timerStates[id] = time;
      });
  }
  
  // Create a new timer
  createTimer(): void {
    if (this.isValidTimer(this.newTimer)) {
      const newTimer = this.countdownService.createTimer({
        title: this.newTimer.title!,
        targetDate: new Date(this.newTimer.targetDate!),
        color: this.newTimer.color!,
        sound: this.newTimer.sound!
      });
      
      // Reset form
      this.newTimer = {
        title: '',
        targetDate: new Date(Date.now() + 86400000),
        color: '#6a11cb',
        sound: 'bell'
      };
      
      this.showNewTimerForm = false;
      
      // Subscribe to the new timer
      this.subscribeToTimer(newTimer.id);
    }
  }
  
  // Toggle timer active state
  toggleTimer(id: string): void {
    this.countdownService.toggleTimerActive(id);
  }
  
  // Delete a timer
  deleteTimer(id: string): void {
    if (confirm('Are you sure you want to delete this timer?')) {
      // Clean up subscription
      if (this.timerSubscriptions[id]) {
        this.timerSubscriptions[id].unsubscribe();
        delete this.timerSubscriptions[id];
      }
      
      this.countdownService.deleteTimer(id);
    }
  }
  
  // Reset a timer
  resetTimer(id: string): void {
    const timer = this.timers.find(t => t.id === id);
    if (timer) {
      this.countdownService.resetTimer(id);
    }
  }
    // Preview sound
  previewSound(soundId: string | undefined): void {
    if (this.isSoundPlaying || !soundId) return;
    
    const sound = this.availableSounds.find(s => s.id === soundId);
    if (sound && sound.file) {
      this.isSoundPlaying = true;
      
      const audio = new Audio(`assets/sounds/${sound.file}`);
      audio.onended = () => {
        this.isSoundPlaying = false;
      };
      
      audio.play().catch(error => {
        console.warn('Error playing sound preview:', error);
        this.isSoundPlaying = false;
      });
    }
  }
  
  // Check if timer data is valid
  isValidTimer(timer: Partial<CountdownTimer>): boolean {
    return !!(
      timer.title && 
      timer.title.trim() !== '' && 
      timer.targetDate && 
      new Date(timer.targetDate).getTime() > Date.now() &&
      timer.color &&
      timer.sound
    );
  }
  
  // Format date for display
  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }
  
  // Get sound name
  getSoundName(soundId: string): string {
    const sound = this.availableSounds.find(s => s.id === soundId);
    return sound ? sound.name : 'Unknown';
  }
  
  // Calculate progress percentage (time elapsed / total time)
  calculateProgress(timer: CountdownTimer): number {
    const now = Date.now();
    const start = timer.createdAt;
    const end = new Date(timer.targetDate).getTime();
    
    // If timer is complete, return 100%
    if (timer.isComplete) return 100;
    
    // If timer is in the future, calculate percentage
    if (end > now) {
      const totalDuration = end - start;
      const elapsed = now - start;
      return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }
    
    return 0;
  }
}
