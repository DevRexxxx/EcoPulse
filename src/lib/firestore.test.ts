import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userService from '../services/userService';
import * as tripService from '../services/tripService';
import * as gamificationService from '../services/gamificationService';
import { db } from './firebase';

// Mock the external dependencies
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => false,
    data: () => ({}),
  }),
  getDocs: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-doc-id' }),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  Timestamp: { now: vi.fn() },
  increment: vi.fn(),
  serverTimestamp: vi.fn(),
  getAggregateFromServer: vi.fn(),
  sum: vi.fn(),
}));

vi.mock('./mock/emissionsCalculator', () => ({
  calculateEmissions: vi.fn().mockReturnValue(2.5),
}));

describe('Firestore User Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createUserProfile should initialize user and streak', async () => {
    const mockUid = 'user-123';
    const profile = await userService.createUserProfile(mockUid, 'test@eco.com', 'Tester');
    
    expect(profile.uid).toBe(mockUid);
    expect(profile.onboardingComplete).toBe(false);

    // Verify setDoc was called twice (profile + streak)
    const { setDoc } = await import('firebase/firestore');
    expect(setDoc).toHaveBeenCalledTimes(2);
  });

  it('saveBaseline should update onboarding status', async () => {
    const mockUid = 'user-123';
    const mockBaseline = { dietType: 'vegan', transitPref: 'bike' };
    
    await userService.saveBaseline(mockUid, mockBaseline);
    
    const { setDoc, updateDoc } = await import('firebase/firestore');
    expect(setDoc).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
  });
});

describe('Firestore Gamification & Points', () => {
  const mockUid = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTotalPoints should aggregate ledger entries', async () => {
    // Override getAggregateFromServer mock to return aggregated points
    const { getAggregateFromServer } = await import('firebase/firestore');
    (getAggregateFromServer as any).mockResolvedValueOnce({
      data: () => ({ total: 150 })
    });

    const total = await gamificationService.getTotalPoints(mockUid);
    expect(total).toBe(150);
  });

  it('logTrip should calculate emissions and award points for green modes', async () => {
    const trip = await tripService.logTrip(mockUid, 'bike', 10);
    
    expect(trip.mode).toBe('bike');
    expect(trip.distanceKm).toBe(10);
    expect(trip.co2eKg).toBe(2.5); // mocked return value
    
    const { addDoc } = await import('firebase/firestore');
    // Once for the trip, once for the points ledger
    expect(addDoc).toHaveBeenCalledTimes(2);
  });

  it('deductPoints should fail if user has insufficient points', async () => {
    // Mock getAggregateFromServer to return 0 points
    const { getAggregateFromServer } = await import('firebase/firestore');
    (getAggregateFromServer as any).mockResolvedValueOnce({ data: () => ({ total: 0 }) });

    const success = await gamificationService.deductPoints(mockUid, 100, 'Test deduction');
    expect(success).toBe(false);
  });

  it('redeemReward should deduct points and log redemption if successful', async () => {
    // Mock getAggregateFromServer to return enough points
    const { getAggregateFromServer, addDoc } = await import('firebase/firestore');
    (getAggregateFromServer as any).mockResolvedValueOnce({
      data: () => ({ total: 200 })
    });

    const success = await gamificationService.redeemReward(mockUid, 'reward-1', 100);
    expect(success).toBe(true);
    // 1 for awardPoints (negative), 1 for redemption log
    expect(addDoc).toHaveBeenCalledTimes(2);
  });
});
