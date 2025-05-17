import { Injectable } from '@angular/core';

export interface NameTheme {
  id: string;
  name: string;
  description: string;
  firstNames: string[];
  lastNames: string[];
}

export interface GeneratedName {
  firstName: string;
  lastName: string;
  theme: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class NameService {
  private nameThemes: NameTheme[] = [
    {
      id: 'fantasy',
      name: 'Fantasy',
      description: 'Mystical names for your fantasy character or world',
      firstNames: [
        'Aerith', 'Bran', 'Celeste', 'Drogon', 'Eldrith', 'Faelan', 'Galadriel', 
        'Haldir', 'Isolde', 'Jorah', 'Katniss', 'Legolas', 'Merlin', 'Nimue',
        'Orion', 'Phoenix', 'Quirin', 'Raven', 'Sauron', 'Thorne', 'Ursula',
        'Varis', 'Willow', 'Xander', 'Yennefer', 'Zephyr'
      ],
      lastNames: [
        'Blackwood', 'Cloudrunner', 'Dawnbringer', 'Emberheart', 'Frostwind',
        'Gloomhold', 'Hawklight', 'Ironshield', 'Jademoon', 'Knightfall',
        'Lightbringer', 'Mistwalker', 'Nightshade', 'Oakheart', 'Proudmoore',
        'Quicksilver', 'Ravenwood', 'Silverhand', 'Thorngage', 'Underlake',
        'Voidwalker', 'Winterfell', 'Wyvernheart', 'Yewshade', 'Zephyrblade'
      ]
    },
    {
      id: 'scifi',
      name: 'Sci-Fi',
      description: 'Futuristic names for your sci-fi universe',
      firstNames: [
        'Apex', 'Blaze', 'Cypher', 'Dash', 'Echo', 'Flux', 'Genesis', 
        'Helix', 'Iris', 'Jett', 'Kilo', 'Luna', 'Matrix', 'Nova',
        'Omega', 'Proton', 'Quasar', 'Rez', 'Sigma', 'Tron',
        'Umbra', 'Vex', 'Warp', 'Xenon', 'Yotta', 'Zeta'
      ],
      lastNames: [
        'Andromeda', 'Blackhole', 'Comet', 'Darkstar', 'Eclipse',
        'Fission', 'Gravity', 'Hyperion', 'Infinity', 'Jeltz', 
        'Kinetic', 'Lightyear', 'Neutron', 'Orbital', 'Pulsar',
        'Quantum', 'Relativity', 'Stardust', 'Tesla', 'Universe',
        'Velocity', 'Wormhole', 'Xeno', 'Yantra', 'Zero'
      ]
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'Edgy names for your digital dystopian character',
      firstNames: [
        'Alt', 'Blade', 'Chrome', 'Dex', 'Edge', 'Freya', 'Glitch', 
        'Hack', 'Iris', 'Jacked', 'Krypt', 'Link', 'Mesh', 'Neon',
        'Onyx', 'Pixel', 'Quirk', 'Raven', 'Spike', 'Trace',
        'Unit', 'Viper', 'Wire', 'Xero', 'Yuki', 'Zero'
      ],
      lastNames: [
        'Afterburn', 'Blackwire', 'Codex', 'Deadlink', 'Encrypt',
        'Flatline', 'Ghostnet', 'Helix', 'Icepick', 'Jackware', 
        'Killbyte', 'Lockdown', 'Malware', 'Netrunner', 'Overflow',
        'Protocol', 'Quickhack', 'Ransomware', 'Syntax', 'Trojan',
        'Uplink', 'Voidspace', 'Wireframe', 'Xerox', 'Y2K', 'Zeroday'
      ]
    },
    {
      id: 'historical',
      name: 'Historical',
      description: 'Classical names from various historical periods',
      firstNames: [
        'Alexander', 'Boudicca', 'Caesar', 'Darius', 'Eleanor', 'Frederick', 
        'Genghis', 'Hatshepsut', 'Isabella', 'Julius', 'Kleopatra', 'Leonardo',
        'Machiavelli', 'Napoleon', 'Octavia', 'Plato', 'Quintus', 'Ramses',
        'Socrates', 'Tutankhamen', 'Uther', 'Victoria', 'William', 'Xerxes',
        'York', 'Zenobia'
      ],
      lastNames: [
        'Augustus', 'Bonaparte', 'Claudius', 'Dumas', 'Elendil',
        'Flavian', 'Grimaldi', 'Habsburg', 'Iscandar', 'Justinian', 
        'Komnenos', 'Lancaster', 'Medici', 'Normandy', 'Odysseus',
        'Plantagenet', 'Quintilian', 'Romanov', 'Stuart', 'Tudor',
        'Ursus', 'Valois', 'Windsor', 'Xavier', 'York', 'Zeno'
      ]
    },
    {
      id: 'superhero',
      name: 'Superhero',
      description: 'Perfect for your next superhero identity',
      firstNames: [
        'Ace', 'Bolt', 'Comet', 'Dagger', 'Eclipse', 'Flash', 'Glow', 
        'Havoc', 'Impulse', 'Justice', 'Knight', 'Liberty', 'Might',
        'Nitro', 'Omega', 'Phantom', 'Quake', 'Rocket', 'Storm',
        'Thunder', 'Ultra', 'Vortex', 'Wonder', 'X-Ray', 'Yonder', 'Zenith'
      ],
      lastNames: [
        'Arrow', 'Blaze', 'Crimson', 'Defender', 'Eagle',
        'Fury', 'Guardian', 'Hunter', 'Invincible', 'Justice', 
        'Keeper', 'Lightning', 'Marvel', 'Nemesis', 'Overlord',
        'Protector', 'Quicksilver', 'Ranger', 'Sentinel', 'Titan',
        'Unbowed', 'Vigilant', 'Warden', 'X-Factor', 'Youngblood', 'Zephyr'
      ]
    }
  ];
  
  private favoriteNames: GeneratedName[] = [];
  
  constructor() {
    // Load favorites from local storage if available
    this.loadFavorites();
  }
  
  getThemes(): NameTheme[] {
    return this.nameThemes;
  }
  
  getTheme(themeId: string): NameTheme | undefined {
    return this.nameThemes.find(theme => theme.id === themeId);
  }
  
  generateName(themeId: string): { firstName: string, lastName: string } {
    const theme = this.getTheme(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }
    
    const firstName = theme.firstNames[Math.floor(Math.random() * theme.firstNames.length)];
    const lastName = theme.lastNames[Math.floor(Math.random() * theme.lastNames.length)];
    
    return { firstName, lastName };
  }
  
  saveFavorite(name: { firstName: string, lastName: string }, themeId: string): void {
    const favoriteItem: GeneratedName = {
      firstName: name.firstName,
      lastName: name.lastName,
      theme: themeId,
      timestamp: Date.now()
    };
    
    this.favoriteNames.push(favoriteItem);
    this.saveFavorites();
  }
  
  removeFavorite(index: number): void {
    if (index >= 0 && index < this.favoriteNames.length) {
      this.favoriteNames.splice(index, 1);
      this.saveFavorites();
    }
  }
  
  getFavorites(): GeneratedName[] {
    return this.favoriteNames;
  }
  
  private saveFavorites(): void {
    localStorage.setItem('favoriteNames', JSON.stringify(this.favoriteNames));
  }
  
  private loadFavorites(): void {
    try {
      const savedFavorites = localStorage.getItem('favoriteNames');
      if (savedFavorites) {
        this.favoriteNames = JSON.parse(savedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favoriteNames = [];
    }
  }
}
