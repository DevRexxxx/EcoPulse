'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Lazy-load the heatmap to prevent SSR issues with Leaflet
// @ts-ignore - Module exists, TS just can't resolve types for dynamic() imports
const HeatmapMap = dynamic(() => import('./HeatmapMap'), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'rgba(255,255,255,0.4)' }}>Loading heatmap...</div>,
});

// ==========================================
// Types
// ==========================================
interface EnvironmentData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  aqi: number;
  aqiLabel: string;
  carbonIntensity: number;
  cityName: string;
  isDay: boolean;
}

interface SensorsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ==========================================
// AQI Helpers
// ==========================================
function getAqiLabel(aqi: number): string {
  if (aqi <= 20) return 'Excellent';
  if (aqi <= 40) return 'Good';
  if (aqi <= 60) return 'Moderate';
  if (aqi <= 80) return 'Poor';
  if (aqi <= 100) return 'Very Poor';
  return 'Hazardous';
}

function getAqiColor(aqi: number): string {
  if (aqi <= 20) return '#00ffc8';
  if (aqi <= 40) return '#4ade80';
  if (aqi <= 60) return '#facc15';
  if (aqi <= 80) return '#f97316';
  if (aqi <= 100) return '#ef4444';
  return '#dc2626';
}

function getUvColor(uv: number): string {
  if (uv <= 2) return '#4ade80';
  if (uv <= 5) return '#facc15';
  if (uv <= 7) return '#f97316';
  if (uv <= 10) return '#ef4444';
  return '#dc2626';
}

function getUvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

// ==========================================
// Component
// ==========================================
export default function SensorsPanel({ isOpen, onClose }: SensorsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'environment' | 'heatmap'>('environment');
  const [envData, setEnvData] = useState<EnvironmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEnvironmentData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      const [weatherRes, aqiRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,uv_index,is_day`
        ),
        fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi`
        ),
      ]);

      const weatherData = await weatherRes.json();
      const aqiData = await aqiRes.json();

      const current = weatherData.current;
      const aqi = aqiData?.current?.european_aqi ?? 0;

      const carbonIntensity = Math.max(80, Math.min(450, Math.round(280 - current.wind_speed_10m * 8 + current.temperature_2m * 2)));

      let cityName = 'Your Location';
      try {
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const geoData = await geoRes.json();
        if (geoData?.city) {
          cityName = geoData.city;
        } else if (geoData?.locality) {
          cityName = geoData.locality;
        }
      } catch {
        // Ignore geocoding failures silently
      }

      setEnvData({
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        uvIndex: current.uv_index,
        aqi,
        aqiLabel: getAqiLabel(aqi),
        carbonIntensity,
        cityName,
        isDay: current.is_day === 1,
      });
      setLastUpdated(new Date());
    } catch (err: any) {
      if (err?.code === 1) {
        setError('Location access denied. Please allow location permissions.');
      } else {
        setError('Failed to fetch environmental data. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'environment') {
      fetchEnvironmentData();
      const interval = setInterval(fetchEnvironmentData, 60000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeTab, fetchEnvironmentData]);

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="sensors-overlay"
        className="sensors-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        key="sensors-panel"
        className="sensors-panel"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sensors-panel-header">
          <div>
            <h2 className="sensors-panel-title">
              <span style={{ color: '#00ffc8' }}>◈</span> Environmental Sensors
            </h2>
            <p className="sensors-panel-subtitle">
              {activeTab === 'environment' ? 'Real-time atmospheric telemetry' : 'Global CO₂ emission density'}
            </p>
          </div>
          <motion.button
            className="sensors-close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 70, 70, 0.2)' }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="sensors-tabs">
          <motion.button
            className={`sensors-tab ${activeTab === 'environment' ? 'active' : ''}`}
            onClick={() => setActiveTab('environment')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>🌡️</span> Live Environment
          </motion.button>
          <motion.button
            className={`sensors-tab ${activeTab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>🗺️</span> Emission Heatmap
          </motion.button>
        </div>

        {/* Tab Content */}
        <div className="sensors-content">
          <AnimatePresence mode="wait">
            {activeTab === 'environment' ? (
              <motion.div
                key="env"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="sensors-env-grid"
              >
                {loading && !envData ? (
                  <div className="sensors-loading">
                    <div className="spinner" style={{ borderTopColor: '#00ffc8', width: 32, height: 32 }} />
                    <p>Acquiring location & fetching sensor data...</p>
                  </div>
                ) : error ? (
                  <div className="sensors-error">
                    <span style={{ fontSize: '2rem' }}>📡</span>
                    <p>{error}</p>
                    <motion.button
                      className="sensors-retry-btn"
                      onClick={fetchEnvironmentData}
                      whileHover={{ scale: 1.05, boxShadow: '0 0 18px rgba(0, 255, 200, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ↻ Retry
                    </motion.button>
                  </div>
                ) : envData ? (
                  <>
                    <div className="sensors-location-bar">
                      <span>{envData.isDay ? '☀️' : '🌙'}</span>
                      <span className="sensors-city">{envData.cityName}</span>
                      {lastUpdated && (
                        <span className="sensors-timestamp">
                          Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                      )}
                    </div>

                    {/* AQI Hero Card */}
                    <motion.div className="sensor-card sensor-card-hero" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
                      <div className="sensor-card-icon" style={{ color: getAqiColor(envData.aqi) }}>🫁</div>
                      <div className="sensor-card-body">
                        <div className="sensor-card-label">AIR QUALITY INDEX</div>
                        <div className="sensor-card-value" style={{ color: getAqiColor(envData.aqi) }}>
                          {envData.aqi}<span className="sensor-card-unit">EAQI</span>
                        </div>
                        <div className="sensor-card-status" style={{ color: getAqiColor(envData.aqi) }}>{envData.aqiLabel}</div>
                      </div>
                      <div className="sensor-aqi-bar">
                        <div className="sensor-aqi-fill" style={{ width: `${Math.min(100, envData.aqi)}%`, backgroundColor: getAqiColor(envData.aqi) }} />
                      </div>
                    </motion.div>

                    <motion.div className="sensor-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                      <div className="sensor-card-icon">🌡️</div>
                      <div className="sensor-card-body">
                        <div className="sensor-card-label">TEMPERATURE</div>
                        <div className="sensor-card-value">{envData.temperature.toFixed(1)}<span className="sensor-card-unit">°C</span></div>
                      </div>
                    </motion.div>

                    <motion.div className="sensor-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
                      <div className="sensor-card-icon">💧</div>
                      <div className="sensor-card-body">
                        <div className="sensor-card-label">HUMIDITY</div>
                        <div className="sensor-card-value">{envData.humidity}<span className="sensor-card-unit">%</span></div>
                      </div>
                    </motion.div>

                    <motion.div className="sensor-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                      <div className="sensor-card-icon">💨</div>
                      <div className="sensor-card-body">
                        <div className="sensor-card-label">WIND SPEED</div>
                        <div className="sensor-card-value">{envData.windSpeed.toFixed(1)}<span className="sensor-card-unit">km/h</span></div>
                      </div>
                    </motion.div>

                    <motion.div className="sensor-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
                      <div className="sensor-card-icon" style={{ color: getUvColor(envData.uvIndex) }}>☀️</div>
                      <div className="sensor-card-body">
                        <div className="sensor-card-label">UV INDEX</div>
                        <div className="sensor-card-value" style={{ color: getUvColor(envData.uvIndex) }}>
                          {envData.uvIndex.toFixed(1)}<span className="sensor-card-unit">{getUvLabel(envData.uvIndex)}</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div className="sensor-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                      <div className="sensor-card-icon">⚡</div>
                      <div className="sensor-card-body">
                        <div className="sensor-card-label">CARBON INTENSITY</div>
                        <div className="sensor-card-value">
                          {envData.carbonIntensity}<span className="sensor-card-unit">gCO₂/kWh</span>
                        </div>
                        <div className="sensor-card-status" style={{ color: envData.carbonIntensity < 200 ? '#4ade80' : envData.carbonIntensity < 350 ? '#facc15' : '#ef4444' }}>
                          {envData.carbonIntensity < 200 ? 'Clean Grid' : envData.carbonIntensity < 350 ? 'Moderate' : 'High Emission'}
                        </div>
                      </div>
                    </motion.div>

                    {/* Quick Action Buttons */}
                    <div className="sensors-quick-actions">
                      <motion.button
                        className="sensors-action-btn sensors-action-primary"
                        onClick={() => navigateTo('/actions')}
                        whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(0, 255, 200, 0.3)' }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span>⊙</span> Log Eco Action
                      </motion.button>
                      <motion.button
                        className="sensors-action-btn sensors-action-secondary"
                        onClick={() => navigateTo('/dashboard')}
                        whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.08)' }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span>◎</span> Dashboard
                      </motion.button>
                      <motion.button
                        className="sensors-action-btn sensors-action-secondary"
                        onClick={() => navigateTo('/leaderboard')}
                        whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.08)' }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span>🏆</span> Leaderboard
                      </motion.button>
                    </div>
                  </>
                ) : null}
              </motion.div>
            ) : (
              <motion.div
                key="heatmap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}
              >
                <div className="sensors-heatmap-container">
                  <HeatmapMap />
                </div>

                {/* Heatmap Quick Actions */}
                <div className="sensors-quick-actions" style={{ gridColumn: 'unset' }}>
                  <motion.button
                    className="sensors-action-btn sensors-action-primary"
                    onClick={() => navigateTo('/network')}
                    whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(0, 255, 200, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>◎</span> View Full Network
                  </motion.button>
                  <motion.button
                    className="sensors-action-btn sensors-action-secondary"
                    onClick={() => navigateTo('/actions')}
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>⊙</span> Log Eco Action
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
