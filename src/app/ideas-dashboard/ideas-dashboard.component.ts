import { Component, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteGeneratorComponent } from '../ideas/quote-generator/quote-generator.component';
import { NameGeneratorComponent } from '../ideas/name-generator/name-generator.component';
import { ColorPaletteMakerComponent } from '../ideas/color-palette-maker/color-palette-maker.component';
import { AsciiArtViewerComponent } from '../ideas/ascii-art-viewer/ascii-art-viewer.component';
import { CountdownTimerComponent } from '../ideas/countdown-timer/countdown-timer.component';
import { DailyTriviaComponent } from '../ideas/daily-trivia/daily-trivia.component';
import { LightingVisualizerComponent } from '../ideas/lighting-visualizer/lighting-visualizer.component';
import { PeriodicTableComponent } from '../ideas/periodic-table/periodic-table.component';
import { DataRandomizerVisualizerComponent } from '../ideas/data-randomizer-visualizer/data-randomizer-visualizer.component';
import { InteractiveSoundboardComponent } from '../ideas/interactive-soundboard/interactive-soundboard.component';
import { CursorEffectDirective } from './cursor-effect.directive';

interface HackathonIdea {
  id: string;
  title: string;
  description: string;
  isImplemented: boolean;
  component?: any;
}

@Component({
  selector: 'app-ideas-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    QuoteGeneratorComponent,
    NameGeneratorComponent,
    ColorPaletteMakerComponent,
    AsciiArtViewerComponent,
    CountdownTimerComponent,
    DailyTriviaComponent,
    LightingVisualizerComponent,
    PeriodicTableComponent,
    DataRandomizerVisualizerComponent,
    InteractiveSoundboardComponent,
    CursorEffectDirective
  ],
  templateUrl: './ideas-dashboard.component.html',
  styleUrl: './ideas-dashboard.component.css'
})
export class IdeasDashboardComponent {
  hackathonIdeas: HackathonIdea[] = [
    {
      id: 'periodic-table',
      title: 'Interactive Periodic Table',
      description: 'Explore elements with detailed information on hover and smart filtering.',
      isImplemented: true,
      component: PeriodicTableComponent
    }, {
      id: 'data-randomizer',
      title: 'Data Randomizer Visualizer',
      description: 'Generate random data and visualize it as pie charts, bar graphs, or lists.',
      isImplemented: true,
      component: DataRandomizerVisualizerComponent
    },
    {
      id: 'quote-generator',
      title: 'Random Quote Generator',
      description: 'Get inspired with quotes that fade in beautifully when you click the button.',
      isImplemented: true,
      component: QuoteGeneratorComponent
    }, 
    {
      id: 'name-generator',
      title: 'Name Generator',
      description: 'Generate creative names with a theme switcher for different contexts.',
      isImplemented: true,
      component: NameGeneratorComponent
    }, 
    {
      id: 'color-palette',
      title: 'Color Palette Maker',
      description: 'Create beautiful color palettes with hex codes and easy copy buttons.',
      isImplemented: true,
      component: ColorPaletteMakerComponent
    }, 
    {
      id: 'ascii-art',
      title: 'ASCII Art Viewer',
      description: 'Create, view and share ASCII art with a responsive interface.',
      isImplemented: true,
      component: AsciiArtViewerComponent
    }, 
    {
      id: 'countdown-timer',
      title: 'Countdown Timer',
      description: 'Set a future time and watch the countdown with sound notifications.',
      isImplemented: true,
      component: CountdownTimerComponent
    }, 
    {
      id: 'daily-trivia',
      title: 'Daily Trivia Display',
      description: 'Learn something new every day with interesting trivia facts.',
      isImplemented: true,
      component: DailyTriviaComponent
    }, 
    {
      id: 'soundboard',
      title: 'Interactive Soundboard',
      description: 'Play sounds with hotkeys and see visual waveform representations.',
      isImplemented: true,
      component: InteractiveSoundboardComponent
    },
    {
      id: 'lighting-theme',
      title: 'Lighting Theme Visualizer',
      description: 'Adjust sliders to change the time and brightness of your lighting theme.',
      isImplemented: true,
      component: LightingVisualizerComponent
    }
  ];

  selectedIdea: HackathonIdea | null = null;
  headerInteractive: boolean = false;
  logoHovered: boolean = false;
  scrollPosition: number = 0;
  isMobileDevice: boolean = false;

  @HostBinding('class.mobile-device')
  get isMobile() {
    return this.isMobileDevice;
  }

  // Track scroll position for header effects
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.headerInteractive = this.scrollPosition > 50;
  }

  // Interactive logo effects
  onLogoHover(): void {
    this.logoHovered = true;
  }

  onLogoLeave(): void {
    this.logoHovered = false;
  }

  selectIdea(idea: HackathonIdea): void {
    this.selectedIdea = idea;
  }

  goBack(): void {
    this.selectedIdea = null;
  }

  ngOnInit(): void {
    // Check if device is mobile on initialization
    this.checkIfMobile();
    window.addEventListener('resize', this.checkIfMobile.bind(this));
  }

  ngOnDestroy(): void {
    // Remove event listener
    window.removeEventListener('resize', this.checkIfMobile.bind(this));
  }

  checkIfMobile(): void {
    this.isMobileDevice = window.innerWidth <= 768;
  }
}
