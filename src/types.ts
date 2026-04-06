export interface Quest {
  id: string;
  title: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
}

export interface KidProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  stars: number;
  lastPlayed?: string;
  dailyQuests?: Quest[];
}

export interface ActivityLog {
  id: string;
  kidId: string;
  activityType: 'tracing' | 'spelling' | 'story' | 'maze' | 'hidden' | 'sky' | 'bubble' | 'mole' | 'phonics' | 'rhyme' | 'bounce' | 'match' | 'sentence' | 'sequence' | 'wordfamily';
  content: string;
  timestamp: string;
  starsEarned: number;
}

export interface Story {
  title: string;
  content: string;
  emoji: string;
}
