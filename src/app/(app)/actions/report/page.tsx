'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { logCompletedAction } from '@/lib/firestore';

export default function ReportPage() {
  const router = useRouter();
  const { user, pendingReport: storeReport, setPendingReport, addEcoPoints } = useUserStore();
  const [claiming, setClaiming] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    // If we have a store report, use it
    if (storeReport) {
      setReport(storeReport);
      return;
    }

    // Otherwise try to recover from sessionStorage (fixes hard reload data loss)
    const storedStr = sessionStorage.getItem('pendingReport');
    if (storedStr) {
      try {
        const parsed = JSON.parse(storedStr);
        setReport(parsed);
        setPendingReport(parsed); // Restore to store
      } catch (e) {
        router.push('/actions');
      }
    } else {
      router.push('/actions');
    }
  }, [storeReport, router, setPendingReport]);

  if (!report) return null;

  const { actionType, capturedFrame, result } = report;

  const handleClaim = async () => {
    if (!user || claiming) return;

    if (!result.action_verified) {
      setPendingReport(null);
      router.push('/actions');
      return;
    }

    setClaiming(true);

    try {
      await logCompletedAction(user.uid, `AI Verified: ${actionType}`, result.co2_delta_kg, result.eco_points);
      addEcoPoints(result.eco_points);
      setSuccessMsg(`Successfully claimed ${result.eco_points} EcoPoints!`);
      
      // Clear the report from state
      setTimeout(() => {
        setPendingReport(null);
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to claim verified points:', err);
      setClaiming(false);
    }
  };

  const handleDownloadReport = () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    
    const dateStr = new Date().toLocaleString();
    const formattedAction = actionType.replace('_', ' ').toUpperCase();
    
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>EcoPulse_Verification_Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px solid #00F2A6; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #00F2A6; }
            .title { font-size: 24px; margin-top: 10px; color: #333; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; text-align: center; }
            .section { margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 5px solid #00F2A6; }
            .label { font-weight: bold; color: #444; width: 150px; display: inline-block; }
            .value { font-weight: 600; color: #111; }
            .success { color: #00b87c; font-weight: bold; }
            .failed { color: #e74c3c; font-weight: bold; }
            .image-container { text-align: center; margin-top: 40px; }
            .proof-img { max-width: 100%; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #ddd; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            .terminal-log { font-family: monospace; background: #1e1e1e; color: #00F2A6; padding: 15px; border-radius: 6px; margin-top: 10px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌍 EcoPulse</div>
            <div class="title">Official AI Verification Report</div>
          </div>
          <div class="meta">Generated on: ${dateStr}</div>
          <div class="section">
            <div><span class="label">Action Type:</span> <span class="value">${formattedAction}</span></div>
            <div><span class="label">Status:</span> <span class="${result.action_verified ? 'success' : 'failed'}">${result.action_verified ? 'VERIFIED ✓' : 'REJECTED ❌'}</span></div>
            <div><span class="label">AI Confidence:</span> <span class="value">${(result.confidence_score * 100).toFixed(1)}%</span></div>
            <div><span class="label">CO₂ Mitigated:</span> <span class="value" style="color: ${result.action_verified ? '#00b87c' : '#888'};">${result.action_verified ? result.co2_delta_kg.toFixed(2) : '0.00'} kg</span></div>
            <div><span class="label">EcoPoints Earned:</span> <span class="value">${result.action_verified ? result.eco_points : 0} EP</span></div>
          </div>
          <div class="section">
            <div class="label" style="display:block; margin-bottom:10px;">Automated Terminal Analysis:</div>
            <div class="terminal-log">${result.terminal_log}</div>
          </div>
          <div class="image-container">
            <h3 style="color:#444; margin-bottom:15px;">Cryptographic Proof of Action</h3>
            <img src="${capturedFrame}" class="proof-img" alt="Captured cryptographic proof of environmental action" />
          </div>
          <div class="footer">
            This report was generated securely and autonomously by the EcoPulse Generative AI Engine.<br/>
            Verification ID: EP-${Math.random().toString(36).substring(2, 10).toUpperCase()}
          </div>
        </body>
      </html>
    `);
    doc.close();
    
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  return (
    <div className="report-container" style={{ paddingBottom: '100px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(0,255,200,0.6))' }}>🔬</span>
          <h1 style={{ color: result.action_verified ? '#00ffc8' : '#ff4a4a', fontFamily: 'var(--font-display)', marginTop: 10 }}>Verification Report</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            {result.action_verified ? 'AI Analysis Complete. Action Authenticated.' : 'AI Analysis Complete. Action Denied.'}
          </p>
        </div>

        <div className="cc-bento-grid report-grid" role="region" aria-label="Verification Results Overview">
          
          {/* Left Column: Proof Image */}
          <div className="cc-bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,200,0.2)' }}>
            <h3 style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 15, fontSize: '0.9rem', letterSpacing: '0.1em' }}>CRYPTOGRAPHIC PROOF</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={capturedFrame} 
              alt="Snapshot of the environmental action used for AI verification" 
              style={{ width: '100%', borderRadius: '8px', border: '2px solid rgba(0,255,200,0.3)', boxShadow: '0 0 20px rgba(0,255,200,0.1)' }} 
            />
          </div>

          {/* Right Column: Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="cc-bento-card" style={{ background: result.action_verified ? 'linear-gradient(135deg, rgba(0,255,200,0.1) 0%, rgba(0,100,50,0.05) 100%)' : 'linear-gradient(135deg, rgba(255,74,74,0.1) 0%, rgba(100,0,0,0.05) 100%)', border: `1px solid ${result.action_verified ? 'rgba(0,255,200,0.4)' : 'rgba(255,74,74,0.4)'}` }}>
              <div style={{ color: result.action_verified ? '#00ffc8' : '#ff4a4a', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: 5 }}>
                {result.action_verified ? 'ECOPOINTS AWARDED' : 'ECOPOINTS DENIED'}
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', textShadow: result.action_verified ? '0 0 15px rgba(0,255,200,0.4)' : 'none' }} aria-label={`${result.eco_points} EcoPoints`}>
                {result.action_verified ? result.eco_points : 0} <span style={{ fontSize: '1.2rem', color: result.action_verified ? '#00ffc8' : '#888' }} aria-hidden="true">EP</span>
              </div>
            </div>

            <div className="cc-bento-card" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: 5 }}>CO₂ MITIGATED</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: result.action_verified ? '#00ffc8' : '#888' }} aria-label={`${result.co2_delta_kg.toFixed(2)} kilograms`}>
                {result.action_verified ? result.co2_delta_kg.toFixed(2) : '0.00'} <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)' }} aria-hidden="true">kg</span>
              </div>
            </div>

            <div className="cc-bento-card" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: 5 }}>AI CONFIDENCE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff' }} aria-label={`${(result.confidence_score * 100).toFixed(1)} percent`}>
                {(result.confidence_score * 100).toFixed(1)}%
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '8px', borderRadius: '2px' }} role="progressbar" aria-valuenow={result.confidence_score * 100} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${result.confidence_score * 100}%`, height: '100%', background: result.action_verified ? '#00ffc8' : '#ff4a4a', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>

          {/* Terminal Logs Full Width */}
          <div className="cc-bento-card" style={{ gridColumn: '1 / -1', background: '#0a0a0a', border: '1px solid rgba(0,255,200,0.15)' }}>
            <div style={{ color: '#00ffc8', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, borderColor: '#00ffc8', borderTopColor: 'transparent' }} aria-hidden="true" />
              TERMINAL ANALYSIS
            </div>
            <div style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }} aria-live="polite">
              {result.terminal_log}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '20px', marginTop: 40, justifyContent: 'center' }}>
          <button 
            className="btn" 
            onClick={handleDownloadReport}
            style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
            aria-label="Download verification report as PDF"
          >
            📄 Download PDF
          </button>

          <button 
            className="cc-btn-glow" 
            onClick={handleClaim}
            disabled={claiming}
            style={{ 
              padding: '16px 48px', 
              fontSize: '1.1rem', 
              width: 'auto',
              background: result.action_verified ? '' : 'rgba(255,74,74,0.1)',
              borderColor: result.action_verified ? '' : '#ff4a4a',
              color: result.action_verified ? '' : '#ff4a4a',
              boxShadow: result.action_verified ? '' : '0 0 15px rgba(255,74,74,0.2)'
            }}
          >
            {claiming ? 'Processing...' : (result.action_verified ? '🪙 Claim Reward & Return' : '↻ Return & Try Again')}
          </button>
        </div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#00ffc8',
              color: '#000',
              padding: '16px 32px',
              borderRadius: '30px',
              fontWeight: 'bold',
              boxShadow: '0 10px 30px rgba(0,255,200,0.3)',
              zIndex: 1000
            }}
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
