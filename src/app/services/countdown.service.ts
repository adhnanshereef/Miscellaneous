import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

export interface CountdownTimer {
  id: string;
  title: string;
  targetDate: Date;
  createdAt: number;
  color: string;
  sound: string;
  isActive?: boolean;
  isComplete?: boolean;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class CountdownService {
  private readonly STORAGE_KEY = 'countdown_timers';
  
  private activeTimers = new BehaviorSubject<CountdownTimer[]>([]);
  private timerSubscriptions: { [key: string]: Subscription } = {};
  
  // Available notification sounds
  readonly availableSounds = [
    { id: 'bell', name: 'Bell', file: 'bell.mp3' },
    { id: 'chime', name: 'Chime', file: 'chime.mp3' },
    { id: 'digital', name: 'Digital', file: 'digital.mp3' },
    { id: 'gentle', name: 'Gentle', file: 'gentle.mp3' },
    { id: 'none', name: 'None', file: '' }
  ];
  
  constructor() {
    this.loadTimers();
  }
  
  // Get all saved timers
  getTimers(): CountdownTimer[] {
    return this.activeTimers.value;
  }
  
  // Get timers as observable
  getTimersObservable(): Observable<CountdownTimer[]> {
    return this.activeTimers.asObservable();
  }
  
  // Create a new timer
  createTimer(timer: Omit<CountdownTimer, 'id' | 'createdAt'>): CountdownTimer {
    const newTimer: CountdownTimer = {
      ...timer,
      id: 'timer_' + Date.now(),
      createdAt: Date.now(),
      isActive: true,
      isComplete: false
    };
    
    const timers = [...this.activeTimers.value, newTimer];
    this.activeTimers.next(timers);
    this.saveTimers();
    
    // Start tracking this timer if it's not in the past
    if (new Date(newTimer.targetDate).getTime() > Date.now()) {
      this.startTracking(newTimer.id);
    } else {
      // If the date is already in the past, mark as complete
      this.markTimerComplete(newTimer.id);
    }
    
    return newTimer;
  }
  
  // Delete a timer
  deleteTimer(id: string): void {
    // Stop tracking this timer
    this.stopTracking(id);
    
    const timers = this.activeTimers.value.filter(timer => timer.id !== id);
    this.activeTimers.next(timers);
    this.saveTimers();
  }
  
  // Calculate time remaining for a specific timer
  calculateTimeRemaining(targetDate: Date): TimeRemaining {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = Math.max(0, target - now);
    
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    return { days, hours, minutes, seconds, totalSeconds };
  }
  
  // Get observable for countdown updates
  getCountdown(id: string): Observable<TimeRemaining> {
    const timer = this.activeTimers.value.find(t => t.id === id);
    if (!timer) {
      return new Observable<TimeRemaining>();
    }
    
    return interval(1000).pipe(
      map(() => this.calculateTimeRemaining(timer.targetDate)),
      takeWhile(time => time.totalSeconds > 0, true)
    );
  }
  
  // Start tracking a timer
  private startTracking(id: string): void {
    // Stop any existing tracking for this ID
    this.stopTracking(id);
    
    // Create a new subscription
    this.timerSubscriptions[id] = this.getCountdown(id).subscribe(time => {
      if (time.totalSeconds === 0) {
        this.markTimerComplete(id);
        this.playNotificationSound(id);
      }
    });
  }
  
  // Stop tracking a timer
  private stopTracking(id: string): void {
    if (this.timerSubscriptions[id]) {
      this.timerSubscriptions[id].unsubscribe();
      delete this.timerSubscriptions[id];
    }
  }
  
  // Mark timer as complete
  private markTimerComplete(id: string): void {
    const timers = this.activeTimers.value.map(timer => {
      if (timer.id === id) {
        return { ...timer, isComplete: true };
      }
      return timer;
    });
    
    this.activeTimers.next(timers);
    this.saveTimers();
  }
  
  // Toggle timer active state
  toggleTimerActive(id: string): void {
    const timers = this.activeTimers.value.map(timer => {
      if (timer.id === id) {
        return { ...timer, isActive: !timer.isActive };
      }
      return timer;
    });
    
    const timer = timers.find(t => t.id === id);
    if (timer) {
      if (timer.isActive) {
        this.startTracking(id);
      } else {
        this.stopTracking(id);
      }
    }
    
    this.activeTimers.next(timers);
    this.saveTimers();
  }
  
  // Reset timer
  resetTimer(id: string, newTargetDate?: Date): void {
    const timers = this.activeTimers.value.map(timer => {
      if (timer.id === id) {
        return { 
          ...timer, 
          isComplete: false,
          isActive: true,
          targetDate: newTargetDate || timer.targetDate
        };
      }
      return timer;
    });
    
    this.activeTimers.next(timers);
    this.saveTimers();
    
    this.startTracking(id);
  }
  
  // Play notification sound
  playNotificationSound(id: string): void {
    const timer = this.activeTimers.value.find(t => t.id === id);
    if (!timer || timer.sound === 'none') return;
    
    const sound = this.availableSounds.find(s => s.id === timer.sound);
    if (sound && sound.file) {
      const audio = new Audio(`assets/sounds/${sound.file}`);
      audio.play().catch(error => console.warn('Error playing notification sound:', error));
    }
  }
  
  // Load timers from local storage
  private loadTimers(): void {
    const storedTimers = localStorage.getItem(this.STORAGE_KEY);
    if (storedTimers) {
      const timers = JSON.parse(storedTimers) as CountdownTimer[];
      
      // Convert string dates to Date objects
      timers.forEach(timer => {
        timer.targetDate = new Date(timer.targetDate);
        
        // Check if timer should still be active
        if (new Date(timer.targetDate).getTime() > Date.now()) {
          if (timer.isActive) {
            this.startTracking(timer.id);
          }
        } else {
          timer.isComplete = true;
        }
      });
      
      this.activeTimers.next(timers);
    }
  }
  
  // Save timers to local storage
  private saveTimers(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.activeTimers.value));
  }
}
