import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Sound {
  id: string;
  name: string;
  file: string;
  color: string;
  hotkey?: string;
  description?: string;
  category?: 'effects' | 'alert' | 'music' | 'voice' | 'ambient';
  duration?: number;
}

export interface SoundPlayEvent {
  soundId: string;
  timestamp: number;
  volume: number;
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {  // Collection of available sounds
  private sounds: Sound[] = [
    { 
      id: 'bell', 
      name: 'Bell', 
      file: 'bell.mp3', 
      color: '#8338EC', 
      hotkey: '1', 
      description: 'A clear bell sound',
      category: 'alert', 
      duration: 2.1 
    },
    { 
      id: 'chime', 
      name: 'Chime', 
      file: 'chime.mp3', 
      color: '#3A86FF', 
      hotkey: '2', 
      description: 'Pleasant chime notification',
      category: 'effects', 
      duration: 1.5 
    },
    { 
      id: 'digital', 
      name: 'Digital', 
      file: 'digital.mp3', 
      color: '#FF006E', 
      hotkey: '3', 
      description: 'Modern digital tone',
      category: 'effects', 
      duration: 1.2 
    },
    { 
      id: 'gentle', 
      name: 'Gentle', 
      file: 'gentle.mp3', 
      color: '#4CC9F0', 
      hotkey: '4', 
      description: 'Soft gentle reminder',
      category: 'ambient', 
      duration: 2.8 
    },
    { 
      id: 'alert', 
      name: 'Alert', 
      file: 'alert.mp3', 
      color: '#F72585', 
      hotkey: '5', 
      description: 'Attention-grabbing alert sound',
      category: 'alert', 
      duration: 2.1 
    },
    { 
      id: 'notification', 
      name: 'Notification', 
      file: 'notification.mp3', 
      color: '#7209B7', 
      hotkey: '6', 
      description: 'Subtle notification sound',
      category: 'effects', 
      duration: 1.5 
    },
    { 
      id: 'beep', 
      name: 'Beep', 
      file: 'beep.mp3', 
      color: '#3F8EFC', 
      hotkey: '7', 
      description: 'Short electronic beep',
      category: 'effects', 
      duration: 1.2 
    },
    { 
      id: 'soft', 
      name: 'Soft Tone', 
      file: 'soft.mp3', 
      color: '#80FFDB', 
      hotkey: '8', 
      description: 'Soft ambient tone',
      category: 'ambient', 
      duration: 2.8 
    }
  ];
  
  // Audio instances cache
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  
  // For volume control
  private volumeLevel: number = 0.75;
  
  // Observable for sound playing events
  private soundPlayingSource = new Subject<SoundPlayEvent>();
  soundPlaying$ = this.soundPlayingSource.asObservable();
  
  // Currently selected sound
  private selectedSoundSource = new BehaviorSubject<Sound | null>(null);
  selectedSound$ = this.selectedSoundSource.asObservable();
  
  constructor() {
    // Preload audio files
    this.preloadSounds();
  }
  
  /**
   * Get all available sounds
   */
  getSounds(): Sound[] {
    return [...this.sounds];
  }
  
  /**
   * Get a specific sound by ID
   */
  getSound(id: string): Sound | undefined {
    return this.sounds.find(sound => sound.id === id);
  }
  
  /**
   * Play a sound by its ID
   */
  playSound(id: string): void {
    const sound = this.getSound(id);
    if (!sound) return;
    
    let audio = this.audioCache.get(id);
      if (!audio) {
      // If not cached, create and cache it
      audio = new Audio(`assets/sounds/${sound.file}`);
      this.audioCache.set(id, audio);
    }
    
    // Reset the audio to beginning if it's already playing
    audio.pause();
    audio.currentTime = 0;
    
    // Set volume and play
    audio.volume = this.volumeLevel;
    audio.play()
      .then(() => {
        // Emit the sound playing event
        this.soundPlayingSource.next({
          soundId: id,
          timestamp: Date.now(),
          volume: audio!.volume
        });
      })
      .catch(error => {
        console.error('Error playing sound:', error);
      });
  }
  
  /**
   * Set the currently selected sound
   */
  selectSound(sound: Sound | null): void {
    this.selectedSoundSource.next(sound);
  }
  
  /**
   * Set volume level for all sounds
   */
  setVolume(volume: number): void {
    this.volumeLevel = Math.max(0, Math.min(1, volume));
    
    // Update volume for any cached audio elements
    this.audioCache.forEach(audio => {
      audio.volume = this.volumeLevel;
    });
  }
  
  /**
   * Get the current volume level
   */
  getVolume(): number {
    return this.volumeLevel;
  }
  
  /**
   * Preload sound files for better performance
   */  private preloadSounds(): void {
    this.sounds.forEach(sound => {
      const audio = new Audio(`assets/sounds/${sound.file}`);
      audio.load();
      this.audioCache.set(sound.id, audio);
    });
  }
}
