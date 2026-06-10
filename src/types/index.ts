// ==========================================
// EcoPulse — Core Type Definitions
// ==========================================

// --- User & Auth ---
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  region: string;
  createdAt: string;
  onboardingComplete: boolean;
}

export interface Baseline {
  dietType: 'vegan' | 'vegetarian' | 'moderate_meat' | 'meat_heavy';
  transitPref: 'walk' | 'bike' | 'public_transit' | 'car' | 'mixed';
  homeType: 'apartment' | 'small_house' | 'large_house' | 'shared';
  energyUsage: 'low' | 'moderate' | 'high';
  shoppingHabit: 'minimal' | 'moderate' | 'frequent';
  updatedAt: string;
}

// --- Emissions Tracking ---
export type TransportMode = 'walk' | 'bike' | 'bus' | 'metro' | 'car' | 'flight';

export interface Trip {
  id: string;
  userId: string;
  mode: TransportMode;
  distanceKm: number;
  co2eKg: number;
  recordedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  category: string;
  merchant: string;
  amount: number;
  co2eKg: number;
  recordedAt: string;
}

// --- Gamification ---
export interface PointsEntry {
  id: string;
  userId: string;
  delta: number;
  reason: string;
  createdAt: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteriaType: 'streak' | 'total_co2_saved_kg' | 'category_actions' | 'trips_logged';
  threshold: number;
  category?: string;
}

export interface UserBadge {
  badgeId: string;
  earnedAt: string;
}

// --- Action Engine ---
export type ActionCategory = 'mobility' | 'diet' | 'energy' | 'shopping';
export type ActionDifficulty = 'easy' | 'medium' | 'hard';

export interface ActionSuggestion {
  id: string;
  suggestion: string;
  co2SavedKg: number;
  ecoPoints: number;
  category: ActionCategory;
  difficulty: ActionDifficulty;
}

// --- Rewards ---
export interface Reward {
  id: string;
  partnerName: string;
  pointsCost: number;
  description: string;
  icon: string;
  expiresAt: string;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  redeemedAt: string;
}

// --- Leaderboard ---
export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  co2SavedKg: number;
  ecoPoints: number;
  isCurrentUser: boolean;
}

// --- Stats ---
export interface UserStats {
  totalCo2SavedKg: number;
  totalEcoPoints: number;
  currentStreak: number;
  longestStreak: number;
  tripsLogged: number;
  actionsCompleted: number;
  badgesEarned: number;
}

// --- Chart Data ---
export interface EmissionDataPoint {
  date: string;
  co2eKg: number;
  label: string;
}

// --- Quiz ---
export interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  icon: string;
  options: QuizOption[];
  field: keyof Baseline;
}

export interface QuizOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}
