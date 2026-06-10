'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

// ==========================================
// Emission Data — Major Global Cities
// ==========================================
const EMISSION_CITIES = [
  // High Emission (Red)
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, emission: 920, pop: '21.5M' },
  { name: 'Delhi NCR', lat: 28.7041, lng: 77.1025, emission: 870, pop: '32M' },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, emission: 850, pop: '27M' },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456, emission: 780, pop: '10.7M' },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, emission: 740, pop: '12.5M' },
  { name: 'Tehran', lat: 35.6892, lng: 51.3890, emission: 710, pop: '9.1M' },

  // Medium-High Emission (Orange)
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, emission: 620, pop: '3.9M' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, emission: 580, pop: '14M' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, emission: 540, pop: '12.3M' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, emission: 560, pop: '10M' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, emission: 600, pop: '20.7M' },
  { name: 'Houston', lat: 29.7604, lng: -95.3698, emission: 640, pop: '2.3M' },

  // Medium Emission (Yellow)
  { name: 'London', lat: 51.5074, lng: -0.1278, emission: 380, pop: '8.9M' },
  { name: 'New York', lat: 40.7128, lng: -74.0060, emission: 420, pop: '8.3M' },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, emission: 350, pop: '3.7M' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, emission: 290, pop: '2.2M' },
  { name: 'Toronto', lat: 43.6510, lng: -79.3470, emission: 310, pop: '2.8M' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, emission: 370, pop: '5.4M' },

  // Low Emission (Green)
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686, emission: 140, pop: '1M' },
  { name: 'Oslo', lat: 59.9139, lng: 10.7522, emission: 90, pop: '0.7M' },
  { name: 'Zurich', lat: 47.3769, lng: 8.5417, emission: 120, pop: '0.4M' },
  { name: 'Reykjavik', lat: 64.1466, lng: -21.9426, emission: 60, pop: '0.1M' },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, emission: 190, pop: '0.9M' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, emission: 210, pop: '5.7M' },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219, emission: 160, pop: '4.4M' },
];

// ==========================================
// Color Helpers
// ==========================================
function getEmissionColor(emission: number): string {
  if (emission <= 200) return '#00ffc8';  // Green/Cyan
  if (emission <= 400) return '#facc15';  // Yellow
  if (emission <= 650) return '#f97316';  // Orange
  return '#ef4444';                        // Red
}

function getEmissionLabel(emission: number): string {
  if (emission <= 200) return 'Low';
  if (emission <= 400) return 'Moderate';
  if (emission <= 650) return 'High';
  return 'Critical';
}

// ==========================================
// Component
// ==========================================
export default function HeatmapMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add slight jitter to emission values to make them feel "live"
  const cities = useMemo(() => {
    return EMISSION_CITIES.map((c) => ({
      ...c,
      emission: c.emission + Math.floor(Math.random() * 40 - 20),
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: '100%', height: '100%', minHeight: '400px', background: '#090d0c', borderRadius: '12px' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {cities.map((city, i) => {
          const color = getEmissionColor(city.emission);
          const radius = Math.max(8, Math.min(25, city.emission / 35));

          return (
            <CircleMarker
              key={i}
              center={[city.lat, city.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.35,
                weight: 2,
                opacity: 0.8,
              }}
            >
              <Popup className="cc-map-popup" autoPan={false}>
                <div style={{ color: color, fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                  {city.name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: '6px' }}>
                  Population: {city.pop}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: color, fontWeight: 'bold', fontSize: '16px' }}>
                    {city.emission}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>gCO₂/kWh</span>
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: color + '33',
                  border: `1px solid ${color}`,
                }}>
                  {getEmissionLabel(city.emission)}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="heatmap-legend">
        <div className="heatmap-legend-title">CO₂ INTENSITY</div>
        <div className="heatmap-legend-items">
          <div className="heatmap-legend-item">
            <span className="heatmap-legend-dot" style={{ backgroundColor: '#00ffc8' }} />
            <span>Low</span>
          </div>
          <div className="heatmap-legend-item">
            <span className="heatmap-legend-dot" style={{ backgroundColor: '#facc15' }} />
            <span>Moderate</span>
          </div>
          <div className="heatmap-legend-item">
            <span className="heatmap-legend-dot" style={{ backgroundColor: '#f97316' }} />
            <span>High</span>
          </div>
          <div className="heatmap-legend-item">
            <span className="heatmap-legend-dot" style={{ backgroundColor: '#ef4444' }} />
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* Pulsing animation CSS */}
      <style jsx global>{`
        .leaflet-interactive {
          animation: heatmapPulse 3s ease-in-out infinite;
        }
        @keyframes heatmapPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
