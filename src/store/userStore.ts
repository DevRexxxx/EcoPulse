import { create } from 'zustand';
import type { UserProfile, Baseline, Streak } from '@/types';

export interface VerificationResult {
  action_verified: boolean;
  confidence_score: number;
  co2_delta_kg: number;
  eco_points: number;
  terminal_log: string;
}

export interface PendingReport {
  actionType: string;
  capturedFrame: string;
  result: VerificationResult;
}

interface UserState {
  // Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Profile
  baseline: Baseline | null;
  streak: Streak;
  ecoPoints: number;

  // Reports
  pendingReport: PendingReport | null;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setBaseline: (baseline: Baseline | null) => void;
  setStreak: (streak: Streak) => void;
  setEcoPoints: (points: number) => void;
  addEcoPoints: (delta: number) => void;
  setLoading: (loading: boolean) => void;
  setPendingReport: (report: PendingReport | null) => void;
  reset: () => void;
}

const initialStreak: Streak = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: '',
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  baseline: null,
  streak: initialStreak,
  ecoPoints: 0,
  pendingReport: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setBaseline: (baseline) => set({ baseline }),

  setStreak: (streak) => set({ streak }),

  setEcoPoints: (points) => set({ ecoPoints: points }),

  addEcoPoints: (delta) =>
    set((state) => ({ ecoPoints: state.ecoPoints + delta })),

  setLoading: (isLoading) => set({ isLoading }),

  setPendingReport: (report) => set({ pendingReport: report }),

  reset: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      baseline: null,
      streak: initialStreak,
      ecoPoints: 0,
      pendingReport: null,
    }),
}));
