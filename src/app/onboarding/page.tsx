'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { saveBaseline } from '@/lib/firestore';
import type { Baseline, QuizQuestion } from '@/types';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'diet',
    question: 'What best describes your diet?',
    subtitle: 'This helps us estimate food-related emissions',
    icon: '🍽️',
    field: 'dietType',
    options: [
      { value: 'vegan', label: 'Vegan', icon: '🌱', description: 'No animal products' },
      { value: 'vegetarian', label: 'Vegetarian', icon: '🥗', description: 'No meat, but dairy/eggs' },
      { value: 'moderate_meat', label: 'Moderate Meat', icon: '🍗', description: 'Meat a few times a week' },
      { value: 'meat_heavy', label: 'Meat Heavy', icon: '🥩', description: 'Meat most days' },
    ],
  },
  {
    id: 'transit',
    question: 'How do you usually commute?',
    subtitle: 'Your primary mode of daily transport',
    icon: '🚗',
    field: 'transitPref',
    options: [
      { value: 'walk', label: 'Walking', icon: '🚶', description: 'Mostly walk everywhere' },
      { value: 'bike', label: 'Cycling', icon: '🚲', description: 'Bicycle is my go-to' },
      { value: 'public_transit', label: 'Public Transit', icon: '🚇', description: 'Bus, metro, or train' },
      { value: 'car', label: 'Personal Car', icon: '🚗', description: 'Drive my own car' },
    ],
  },
  {
    id: 'home',
    question: 'What type of home do you live in?',
    subtitle: 'Helps estimate household energy emissions',
    icon: '🏠',
    field: 'homeType',
    options: [
      { value: 'shared', label: 'Shared / PG', icon: '🏢', description: 'Shared accommodation' },
      { value: 'apartment', label: 'Apartment', icon: '🏬', description: 'Flat in a building' },
      { value: 'small_house', label: 'Small House', icon: '🏡', description: 'Independent small house' },
      { value: 'large_house', label: 'Large House', icon: '🏰', description: 'Large independent house' },
    ],
  },
  {
    id: 'energy',
    question: 'How would you rate your energy usage?',
    subtitle: 'AC, appliances, electronics at home',
    icon: '⚡',
    field: 'energyUsage',
    options: [
      { value: 'low', label: 'Low', icon: '🌙', description: 'Minimal appliances, no AC' },
      { value: 'moderate', label: 'Moderate', icon: '💡', description: 'Some AC, normal usage' },
      { value: 'high', label: 'High', icon: '🔌', description: 'Heavy AC, many devices' },
    ],
  },
  {
    id: 'shopping',
    question: 'How often do you shop for new things?',
    subtitle: 'Clothes, gadgets, and non-essentials',
    icon: '🛍️',
    field: 'shoppingHabit',
    options: [
      { value: 'minimal', label: 'Minimal', icon: '🧘', description: 'Buy only what I need' },
      { value: 'moderate', label: 'Moderate', icon: '🛒', description: 'Occasional shopping' },
      { value: 'frequent', label: 'Frequent', icon: '🎁', description: 'I love shopping!' },
    ],
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { user, isAuthenticated, isLoading, setUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const question = QUIZ_QUESTIONS[currentStep];
  const selectedValue = answers[question?.field] || '';

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.field]: value }));
  };

  const handleNext = async () => {
    if (!selectedValue) return;

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Save baseline
      setSaving(true);
      try {
        const baseline: Baseline = {
          dietType: (answers.dietType as Baseline['dietType']) || 'moderate_meat',
          transitPref: (answers.transitPref as Baseline['transitPref']) || 'mixed',
          homeType: (answers.homeType as Baseline['homeType']) || 'apartment',
          energyUsage: (answers.energyUsage as Baseline['energyUsage']) || 'moderate',
          shoppingHabit: (answers.shoppingHabit as Baseline['shoppingHabit']) || 'moderate',
          updatedAt: new Date().toISOString(),
        };
        if (user) {
          await saveBaseline(user.uid, baseline);
          setUser({ ...user, onboardingComplete: true });
        }
        router.push('/dashboard');
      } catch (err) {
        console.error('Failed to save baseline:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (isLoading || !question) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      {/* Progress dots */}
      <div className="quiz-progress">
        {QUIZ_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`quiz-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
          />
        ))}
      </div>

      {/* Step Counter */}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
        Step {currentStep + 1} of {QUIZ_QUESTIONS.length}
      </p>

      {/* Quiz Card */}
      <div className="quiz-card-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="quiz-card">
              <span className="quiz-icon">{question.icon}</span>
              <h2>{question.question}</h2>
              <p className="quiz-subtitle">{question.subtitle}</p>

              <div className="quiz-options">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    className={`quiz-option ${selectedValue === option.value ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.value)}
                    type="button"
                  >
                    <span className="option-icon">{option.icon}</span>
                    <div className="option-text">
                      <div className="option-label">{option.label}</div>
                      <div className="option-desc">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="quiz-nav">
        {currentStep > 0 && (
          <button className="btn btn-secondary" onClick={handleBack} type="button">
            ← Back
          </button>
        )}
        <button
          className="btn btn-primary btn-lg"
          onClick={handleNext}
          disabled={!selectedValue || saving}
          type="button"
        >
          {saving ? (
            <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          ) : currentStep === QUIZ_QUESTIONS.length - 1 ? (
            '🚀 Get Started'
          ) : (
            'Next →'
          )}
        </button>
      </div>
    </div>
  );
}
