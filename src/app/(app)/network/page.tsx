'use client';

import { motion } from 'framer-motion';
import WorldMap from '@/components/network/WorldMap';

export default function NetworkPage() {
  return (
    <div className="cc-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', paddingBottom: '24px' }}>
      
      {/* Page Header */}
      <div className="cc-page-header">
        <div>
          <h2 className="cc-page-title">
            <span className="cc-title-icon">◎</span>
            Live Global Network
          </h2>
          <p className="cc-page-subtitle">Real-time carbon mitigation feeds from active nodes worldwide</p>
        </div>
        
        <div className="cc-header-actions">
          <div className="cc-status-badge" style={{ backgroundColor: 'rgba(0, 255, 200, 0.1)', color: '#00ffc8', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(0, 255, 200, 0.3)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold' }}>
            <span className="cc-icon-dot" style={{ position: 'static' }} />
            NETWORK ONLINE
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <motion.div 
        className="cc-bento-card" 
        style={{ flex: 1, minHeight: '600px', display: 'flex', flexDirection: 'column', padding: '16px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="cc-card-label">GLOBAL MITIGATION FEED</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>SATCOM UPLINK: SECURE</div>
        </div>
        
        <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden' }}>
          <WorldMap />
        </div>
      </motion.div>

      {/* Stats row below map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <motion.div 
          className="cc-bento-card cc-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="cc-card-label">ACTIVE NODES</div>
          <div className="cc-stat-value cc-stat-cyan">
            12
            <span className="cc-stat-unit">Cities</span>
          </div>
        </motion.div>

        <motion.div 
          className="cc-bento-card cc-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="cc-card-label">GLOBAL MITIGATION RATE</div>
          <div className="cc-stat-value cc-stat-cyan">
            1.4k
            <span className="cc-stat-unit">kg/hr</span>
          </div>
        </motion.div>

        <motion.div 
          className="cc-bento-card cc-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="cc-card-label">NETWORK LATENCY</div>
          <div className="cc-stat-value cc-stat-cyan">
            24
            <span className="cc-stat-unit">ms</span>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
