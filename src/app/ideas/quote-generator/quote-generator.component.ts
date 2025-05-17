import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteService } from '../../services/quote.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-quote-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote-generator.component.html',
  styleUrl: './quote-generator.component.css',
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in')
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class QuoteGeneratorComponent {
  quoteText: string = '';
  quoteAuthor: string = '';
  isVisible: boolean = true;

  constructor(private quoteService: QuoteService) {
    this.getNewQuote();
  }

  getNewQuote(): void {
    this.isVisible = false;
    
    // Short delay to allow animation to complete
    setTimeout(() => {
      const quote = this.quoteService.getRandomQuote();
      this.quoteText = quote.text;
      this.quoteAuthor = quote.author;
      this.isVisible = true;
    }, 600);
  }
}
