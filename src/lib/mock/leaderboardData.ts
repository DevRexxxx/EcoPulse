import type { LeaderboardEntry } from '@/types';

const ANONYMOUS_NAMES = [
  'Green Panda 🐼',
  'Eco Falcon 🦅',
  'Solar Bear ☀️',
  'Wind Wolf 🐺',
  'Ocean Turtle 🐢',
  'Forest Fox 🦊',
  'Earth Eagle 🦅',
  'River Otter 🦦',
  'Cloud Hawk ☁️',
  'Storm Lion 🦁',
  'Leaf Deer 🦌',
  'Rain Owl 🦉',
  'Moss Rabbit 🐇',
  'Coral Fish 🐠',
  'Breeze Cat 🐱',
  'Bloom Bee 🐝',
  'Frost Swan 🦢',
  'Dawn Heron 🪶',
  'Dusk Moth 🦋',
  'Peak Goat 🐐',
];

export function generateLeaderboard(currentUserName: string, currentUserPoints: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = ANONYMOUS_NAMES.map((name, i) => ({
    rank: 0,
    displayName: name,
    co2SavedKg: Math.round((Math.random() * 150 + 20) * 10) / 10,
    ecoPoints: Math.floor(Math.random() * 3000 + 200),
    isCurrentUser: false,
  }));

  // Insert current user
  entries.push({
    rank: 0,
    displayName: currentUserName || 'You 🌱',
    co2SavedKg: Math.round((currentUserPoints / 10) * 10) / 10,
    ecoPoints: currentUserPoints,
    isCurrentUser: true,
  });

  // Sort by ecoPoints descending and assign ranks
  entries.sort((a, b) => b.ecoPoints - a.ecoPoints);
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  return entries;
}
