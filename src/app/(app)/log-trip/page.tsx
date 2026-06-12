'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { logTrip } from '@/services/tripService';
import { TRANSPORT_LABELS, calculateEmissions, getCo2Saved } from '@/lib/mock/emissionsCalculator';
import type { TransportMode } from '@/types';

const MODES: TransportMode[] = ['walk', 'bike', 'bus', 'metro', 'car', 'flight'];

export default function LogTripPage() {
  const { user, addEcoPoints } = useUserStore();
  const [selectedMode, setSelectedMode] = useState<TransportMode | null>(null);
  const [distance, setDistance] = useState('');
  const [logging, setLogging] = useState(false);
  const [result, setResult] = useState<{ co2: number; saved: number; points: number } | null>(null);

  const handleLogTrip = async () => {
    if (!user || !selectedMode || !distance) return;
    const km = parseFloat(distance);
    if (isNaN(km) || km <= 0) return;

    setLogging(true);
    try {
      const trip = await logTrip(user.uid, selectedMode, km);
      const saved = getCo2Saved(selectedMode, km);
      const greenModes: TransportMode[] = ['walk', 'bike', 'bus', 'metro'];
      const points = greenModes.includes(selectedMode) ? Math.round(25 + km * 2) : 0;
      addEcoPoints(points);
      setResult({ co2: trip.co2eKg, saved, points });
    } catch (err) {
      console.error('Failed to log trip:', err);
    } finally {
      setLogging(false);
    }
  };

  const resetForm = () => {
    setSelectedMode(null);
    setDistance('');
    setResult(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ marginBottom: 8 }}>
          Log a Trip <span style={{ fontSize: '1.5rem' }}>🗺️</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
          Track your commute and earn EcoPoints for green choices
        </p>
      </motion.div>

      <div className="trip-form">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              className="glass-card-glow trip-result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <span className="result-icon">✅</span>
              <h2>Trip Logged!</h2>

              <div style={{ margin: '20px 0' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>
                  CO₂ Emitted
                </div>
                <div className="co2-value">{result.co2.toFixed(2)} kg</div>
              </div>

              {result.saved > 0 && (
                <div className="badge badge-green" style={{ fontSize: '0.9rem', padding: '8px 16px', margin: '0 auto 12px' }}>
                  🌱 You saved {result.saved.toFixed(2)} kg CO₂ vs. driving!
                </div>
              )}

              {result.points > 0 && (
                <div className="badge badge-gold" style={{ fontSize: '0.9rem', padding: '8px 16px', margin: '0 auto' }}>
                  🪙 +{result.points} EcoPoints earned!
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                onClick={resetForm}
                style={{ marginTop: 24 }}
              >
                Log Another Trip
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Mode Selector */}
              <h3 style={{ marginBottom: 16 }}>Choose transport mode</h3>
              <div className="mode-selector">
                {MODES.map((mode) => {
                  const info = TRANSPORT_LABELS[mode];
                  return (
                    <button
                      key={mode}
                      className={`mode-option ${selectedMode === mode ? 'selected' : ''}`}
                      onClick={() => setSelectedMode(mode)}
                      type="button"
                    >
                      <span className="mode-icon">{info.icon}</span>
                      <span className="mode-label">{info.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Distance Input */}
              <div className="input-group" style={{ marginBottom: 16 }}>
                <label>Distance (km)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="e.g., 12.5"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  min="0.1"
                  step="0.1"
                />
              </div>

              {/* Preview */}
              {selectedMode && distance && parseFloat(distance) > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    padding: '14px 18px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Estimated CO₂:
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--green-400)' }}>
                    {calculateEmissions(selectedMode, parseFloat(distance)).toFixed(3)} kg
                  </span>
                </motion.div>
              )}

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleLogTrip}
                disabled={!selectedMode || !distance || logging}
              >
                {logging ? (
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                ) : (
                  '🚀 Log Trip'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
