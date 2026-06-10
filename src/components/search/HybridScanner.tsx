'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';

const MOCK_DB = [
  { id: '1', term: 'Beef Burger', type: 'Food', footprint: '4.0 kg CO₂', action: 'Swap for Plant-Based (-3.5 kg)' },
  { id: '2', term: 'Flight (NY to LA)', type: 'Travel', footprint: '850.0 kg CO₂', action: 'Offset carbon via projects' },
  { id: '3', term: 'Air Conditioner (1hr)', type: 'Energy', footprint: '1.2 kg CO₂', action: 'Raise temp by 2°C (-0.4 kg)' },
  { id: '4', term: 'Smartphone (New)', type: 'Tech', footprint: '60.0 kg CO₂', action: 'Buy refurbished (-45 kg)' },
  { id: '5', term: 'Coffee (Latte)', type: 'Food', footprint: '0.4 kg CO₂', action: 'Use oat milk (-0.2 kg)' },
  { id: '6', term: 'Gas Car (10 miles)', type: 'Travel', footprint: '4.1 kg CO₂', action: 'Carpool/Transit (-3 kg)' },
  { id: '7', term: 'Jeans (Cotton)', type: 'Clothing', footprint: '33.4 kg CO₂', action: 'Thrift / Second-hand (-30 kg)' },
];

export default function HybridScanner() {
  const { addEcoPoints, setHasConnectedDevice } = useUserStore();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: Scanning, 2: Success
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter results
  const results = MOCK_DB.filter((item) =>
    item.term.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setScanStep(1);
    
    // Simulate network scan progression
    setTimeout(() => {
      setScanStep(2);
      addEcoPoints(50); // Give 50 EP for syncing a smart device
      setHasConnectedDevice(true); // Enable dashboard widget
    }, 3000);

    setTimeout(() => {
      setIsScanning(false);
      setScanStep(0);
    }, 6000);
  };

  return (
    <>
      {/* Search Bar Component */}
      <div className="cc-search-wrapper" ref={wrapperRef}>
        <div className={`cc-search ${isFocused ? 'focused' : ''}`}>
          <button 
            className="cc-search-icon-btn" 
            onClick={handleScan}
            title="Scan IoT Network"
          >
            ⊙
          </button>
          <input
            type="text"
            className="cc-search-input"
            placeholder="Search items or Scan Network..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
        </div>

        {/* Action Database Dropdown */}
        <AnimatePresence>
          {isFocused && query.length > 0 && (
            <motion.div
              className="cc-search-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {results.length > 0 ? (
                results.map((result) => (
                  <div key={result.id} className="cc-search-result">
                    <div className="cc-search-result-header">
                      <span className="cc-search-result-title">{result.term}</span>
                      <span className="cc-search-result-type">{result.type}</span>
                    </div>
                    <div className="cc-search-result-data">
                      <span className="cc-search-result-footprint">{result.footprint}</span>
                    </div>
                    <div className="cc-search-result-action">
                      💡 {result.action}
                    </div>
                  </div>
                ))
              ) : (
                <div className="cc-search-empty">
                  No records found in the Global Carbon DB.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Network Scanner Modal */}
      <AnimatePresence>
        {isScanning && (
          <div className="scanner-overlay">
            <motion.div
              className="scanner-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {scanStep === 1 ? (
                <div className="scanner-active">
                  <div className="radar"></div>
                  <h3>Scanning Local Network</h3>
                  <p>Searching for compatible IoT & Smart Home devices...</p>
                  <div className="scanner-logs">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>&gt; pinging 192.168.1.1...</motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>&gt; detecting protocols: zigbee, matter, wifi</motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>&gt; handshake initiated...</motion.div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  className="scanner-success"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="scanner-icon-success">✓</div>
                  <h3>Smart Device Synced</h3>
                  <p><strong>Nest Thermostat (Living Room)</strong> detected and linked.</p>
                  <p className="scanner-reward">Live tracking enabled. +50 EP awarded.</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
