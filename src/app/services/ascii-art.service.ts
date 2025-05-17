import { Injectable } from '@angular/core';

export interface AsciiArt {
  id: string;
  title: string;
  content: string;
  category: string;
  date: number;
  favorite?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AsciiArtService {
  private readonly STORAGE_KEY = 'ascii_art_collection';
  
  // Sample ASCII art collection
  private defaultArt: AsciiArt[] = [
    {
      id: 'art_1',
      title: 'Tree',
      category: 'Nature',
      date: Date.now(),
      content: 
`    *
   ***
  *****
 *******
*********
    |
    |`
    },
    {
      id: 'art_2',
      title: 'Cat',
      category: 'Animals',
      date: Date.now() - 86400000, // 1 day ago
      content:
` /\\_/\\
( o.o )
 > ^ <`
    },
    {
      id: 'art_3',
      title: 'House',
      category: 'Buildings',
      date: Date.now() - 172800000, // 2 days ago
      content:
`  /\\
 /  \\
/____\\
|    |
|____|`
    },
    {
      id: 'art_4',
      title: 'Space Shuttle',
      category: 'Transportation',
      date: Date.now() - 259200000, // 3 days ago
      content: 
`    /\\
   /  \\
  |    |
 /|    |\\
/ |    | \\
  |    |
  |    |
 /|    |\\
/ |____| \\
  ------
   ####`
    },
    {
      id: 'art_5',
      title: 'Heart',
      category: 'Symbols',
      date: Date.now() - 345600000, // 4 days ago
      content: 
` /\\  /\\
(  \\/  )
 \\____/`
    }
  ];

  constructor() { }

  // Get all ASCII art
  getAsciiArt(): AsciiArt[] {
    const storedArt = localStorage.getItem(this.STORAGE_KEY);
    if (storedArt) {
      return JSON.parse(storedArt);
    } else {
      // Initialize with default art
      this.saveAsciiArt(this.defaultArt);
      return this.defaultArt;
    }
  }

  // Get a specific ASCII art by ID
  getArtById(id: string): AsciiArt | undefined {
    const allArt = this.getAsciiArt();
    return allArt.find(art => art.id === id);
  }

  // Add new ASCII art
  addAsciiArt(art: Omit<AsciiArt, 'id' | 'date'>): AsciiArt {
    const allArt = this.getAsciiArt();
    const newArt: AsciiArt = {
      ...art,
      id: 'art_' + Date.now(),
      date: Date.now()
    };
    
    allArt.push(newArt);
    this.saveAsciiArt(allArt);
    return newArt;
  }

  // Update existing ASCII art
  updateAsciiArt(art: AsciiArt): boolean {
    const allArt = this.getAsciiArt();
    const index = allArt.findIndex(a => a.id === art.id);
    
    if (index !== -1) {
      allArt[index] = art;
      this.saveAsciiArt(allArt);
      return true;
    }
    
    return false;
  }

  // Toggle favorite status
  toggleFavorite(id: string): boolean {
    const allArt = this.getAsciiArt();
    const art = allArt.find(a => a.id === id);
    
    if (art) {
      art.favorite = !art.favorite;
      this.saveAsciiArt(allArt);
      return true;
    }
    
    return false;
  }

  // Delete ASCII art
  deleteAsciiArt(id: string): boolean {
    let allArt = this.getAsciiArt();
    const initialLength = allArt.length;
    allArt = allArt.filter(art => art.id !== id);
    
    if (allArt.length !== initialLength) {
      this.saveAsciiArt(allArt);
      return true;
    }
    
    return false;
  }

  // Get all available categories
  getCategories(): string[] {
    const allArt = this.getAsciiArt();
    const categories = new Set<string>();
    
    allArt.forEach(art => {
      categories.add(art.category);
    });
    
    return Array.from(categories).sort();
  }

  // Save the ASCII art collection to localStorage
  private saveAsciiArt(art: AsciiArt[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(art));
  }
}
