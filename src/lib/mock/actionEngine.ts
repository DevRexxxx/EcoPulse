import type { ActionSuggestion, ActionCategory, Baseline } from '@/types';

// Rule-based suggestion engine — fallback for when AI API is unavailable
// Maps top emission category to contextual suggestions

const SUGGESTION_POOL: Record<ActionCategory, ActionSuggestion[]> = {
  mobility: [
    {
      id: 'mob-1',
      suggestion: 'Take the metro to work tomorrow instead of driving',
      co2SavedKg: 4.2,
      ecoPoints: 50,
      category: 'mobility',
      difficulty: 'easy',
    },
    {
      id: 'mob-2',
      suggestion: 'Try cycling for short trips under 3km this week',
      co2SavedKg: 1.8,
      ecoPoints: 35,
      category: 'mobility',
      difficulty: 'easy',
    },
    {
      id: 'mob-3',
      suggestion: 'Carpool with a colleague for your daily commute',
      co2SavedKg: 3.5,
      ecoPoints: 45,
      category: 'mobility',
      difficulty: 'medium',
    },
    {
      id: 'mob-4',
      suggestion: 'Walk to the grocery store instead of driving',
      co2SavedKg: 0.8,
      ecoPoints: 25,
      category: 'mobility',
      difficulty: 'easy',
    },
    {
      id: 'mob-5',
      suggestion: 'Use public bus for your evening commute today',
      co2SavedKg: 2.1,
      ecoPoints: 40,
      category: 'mobility',
      difficulty: 'easy',
    },
  ],
  diet: [
    {
      id: 'diet-1',
      suggestion: 'Try a fully plant-based dinner tonight',
      co2SavedKg: 2.5,
      ecoPoints: 40,
      category: 'diet',
      difficulty: 'easy',
    },
    {
      id: 'diet-2',
      suggestion: 'Replace beef with lentils in one meal this week',
      co2SavedKg: 6.6,
      ecoPoints: 60,
      category: 'diet',
      difficulty: 'medium',
    },
    {
      id: 'diet-3',
      suggestion: 'Buy locally sourced vegetables from a farmers market',
      co2SavedKg: 1.2,
      ecoPoints: 30,
      category: 'diet',
      difficulty: 'easy',
    },
    {
      id: 'diet-4',
      suggestion: 'Go meat-free for 3 consecutive days',
      co2SavedKg: 8.4,
      ecoPoints: 75,
      category: 'diet',
      difficulty: 'hard',
    },
    {
      id: 'diet-5',
      suggestion: 'Cook at home instead of ordering delivery tonight',
      co2SavedKg: 1.5,
      ecoPoints: 25,
      category: 'diet',
      difficulty: 'easy',
    },
  ],
  energy: [
    {
      id: 'eng-1',
      suggestion: 'Turn off all lights and electronics for 1 hour tonight',
      co2SavedKg: 0.5,
      ecoPoints: 20,
      category: 'energy',
      difficulty: 'easy',
    },
    {
      id: 'eng-2',
      suggestion: 'Set your AC 2°C higher than usual today',
      co2SavedKg: 1.8,
      ecoPoints: 35,
      category: 'energy',
      difficulty: 'medium',
    },
    {
      id: 'eng-3',
      suggestion: 'Air-dry your laundry instead of using a dryer',
      co2SavedKg: 2.3,
      ecoPoints: 30,
      category: 'energy',
      difficulty: 'easy',
    },
    {
      id: 'eng-4',
      suggestion: 'Unplug unused chargers and electronics overnight',
      co2SavedKg: 0.3,
      ecoPoints: 15,
      category: 'energy',
      difficulty: 'easy',
    },
    {
      id: 'eng-5',
      suggestion: 'Switch to LED bulbs in your most-used room',
      co2SavedKg: 3.0,
      ecoPoints: 50,
      category: 'energy',
      difficulty: 'medium',
    },
  ],
  shopping: [
    {
      id: 'shop-1',
      suggestion: 'Carry a reusable bag for your next shopping trip',
      co2SavedKg: 0.2,
      ecoPoints: 15,
      category: 'shopping',
      difficulty: 'easy',
    },
    {
      id: 'shop-2',
      suggestion: 'Buy a refurbished gadget instead of brand new',
      co2SavedKg: 12.0,
      ecoPoints: 80,
      category: 'shopping',
      difficulty: 'hard',
    },
    {
      id: 'shop-3',
      suggestion: 'Repair a clothing item instead of buying new',
      co2SavedKg: 5.5,
      ecoPoints: 45,
      category: 'shopping',
      difficulty: 'medium',
    },
    {
      id: 'shop-4',
      suggestion: 'Use a refillable water bottle for the entire week',
      co2SavedKg: 0.8,
      ecoPoints: 20,
      category: 'shopping',
      difficulty: 'easy',
    },
    {
      id: 'shop-5',
      suggestion: 'Donate clothes you no longer wear to a thrift store',
      co2SavedKg: 3.2,
      ecoPoints: 40,
      category: 'shopping',
      difficulty: 'easy',
    },
  ],
};

function getTopCategory(baseline?: Baseline | null): ActionCategory {
  if (!baseline) return 'mobility';
  if (baseline.transitPref === 'car') return 'mobility';
  if (baseline.dietType === 'meat_heavy') return 'diet';
  if (baseline.energyUsage === 'high') return 'energy';
  if (baseline.shoppingHabit === 'frequent') return 'shopping';
  return 'mobility';
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateSuggestions(baseline?: Baseline | null, count: number = 3): ActionSuggestion[] {
  const topCategory = getTopCategory(baseline);
  const categories: ActionCategory[] = ['mobility', 'diet', 'energy', 'shopping'];

  // Pick primarily from top category, mix in one from another
  const primarySuggestions = shuffleArray(SUGGESTION_POOL[topCategory]).slice(0, count - 1);
  const otherCategories = categories.filter((c) => c !== topCategory);
  const secondaryCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)];
  const secondarySuggestion = shuffleArray(SUGGESTION_POOL[secondaryCategory])[0];

  return shuffleArray([...primarySuggestions, secondarySuggestion]).slice(0, count);
}
