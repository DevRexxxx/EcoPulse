import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  collection,
  getAggregateFromServer,
  sum,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Streak, PointsEntry, UserBadge } from '@/types';

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
  const coll = collection(db, 'users', uid, 'points_ledger');
  const snap = await getAggregateFromServer(coll, {
    total: sum('delta')
  });
  return snap.data().total || 0;
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
  
  const todayDate = new Date();
  const getLocalYMD = (d: Date) => 
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const today = getLocalYMD(todayDate);

  if (snap.exists()) {
    const data = snap.data() as Streak;
    const lastDate = data.lastActivityDate;

    if (lastDate === today) return;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getLocalYMD(yesterdayDate);

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
