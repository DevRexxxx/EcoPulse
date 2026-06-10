import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  UserProfile,
  Baseline,
  Trip,
  Streak,
  PointsEntry,
  UserBadge,
  Redemption,
  UserStats,
  TransportMode,
} from '@/types';
import { calculateEmissions } from './mock/emissionsCalculator';

// ==========================================
// User Operations
// ==========================================

export async function createUserProfile(uid: string, email: string, displayName: string) {
  const profile: UserProfile = {
    uid,
    email,
    displayName,
    region: 'IN',
    createdAt: new Date().toISOString(),
    onboardingComplete: false,
  };
  await setDoc(doc(db, 'users', uid), profile);

  // Initialize streak
  const streak: Streak = {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
  };
  await setDoc(doc(db, 'users', uid, 'meta', 'streak'), streak);

  return profile;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), data);
}

export async function deleteUserAccount(uid: string) {
  // Cascade delete all user data (GDPR)
  const subcollections = ['baselines', 'trips', 'points_ledger', 'badges', 'redemptions'];
  for (const sub of subcollections) {
    const snap = await getDocs(collection(db, 'users', uid, sub));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  }
  await deleteDoc(doc(db, 'users', uid, 'meta', 'streak'));
  await deleteDoc(doc(db, 'users', uid));
}

// ==========================================
// Baseline (Onboarding Quiz)
// ==========================================

export async function saveBaseline(uid: string, baseline: Baseline) {
  await setDoc(doc(db, 'users', uid, 'baselines', 'current'), {
    ...baseline,
    updatedAt: new Date().toISOString(),
  });
  await updateDoc(doc(db, 'users', uid), { onboardingComplete: true });
}

export async function getBaseline(uid: string): Promise<Baseline | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'baselines', 'current'));
  return snap.exists() ? (snap.data() as Baseline) : null;
}

// ==========================================
// Trip Logging & Emissions
// ==========================================

export async function logTrip(uid: string, mode: TransportMode, distanceKm: number): Promise<Trip> {
  const co2eKg = calculateEmissions(mode, distanceKm);
  const trip: Omit<Trip, 'id'> = {
    userId: uid,
    mode,
    distanceKm,
    co2eKg,
    recordedAt: new Date().toISOString(),
  };

  const ref = await addDoc(collection(db, 'users', uid, 'trips'), trip);

  // Award points based on green transport
  const greenModes: TransportMode[] = ['walk', 'bike', 'bus', 'metro'];
  if (greenModes.includes(mode)) {
    const points = Math.round(co2eKg > 0 ? 25 : 50 + distanceKm * 2);
    await awardPoints(uid, points, `Green commute: ${mode} ${distanceKm}km`);
  }

  // Update streak
  await updateStreak(uid);

  return { id: ref.id, ...trip };
}

export async function getTrips(uid: string, count: number = 10): Promise<Trip[]> {
  const q = query(
    collection(db, 'users', uid, 'trips'),
    orderBy('recordedAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Trip));
}

export async function getEmissionsHistory(uid: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const q = query(
    collection(db, 'users', uid, 'trips'),
    where('recordedAt', '>=', startDate.toISOString()),
    orderBy('recordedAt', 'desc')
  );
  const snap = await getDocs(q);
  const trips = snap.docs.map((d) => d.data() as Trip);

  // Aggregate by date
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyMap[key] = 0;
  }

  for (const trip of trips) {
    const key = trip.recordedAt.split('T')[0];
    if (dailyMap[key] !== undefined) {
      dailyMap[key] += trip.co2eKg;
    }
  }

  return Object.entries(dailyMap)
    .map(([date, co2eKg]) => ({
      date,
      co2eKg: Math.round(co2eKg * 100) / 100,
      label: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ==========================================
// Points Economy
// ==========================================

export async function awardPoints(uid: string, delta: number, reason: string) {
  await addDoc(collection(db, 'users', uid, 'points_ledger'), {
    userId: uid,
    delta,
    reason,
    createdAt: new Date().toISOString(),
  });
}

export async function getTotalPoints(uid: string): Promise<number> {
  const snap = await getDocs(collection(db, 'users', uid, 'points_ledger'));
  let total = 0;
  snap.docs.forEach((d) => {
    total += (d.data() as PointsEntry).delta;
  });
  return total;
}

export async function deductPoints(uid: string, amount: number, reason: string): Promise<boolean> {
  const total = await getTotalPoints(uid);
  if (total < amount) return false;
  await awardPoints(uid, -amount, reason);
  return true;
}

// ==========================================
// Streaks
// ==========================================

export async function updateStreak(uid: string) {
  const streakRef = doc(db, 'users', uid, 'meta', 'streak');
  const snap = await getDoc(streakRef);
  const today = new Date().toISOString().split('T')[0];

  if (snap.exists()) {
    const data = snap.data() as Streak;
    const lastDate = data.lastActivityDate;

    if (lastDate === today) return; // Already active today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak: number;
    if (lastDate === yesterdayStr) {
      newStreak = data.currentStreak + 1;
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, data.longestStreak);

    await updateDoc(streakRef, {
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: today,
    });

    // Award streak milestone bonus
    if (newStreak === 7) {
      await awardPoints(uid, 200, '7-day streak milestone! 🔥');
    } else if (newStreak === 30) {
      await awardPoints(uid, 500, '30-day streak milestone! 🌟');
    }
  } else {
    await setDoc(streakRef, {
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
    });
  }
}

export async function getStreak(uid: string): Promise<Streak> {
  const snap = await getDoc(doc(db, 'users', uid, 'meta', 'streak'));
  if (snap.exists()) return snap.data() as Streak;
  return { currentStreak: 0, longestStreak: 0, lastActivityDate: '' };
}

// ==========================================
// Badges
// ==========================================

export async function getUserBadges(uid: string): Promise<UserBadge[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'badges'));
  return snap.docs.map((d) => d.data() as UserBadge);
}

export async function awardBadge(uid: string, badgeId: string) {
  const existing = await getDoc(doc(db, 'users', uid, 'badges', badgeId));
  if (!existing.exists()) {
    await setDoc(doc(db, 'users', uid, 'badges', badgeId), {
      badgeId,
      earnedAt: new Date().toISOString(),
    });
    await awardPoints(uid, 100, `Badge earned: ${badgeId}`);
  }
}

// ==========================================
// Actions
// ==========================================

export async function logCompletedAction(uid: string, description: string, co2SavedKg: number, points: number) {
  await addDoc(collection(db, 'users', uid, 'actions'), {
    userId: uid,
    description,
    co2SavedKg,
    points,
    completedAt: new Date().toISOString(),
  });
  
  await awardPoints(uid, points, `Completed Action: ${description}`);
  await updateStreak(uid);
}

// ==========================================
// User Stats (Aggregated)
// ==========================================

export async function getUserStats(uid: string): Promise<UserStats> {
  const [trips, actions, points, streak, badges] = await Promise.all([
    getDocs(collection(db, 'users', uid, 'trips')),
    getDocs(collection(db, 'users', uid, 'actions')),
    getTotalPoints(uid),
    getStreak(uid),
    getUserBadges(uid),
  ]);

  let totalCo2 = 0;
  
  // Aggregate CO2 saved from trips
  trips.docs.forEach((d) => {
    const trip = d.data() as Trip;
    const carEquivalent = trip.distanceKm * 0.21;
    const saved = carEquivalent - trip.co2eKg;
    if (saved > 0) totalCo2 += saved;
  });

  // Aggregate CO2 saved from actions
  actions.docs.forEach((d) => {
    const actionData = d.data();
    if (actionData.co2SavedKg) {
      totalCo2 += actionData.co2SavedKg;
    }
  });

  return {
    totalCo2SavedKg: Math.round(totalCo2 * 100) / 100,
    totalEcoPoints: points,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    tripsLogged: trips.size,
    actionsCompleted: actions.size,
    badgesEarned: badges.length,
  };
}

// ==========================================
// Redemptions
// ==========================================

export async function redeemReward(uid: string, rewardId: string, pointsCost: number): Promise<boolean> {
  const success = await deductPoints(uid, pointsCost, `Redeemed reward: ${rewardId}`);
  if (success) {
    await addDoc(collection(db, 'users', uid, 'redemptions'), {
      userId: uid,
      rewardId,
      redeemedAt: new Date().toISOString(),
    });
  }
  return success;
}
