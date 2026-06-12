import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Trip, TransportMode } from '@/types';
import { calculateEmissions } from '@/lib/mock/emissionsCalculator';
import { awardPoints, updateStreak } from './gamificationService';

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

  const greenModes: TransportMode[] = ['walk', 'bike', 'bus', 'metro'];
  if (greenModes.includes(mode)) {
    const points = Math.round(co2eKg > 0 ? 25 : 50 + distanceKm * 2);
    await awardPoints(uid, points, `Green commute: ${mode} ${distanceKm}km`);
  }

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
