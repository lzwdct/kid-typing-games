import { create } from 'zustand';

export interface Word {
  id: string;
  text: string;
  wrongSpelling?: string;
}

export interface GameState {
  score: number;
  life: number;
  level: number;
  wordList: Word[];
  currentStreak: number;
  maxStreak: number;
  totalWordsTyped: number;
  wpm: number;
  badges: string[];
}

interface GameActions {
  incrementScore: (points: number) => void;
  decrementLife: () => void;
  setLevel: (level: number) => void;
  setWordList: (words: Word[]) => void;
  addWord: (word: Word) => void;
  removeWord: (id: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  incrementWordsTyped: () => void;
  setWpm: (wpm: number) => void;
  addBadge: (badge: string) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  score: 0,
  life: 3,
  level: 1,
  wordList: [],
  currentStreak: 0,
  maxStreak: 0,
  totalWordsTyped: 0,
  wpm: 0,
  badges: [],
};

export const useGameStore = create<GameState & GameActions>((set) => ({
  ...initialState,

  incrementScore: (points: number) =>
    set((state) => ({ score: state.score + points })),

  decrementLife: () =>
    set((state) => ({ life: Math.max(0, state.life - 1) })),

  setLevel: (level: number) => set({ level }),

  setWordList: (words: Word[]) => set({ wordList: words }),

  addWord: (word: Word) =>
    set((state) => ({ wordList: [...state.wordList, word] })),

  removeWord: (id: string) =>
    set((state) => ({
      wordList: state.wordList.filter((w) => w.id !== id),
    })),

  incrementStreak: () =>
    set((state) => {
      const newStreak = state.currentStreak + 1;
      return {
        currentStreak: newStreak,
        maxStreak: Math.max(newStreak, state.maxStreak),
      };
    }),

  resetStreak: () => set({ currentStreak: 0 }),

  incrementWordsTyped: () =>
    set((state) => ({ totalWordsTyped: state.totalWordsTyped + 1 })),

  setWpm: (wpm: number) => set({ wpm }),

  addBadge: (badge: string) =>
    set((state) => {
      if (!state.badges.includes(badge)) {
        return { badges: [...state.badges, badge] };
      }
      return state;
    }),

  resetGame: () => set(initialState),
}));
