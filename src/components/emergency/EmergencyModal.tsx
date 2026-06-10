'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMERGENCY_ACTIONS = [
  {
    id: 'ac_off',
    title: 'Deactivate Climate Control',
    description: 'Turn off AC/Heating to instantly drop grid demand.',
    points: 150,
  },
  {
    id: 'phantom_load',
    title: 'Purge Phantom Loads',
    description: 'Unplug all non-essential electronics and appliances.',
    points: 80,
  },
  {
    id: 'plant_based',
    title: 'Initiate Plant-Based Protocol',
    description: 'Commit to zero meat/dairy consumption for 24 hours.',
    points: 200,
  },
];

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { addEcoPoints, setLastEmergencyDate } = useUserStore();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gridStatus, setGridStatus] = useState({ city: 'Your Location', intensity: 0 });

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      fetchGridStatus();
    }
  }, [isOpen]);

  const fetchGridStatus = async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      const { latitude, longitude } = position.coords;

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`
      );
      const weatherData = await weatherRes.json();
      const current = weatherData.current;
      
      // Estimate intensity
      const intensity = Math.max(80, Math.min(450, Math.round(280 - current.wind_speed_10m * 8 + current.temperature_2m * 2)));

      let city = 'Your Location';
      try {
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const geoData = await geoRes.json();
        city = geoData.city || geoData.locality || city;
      } catch {}

      setGridStatus({ city, intensity });
    } catch {
      // Fallback if location fails
      setGridStatus({ city: 'Unknown Location', intensity: 350 });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (points: number) => {
    addEcoPoints(points);
    setLastEmergencyDate(new Date().toISOString());
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="emergency-overlay">
        <motion.div
          className="emergency-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {success ? (
            <motion.div 
              className="emergency-success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="emergency-success-icon">✓</div>
              <h2>THREAT NEUTRALIZED</h2>
              <p>Emergency action logged. EcoPoints awarded.</p>
            </motion.div>
          ) : (
            <>
              <div className="emergency-header">
                <div className="emergency-title">
                  <span className="emergency-context-icon">⚠</span> CARBON SOS
                </div>
                <button className="emergency-close" onClick={onClose}>✕</button>
              </div>

              <div className="emergency-context">
                <div className="emergency-context-text">
                  <h3>CRITICAL GRID LOAD DETECTED</h3>
                  {loading ? (
                    <p>Scanning local grid telemetry...</p>
                  ) : (
                    <p>
                      Location: <strong>{gridStatus.city}</strong><br/>
                      Current Carbon Intensity: <strong>{gridStatus.intensity} gCO₂/kWh</strong><br/>
                      Immediate load shedding recommended to prevent fossil-peaker plant activation.
                    </p>
                  )}
                </div>
              </div>

              <div className="emergency-actions-list">
                {EMERGENCY_ACTIONS.map((action) => (
                  <motion.button
                    key={action.id}
                    className="emergency-action-btn"
                    onClick={() => handleAction(action.points)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="emergency-action-info">
                      <h4>{action.title}</h4>
                      <p>{action.description}</p>
                    </div>
                    <div className="emergency-action-reward">
                      +{action.points} EP
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
