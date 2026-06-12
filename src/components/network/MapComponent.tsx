'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Real Lat/Lng for cities with total mock mitigations
const CITIES = [
  // Asia
  { id: '1', name: 'Tokyo Metropolis', lat: 35.6762, lng: 139.6503, total: '2.4M kg' },
  { id: '2', name: 'Mumbai Metro', lat: 19.0760, lng: 72.8777, total: '1.8M kg' },
  { id: '3', name: 'Delhi NCR Grid', lat: 28.7041, lng: 77.1025, total: '1.5M kg' },
  { id: '4', name: 'Bengaluru Node', lat: 12.9716, lng: 77.5946, total: '2.1M kg' },
  { id: '5', name: 'Chennai Core', lat: 13.0827, lng: 80.2707, total: '1.1M kg' },
  { id: '12', name: 'Singapore Node', lat: 1.3521, lng: 103.8198, total: '2.7M kg' },
  { id: '13', name: 'Seoul Hub', lat: 37.5665, lng: 126.9780, total: '1.9M kg' },
  { id: '14', name: 'Beijing Sector', lat: 39.9042, lng: 116.4074, total: '3.1M kg' },
  { id: '15', name: 'Dubai Oasis', lat: 25.2048, lng: 55.2708, total: '1.2M kg' },
  
  // Europe
  { id: '6', name: 'London Sector', lat: 51.5074, lng: -0.1278, total: '3.2M kg' },
  { id: '7', name: 'Paris Core', lat: 48.8566, lng: 2.3522, total: '2.8M kg' },
  { id: '16', name: 'Berlin Grid', lat: 52.5200, lng: 13.4050, total: '2.2M kg' },
  { id: '17', name: 'Stockholm Green', lat: 59.3293, lng: 18.0686, total: '1.6M kg' },
  { id: '18', name: 'Rome Node', lat: 41.9028, lng: 12.4964, total: '1.8M kg' },

  // North America
  { id: '8', name: 'New York Grid', lat: 40.7128, lng: -74.0060, total: '4.1M kg' },
  { id: '9', name: 'San Francisco', lat: 37.7749, lng: -122.4194, total: '3.5M kg' },
  { id: '19', name: 'Toronto Sector', lat: 43.6510, lng: -79.3470, total: '2.3M kg' },
  { id: '20', name: 'Mexico City', lat: 19.4326, lng: -99.1332, total: '2.1M kg' },
  { id: '21', name: 'Austin Clean Tech', lat: 30.2672, lng: -97.7431, total: '1.4M kg' },

  // South America
  { id: '10', name: 'São Paulo', lat: -23.5505, lng: -46.6333, total: '1.9M kg' },
  { id: '22', name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, total: '1.5M kg' },
  { id: '23', name: 'Bogotá Node', lat: 4.7110, lng: -74.0721, total: '1.1M kg' },

  // Africa
  { id: '24', name: 'Nairobi Eco', lat: -1.2921, lng: 36.8219, total: '1.2M kg' },
  { id: '25', name: 'Cape Town Hub', lat: -33.9249, lng: 18.4241, total: '1.7M kg' },
  { id: '26', name: 'Cairo Grid', lat: 30.0444, lng: 31.2357, total: '1.4M kg' },

  // Oceania
  { id: '11', name: 'Sydney Hub', lat: -33.8688, lng: 151.2093, total: '1.4M kg' },
  { id: '27', name: 'Auckland Node', lat: -36.8485, lng: 174.7633, total: '0.9M kg' },
];

export default function MapComponent() {
  const [activePing, setActivePing] = useState<any>(null);

  // Fix default markers and create custom icon entirely inside the client lifecycle
  // to absolutely prevent Next.js from throwing Webpack SSR compilation errors
  useEffect(() => {
    // Fix for default Leaflet markers not showing in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const nodeIcon = useMemo(() => {
    return new L.DivIcon({
      className: 'custom-node-icon',
      html: '<div style="width: 12px; height: 12px; background-color: #00ffc8; border-radius: 50%; border: 2px solid #090d0c; box-shadow: 0 0 12px 2px rgba(0,255,200,0.6);"></div>',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  }, []);

  useEffect(() => {
    const pingInterval = setInterval(() => {
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
      const randomAmount = Math.floor(Math.random() * 80) + 10;
      
      setActivePing({
        city: randomCity,
        amount: randomAmount,
        time: Date.now()
      });
      
      setTimeout(() => {
        setActivePing(null);
      }, 3000);
    }, 4500);

    return () => clearInterval(pingInterval);
  }, []);

  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={2} 
      style={{ width: '100%', height: '100%', minHeight: '500px', background: '#090d0c' }}
      zoomControl={false}
      attributionControl={false}
    >
      {/* Dark Matter CartoDB Tiles - Perfect for Sci-Fi UI */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      
      {CITIES.map((city) => (
        <Marker 
          key={city.id} 
          position={[city.lat, city.lng]} 
          icon={nodeIcon}
          eventHandlers={{
            mouseover: (e: any) => { e.target.openPopup(); },
            mouseout: (e: any) => { e.target.closePopup(); }
          }}
        >
          <Popup className="cc-map-popup" autoPan={false}>
            <div style={{ color: '#00ffc8', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{city.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', borderBottom: '1px solid rgba(0,255,200,0.2)', paddingBottom: '4px', marginBottom: '4px' }}>Active Core Node</div>
            <div style={{ color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🌍</span> Total Mitigated: <strong style={{ color: '#00ffc8' }}>{city.total}</strong>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render active ping as an independent popup */}
      {activePing && (
        <Popup 
          position={[activePing.city.lat, activePing.city.lng]}
          className="cc-live-ping"
          autoPan={false}
          closeButton={false}
        >
          <div style={{ background: 'rgba(0,30,20,0.9)', border: '1px solid #00ffc8', padding: '8px 12px', borderRadius: '6px', color: '#fff', boxShadow: '0 0 15px rgba(0,255,200,0.2)' }}>
            <div style={{ color: '#00ffc8', fontWeight: 'bold', marginBottom: '2px' }}>{activePing.city.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⚡</span>
              <span>+{activePing.amount} kg CO₂ mitigated</span>
            </div>
          </div>
        </Popup>
      )}

      {/* Global CSS Overrides for Leaflet in dark mode */}
      <style jsx global>{`
        .leaflet-container {
          background-color: #090d0c !important;
          border-radius: 12px;
          font-family: inherit;
        }
        .cc-map-popup .leaflet-popup-content-wrapper {
          background: rgba(0, 30, 20, 0.9);
          border: 1px solid #00ffc8;
          color: white;
          border-radius: 6px;
        }
        .cc-map-popup .leaflet-popup-tip {
          background: #00ffc8;
        }
        .cc-map-popup .leaflet-popup-close-button {
          color: #00ffc8 !important;
        }
        .cc-live-ping .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .cc-live-ping .leaflet-popup-tip-container {
          display: none;
        }
        .cc-live-ping .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </MapContainer>
  );
}
