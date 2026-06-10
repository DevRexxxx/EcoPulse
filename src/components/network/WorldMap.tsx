'use client';

import dynamic from 'next/dynamic';

// Leaflet relies heavily on the 'window' object, which is not available during Next.js Server-Side Rendering (SSR).
// By dynamically importing the component with { ssr: false }, we ensure it only loads on the client.
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      minHeight: '400px', 
      backgroundColor: '#090d0c', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      borderRadius: '12px',
      border: '1px solid rgba(0,255,200,0.1)'
    }}>
      <div style={{ color: '#00ffc8', fontFamily: 'monospace', animation: 'pulse 1.5s infinite' }}>
        INITIALIZING SATELLITE UPLINK...
      </div>
    </div>
  )
});

export default function WorldMap() {
  return (
    <div className="world-map-wrapper" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      <DynamicMap />
      
      {/* Map Overlay Elements (Safe to SSR) */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1000, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.8)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00ffc8', boxShadow: '0 0 8px #00ffc8' }} />
          Active Network Nodes
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.8)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          <span style={{ display: 'inline-block', width: '16px', height: '2px', borderBottom: '1px dashed rgba(0,255,200,0.8)' }} />
          Secure Data Pipelines
        </div>
      </div>
    </div>
  );
}
