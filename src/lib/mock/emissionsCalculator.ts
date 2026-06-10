import type { TransportMode } from '@/types';

// Emission factors in kg CO2e per km
// Sources: IPCC, MoEFCC (India), Climatiq baseline data
const EMISSION_FACTORS: Record<TransportMode, number> = {
  car: 0.21,
  bus: 0.089,
  metro: 0.041,
  bike: 0.0,
  walk: 0.0,
  flight: 0.255,
};

export function calculateEmissions(mode: TransportMode, distanceKm: number): number {
  const factor = EMISSION_FACTORS[mode] || 0.21;
  return Math.round(distanceKm * factor * 1000) / 1000;
}

export function getEmissionFactor(mode: TransportMode): number {
  return EMISSION_FACTORS[mode] || 0;
}

export function getCo2Saved(mode: TransportMode, distanceKm: number): number {
  const carEquivalent = distanceKm * EMISSION_FACTORS.car;
  const actual = calculateEmissions(mode, distanceKm);
  return Math.max(0, Math.round((carEquivalent - actual) * 1000) / 1000);
}

export const TRANSPORT_LABELS: Record<TransportMode, { label: string; icon: string; color: string }> = {
  walk: { label: 'Walking', icon: '🚶', color: '#22c55e' },
  bike: { label: 'Cycling', icon: '🚲', color: '#10b981' },
  bus: { label: 'Bus', icon: '🚌', color: '#f59e0b' },
  metro: { label: 'Metro', icon: '🚇', color: '#3b82f6' },
  car: { label: 'Car', icon: '🚗', color: '#ef4444' },
  flight: { label: 'Flight', icon: '✈️', color: '#dc2626' },
};
