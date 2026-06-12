import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, Baseline, UserStats, Trip } from '@/types';
import { getTotalPoints, getStreak, getUserBadges } from './gamificationService';

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

  await setDoc(doc(db, 'users', uid, 'meta', 'streak'), {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
  });

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

export async function getUserStats(uid: string): Promise<UserStats> {
  const [trips, actions, points, streak, badges] = await Promise.all([
    getDocs(collection(db, 'users', uid, 'trips')),
    getDocs(collection(db, 'users', uid, 'actions')),
    getTotalPoints(uid),
    getStreak(uid),
    getUserBadges(uid),
  ]);

  let totalCo2 = 0;
  
  trips.docs.forEach((d) => {
    const trip = d.data() as Trip;
    const carEquivalent = trip.distanceKm * 0.21;
    const saved = carEquivalent - trip.co2eKg;
    if (saved > 0) totalCo2 += saved;
  });

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
