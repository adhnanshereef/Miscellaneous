import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface TriviaQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  image?: string;
}

export interface TriviaStats {
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
  lastQuestionDate: string | null;
  questionsPerDay: number[];
}

@Injectable({
  providedIn: 'root'
})
export class TriviaService {
  private readonly STORAGE_KEY = 'hackathon_trivia_data';
  private readonly STATS_KEY = 'hackathon_trivia_stats';
  private readonly API_URL = 'https://opentdb.com/api.php?amount=1&type=multiple';
  
  private triviaBank: TriviaQuestion[] = [
    {
      id: '1',
      question: 'What is the largest planet in our solar system?',
      answer: 'Jupiter',
      options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'],
      category: 'Astronomy',
      difficulty: 'easy',
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8'
    },
    {
      id: '2',
      question: 'Which element has the chemical symbol "Au"?',
      answer: 'Gold',
      options: ['Silver', 'Aluminum', 'Gold', 'Argon'],
      category: 'Chemistry',
      difficulty: 'easy'
    },
    {
      id: '3',
      question: 'In which year did the Titanic sink?',
      answer: '1912',
      options: ['1905', '1912', '1920', '1931'],
      category: 'History',
      difficulty: 'medium'
    },
    {
      id: '4',
      question: 'What is the capital of Japan?',
      answer: 'Tokyo',
      options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
      category: 'Geography',
      difficulty: 'easy'
    },
    {
      id: '5',
      question: 'Who painted the Mona Lisa?',
      answer: 'Leonardo da Vinci',
      options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
      category: 'Art',
      difficulty: 'easy',
      image: 'https://images.unsplash.com/photo-1610708894136-9c667819722d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8'
    },
    {
      id: '6',
      question: 'Which programming language was created by James Gosling?',
      answer: 'Java',
      options: ['Python', 'JavaScript', 'Java', 'C++'],
      category: 'Technology',
      difficulty: 'medium'
    },
    {
      id: '7',
      question: 'What is the hardest natural substance on Earth?',
      answer: 'Diamond',
      options: ['Diamond', 'Titanium', 'Quartz', 'Platinum'],
      category: 'Science',
      difficulty: 'easy'
    },
    {
      id: '8',
      question: 'What year was the first iPhone released?',
      answer: '2007',
      options: ['2005', '2007', '2008', '2010'],
      category: 'Technology',
      difficulty: 'medium'
    },
    {
      id: '9',
      question: 'Which famous scientist developed the theory of relativity?',
      answer: 'Albert Einstein',
      options: ['Isaac Newton', 'Albert Einstein', 'Niels Bohr', 'Stephen Hawking'],
      category: 'Science',
      difficulty: 'easy',
      image: 'https://images.unsplash.com/photo-1621244026805-20d659401e34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8'
    },
    {
      id: '10',
      question: 'What is the main ingredient in traditional guacamole?',
      answer: 'Avocado',
      options: ['Tomato', 'Onion', 'Avocado', 'Mango'],
      category: 'Food',
      difficulty: 'easy'
    }
  ];
  
  constructor(private http: HttpClient) {
    this.loadQuestionsFromStorage();
  }
  
  // Get a new daily question
  getDailyQuestion(): Observable<TriviaQuestion> {
    // Check if we already fetched today's question
    const stats = this.getStats();
    const today = new Date().toLocaleDateString();
    
    if (stats.lastQuestionDate === today) {
      // Return the last question from storage
      const questions = this.loadQuestionsFromStorage();
      const lastQuestion = questions[0] || this.triviaBank[0];
      return of(lastQuestion);
    }
    
    // Try to fetch from API first, fall back to local bank
    return this.http.get(this.API_URL).pipe(
      map((response: any) => {
        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          
          // Format question from API
          const newQuestion: TriviaQuestion = {
            id: Date.now().toString(),
            question: result.question,
            answer: result.correct_answer,
            options: [...result.incorrect_answers, result.correct_answer].sort(() => Math.random() - 0.5),
            category: result.category,
            difficulty: result.difficulty as any
          };
          
          // Save question to storage
          this.saveQuestionToStorage(newQuestion);
          
          // Update stats
          this.updateLastQuestionDate(today);
          
          return newQuestion;
        }
        throw new Error('No results from API');
      }),

      catchError(() => {
        // Fallback to local trivia bank
        const randomIndex = Math.floor(Math.random() * this.triviaBank.length);
        const question = this.triviaBank[randomIndex];
        
        // Save to storage
        this.saveQuestionToStorage({ ...question, id: Date.now().toString() });
        
        // Update stats
        this.updateLastQuestionDate(today);
        
        return of(question);
      })
    );
  }
    // Get all available categories
  getCategories(): string[] {
    const categories = new Set<string>();
    
    this.triviaBank.forEach(question => {
      categories.add(question.category);
    });
    
    return Array.from(categories);
  }
  
  // Get a new question (not date-bound)
  getNewQuestion(): Observable<TriviaQuestion> {
    // Always fetch from API or use random local question
    return this.http.get(this.API_URL).pipe(
      map((response: any) => {
        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          
          // Format question from API
          const newQuestion: TriviaQuestion = {
            id: Date.now().toString(),
            question: this.decodeHtmlEntities(result.question),
            answer: this.decodeHtmlEntities(result.correct_answer),
            options: [
              ...result.incorrect_answers.map((a: string) => this.decodeHtmlEntities(a)),
              this.decodeHtmlEntities(result.correct_answer)
            ].sort(() => Math.random() - 0.5),
            category: result.category,
            difficulty: result.difficulty as any
          };
          
          // Save question to storage
          this.saveQuestionToStorage(newQuestion);
          
          return newQuestion;
        }
        throw new Error('No results from API');
      }),
      catchError(() => {
        // Fallback to local trivia bank
        const randomIndex = Math.floor(Math.random() * this.triviaBank.length);
        const question = { ...this.triviaBank[randomIndex], id: Date.now().toString() };
        
        // Save to storage
        this.saveQuestionToStorage(question);
        
        return of(question);
      })
    );
  }
  
  // Submit an answer and track stats
  submitAnswer(questionId: string, userAnswer: string, correctAnswer: string): boolean {
    const isCorrect = userAnswer === correctAnswer;
    const stats = this.getStats();
    
    stats.questionsAnswered++;
    
    if (isCorrect) {
      stats.correctAnswers++;
      stats.streak++;
    } else {
      stats.streak = 0;
    }
    
    // Update daily questions count
    const today = new Date().getDay(); // 0-6 for Sunday-Saturday
    if (!stats.questionsPerDay[today]) {
      stats.questionsPerDay[today] = 0;
    }
    stats.questionsPerDay[today]++;
    
    // Save updated stats
    this.saveStats(stats);
    
    return isCorrect;
  }
  
  // Get user stats
  getStats(): TriviaStats {
    const defaultStats: TriviaStats = {
      questionsAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      lastQuestionDate: null,
      questionsPerDay: [0, 0, 0, 0, 0, 0, 0] // Sunday to Saturday
    };
    
    const storedStats = localStorage.getItem(this.STATS_KEY);
    
    if (storedStats) {
      try {
        return JSON.parse(storedStats);
      } catch (e) {
        return defaultStats;
      }
    }
    
    return defaultStats;
  }
  
  // Reset stats
  resetStats(): void {
    const defaultStats: TriviaStats = {
      questionsAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      lastQuestionDate: null,
      questionsPerDay: [0, 0, 0, 0, 0, 0, 0]
    };
    
    this.saveStats(defaultStats);
  }
  
  // Private methods
  private loadQuestionsFromStorage(): TriviaQuestion[] {
    const storedQuestions = localStorage.getItem(this.STORAGE_KEY);
    
    if (storedQuestions) {
      try {
        return JSON.parse(storedQuestions);
      } catch (e) {
        return [];
      }
    }
    
    return [];
  }
  
  private saveQuestionToStorage(question: TriviaQuestion): void {
    // Get existing questions
    const questions = this.loadQuestionsFromStorage();
    
    // Add new question to the beginning (most recent)
    questions.unshift(question);
    
    // Keep only the 10 most recent questions
    const recentQuestions = questions.slice(0, 10);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentQuestions));
  }
  
  private saveStats(stats: TriviaStats): void {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }
    private updateLastQuestionDate(date: string): void {
    const stats = this.getStats();
    stats.lastQuestionDate = date;
    this.saveStats(stats);
  }
  
  // Helper method to decode HTML entities in question text
  private decodeHtmlEntities(text: string): string {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  }
}
