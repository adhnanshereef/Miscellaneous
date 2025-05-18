import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChildren, QueryList, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TriviaService, TriviaQuestion, TriviaStats } from '../../services/trivia.service';
import { CursorEffectDirective } from '../../ideas-dashboard/cursor-effect.directive';
import { BaseIdeaDirective } from '../base-idea.directive';
import { CursorEffectUtil } from '../cursor-effect-util';

@Component({
  selector: 'app-daily-trivia',
  standalone: true,
  imports: [CommonModule, FormsModule, CursorEffectDirective],
  templateUrl: './daily-trivia.component.html',
  styleUrl: './daily-trivia.component.css',
  animations: [
    trigger('cardFlip', [
      state('question', style({
        transform: 'rotateY(0deg)',
      })),
      state('answer', style({
        transform: 'rotateY(180deg)',
      })),
      transition('question => answer', [
        animate('0.5s ease-in')
      ]),
      transition('answer => question', [
        animate('0.5s ease-out')
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('pulse', [
      state('active', style({
        transform: 'scale(1.05)',
        boxShadow: '0 0 15px rgba(131, 56, 236, 0.8)'
      })),
      state('inactive', style({
        transform: 'scale(1)',
        boxShadow: '0 0 5px rgba(131, 56, 236, 0.3)'
      })),
      transition('inactive => active', animate('300ms ease-in')),
      transition('active => inactive', animate('300ms ease-out'))
    ])
  ]
})
export class DailyTriviaComponent extends BaseIdeaDirective implements OnInit, OnDestroy, AfterViewInit {
  // Data
  currentQuestion: TriviaQuestion | null = null;
  stats: TriviaStats = {
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    lastQuestionDate: null,
    questionsPerDay: [0, 0, 0, 0, 0, 0, 0]
  };
  
  // UI State
  cardState: 'question' | 'answer' = 'question';
  selectedAnswer: string | null = null;
  isCorrect: boolean | null = null;
  isLoading: boolean = true;
  confetti: any[] = [];
  
  // Animation timers
  answerTimeout: any;
  loadingTimeout: any;
  confettiInterval: any;
  
  // Device
  isMobile: boolean = false;
  // We don't need to redeclare cursorEffects as it's already in BaseIdeaDirective
  
  constructor(
    private triviaService: TriviaService,
    elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    super(elementRef);
  }
    override ngOnInit(): void {
    // Call parent ngOnInit for base functionality
    super.ngOnInit();
    
    this.checkDeviceSize();
    this.stats = this.triviaService.getStats();
    this.loadDailyQuestion();
    
    window.addEventListener('resize', this.checkDeviceSize.bind(this));
  }
    override ngAfterViewInit(): void {
    // Call parent ngAfterViewInit for base functionality
    super.ngAfterViewInit();
    
    // Ensure cursor effects are applied
    setTimeout(() => {
      this.refreshCursorEffects();
      
      // Apply cursor effects to interactive elements
      CursorEffectUtil.applyToInteractiveElements(
        this.elementRef!, 
        this.renderer, 
        'button, .card, .interactive, [role="button"], .trivia-card, .answer-option'
      );
      
      // Subscribe to cursor effects changes
      if (this.cursorEffects) {
        this.cursorEffects.changes.subscribe(() => {
          this.refreshCursorEffects();
        });
      }
    });
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkDeviceSize.bind(this));
    
    if (this.answerTimeout) {
      clearTimeout(this.answerTimeout);
    }
    
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
    }
  }
  
  checkDeviceSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }
  
  loadDailyQuestion(): void {
    this.isLoading = true;
    this.cardState = 'question';
    this.selectedAnswer = null;
    this.isCorrect = null;
    
    this.loadingTimeout = setTimeout(() => {
      this.triviaService.getDailyQuestion().subscribe({
        next: (question) => {
          this.currentQuestion = question;
          this.isLoading = false;
          this.stats = this.triviaService.getStats();
        },
        error: () => {
          console.error('Error loading trivia question');
          this.isLoading = false;
        }
      });
    }, 800); // Add a slight delay for better UX
  }
  
  selectAnswer(answer: string): void {
    if (this.cardState === 'answer' || this.isLoading || !this.currentQuestion) {
      return;
    }
    
    this.selectedAnswer = answer;
    const isCorrect = answer === this.currentQuestion.answer;
    this.isCorrect = isCorrect;
    
    if (this.currentQuestion) {
      this.triviaService.submitAnswer(
        this.currentQuestion.id,
        answer,
        this.currentQuestion.answer
      );
    }
    
    // Update stats after submitting
    this.stats = this.triviaService.getStats();
    
    this.answerTimeout = setTimeout(() => {
      this.cardState = 'answer';
      
      if (isCorrect) {
        setTimeout(() => this.showConfetti(), 500);
      }
    }, 500);
  }
  getNewQuestion(): void {
    this.isLoading = true;
    this.cardState = 'question';
    this.selectedAnswer = null;
    this.isCorrect = null;
    
    // Clear any existing timeouts
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    
    this.loadingTimeout = setTimeout(() => {
      // Use the trivia service's getNewQuestion method
      this.triviaService.getNewQuestion().subscribe({
        next: (question) => {
          this.currentQuestion = question;
          this.isLoading = false;
          this.stats = this.triviaService.getStats();
        },
        error: () => {
          console.error('Error loading new trivia question');
          this.isLoading = false;
        }
      });
    }, 800); // Add a slight delay for better UX
  }
  
  getAccuracyPercentage(): number {
    if (this.stats.questionsAnswered === 0) return 0;
    return Math.round((this.stats.correctAnswers / this.stats.questionsAnswered) * 100);
  }
  
  getDayName(index: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index];
  }
  
  // Find the highest value in questionsPerDay for scaling
  getMaxDailyQuestions(): number {
    return Math.max(...this.stats.questionsPerDay, 1);
  }
  
  // Calculate bar height based on the number of questions that day
  getBarHeight(questions: number): string {
    const max = this.getMaxDailyQuestions();
    const percentage = (questions / max) * 100;
    return `${Math.max(percentage, 5)}%`;
  }
  
  resetStats(): void {
    if (confirm('Are you sure you want to reset all trivia stats?')) {
      this.triviaService.resetStats();
      this.stats = this.triviaService.getStats();
    }
  }
    /**
   * Refreshes and applies cursor effects to all interactive elements
   */
  protected override refreshCursorEffects(): void {
    // Call the parent method first
    super.refreshCursorEffects();
    
    if (!this.elementRef || !this.elementRef.nativeElement) return;
    
    // Find all interactive elements
    const interactiveElements = this.elementRef.nativeElement.querySelectorAll(
      'button, a, input, select, [role="button"], [tabindex], .card, .interactive, .answer-option, .trivia-card'
    );
    
    // Apply cursor:none to all interactive elements
    interactiveElements.forEach((element: Element) => {
      if (element instanceof HTMLElement) {
        this.renderer.setStyle(element, 'cursor', 'none');
      }
    });
  }
  
  showConfetti(): void {
    // Create confetti effect
    const confettiContainer = document.querySelector('.confetti-container');
    if (!confettiContainer) return;
    
    const colors = ['#8338EC', '#3A86FF', '#FF006E', '#FB5607', '#FFBE0B'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.left = `${left}%`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        
        confettiContainer.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
          confetti.remove();
        }, 5000);
      }, i * 20);
    }
  }
}
