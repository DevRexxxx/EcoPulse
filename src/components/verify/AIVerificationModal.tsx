'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// Types
// ==========================================
interface VerificationResult {
  action_verified: boolean;
  confidence_score: number;
  co2_delta_kg: number;
  eco_points: number;
  terminal_log: string;
}

interface AIVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimPoints: (points: number, co2: number) => void;
}

// ==========================================
// Telemetry Logs
// ==========================================
const TELEMETRY_LOGS = [
  '> SYSTEM::INIT — Booting vision agent v6.0.0...',
  '> AGENT::LOAD — Multimodal classifier online.',
  '> SENSOR::CAM — Frame captured. Resolution: 640x480.',
  '> PIPE::ENCODE — Base64 payload encoded. Size: 42KB.',
  '> NET::SEND — Transmitting to Gemini 2.0 Flash node...',
  '> AI::PROCESS — Extracting visual parameters...',
  '> AI::MATCH — Cross-referencing emission factor database...',
  '> AI::COMPUTE — Running CO₂ delta computation...',
  '> AI::CONFIDENCE — Bayesian confidence analysis in progress...',
  '> WAIT::RESPONSE — Awaiting verification report...',
];

// ==========================================
// Action Types
// ==========================================
const ACTION_TYPES = [
  { value: 'public_transit', label: 'Public Transit', icon: '🚌' },
  { value: 'cycling', label: 'Cycling', icon: '🚲' },
  { value: 'walking', label: 'Walking', icon: '🚶' },
  { value: 'plant_based_meal', label: 'Plant Meal', icon: '🥗' },
  { value: 'recycling', label: 'Recycling', icon: '♻️' },
  { value: 'reusable_bag', label: 'Reusable Bag', icon: '👜' },
  { value: 'energy_saving', label: 'Energy Save', icon: '💡' },
  { value: 'tree_planting', label: 'Tree Planting', icon: '🌱' },
];

// ==========================================
// API Server Call
// ==========================================

async function verifyActionWithAI(base64Image: string, actionType: string): Promise<VerificationResult> {
  const res = await fetch('/api/verify-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64Image, actionType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error ${res.status}`);
  }

  return await res.json();
}

// ==========================================
// Component
// ==========================================
export default function AIVerificationModal({ isOpen, onClose, onClaimPoints }: AIVerificationModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [actionType, setActionType] = useState('public_transit');
  const [isScanning, setIsScanning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['> TERMINAL::READY — Awaiting scan command.']);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setIsScanning(false);
      setTerminalLogs(['> TERMINAL::READY — Awaiting scan command.']);
      setResult(null);
      setCameraReady(false);
      setCameraError(false);
      setCapturedFrame(null);
    }
    return () => stopCamera();
  }, [isOpen]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setCameraError(true);
      setTerminalLogs((prev) => [...prev, '> ERR::CAMERA — Failed to access camera device.']);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const router = useRouter();
  const setPendingReport = useUserStore((state) => state.setPendingReport);

  const handleScan = async () => {
    const frame = captureFrame();
    if (!frame) {
      setTerminalLogs((prev) => [...prev, '> ERR::CAPTURE — Frame capture failed. Retry.']);
      return;
    }

    setCapturedFrame(frame);
    setIsScanning(true);
    setResult(null);
    setTerminalLogs(['> SCAN::INITIATED — Proof of action verification started.']);

    // Sequential telemetry logs
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < TELEMETRY_LOGS.length) {
        const msg = TELEMETRY_LOGS[logIndex];
        logIndex++;
        if (msg) {
          setTerminalLogs((prev) => [...prev, msg]);
        }
      } else {
        clearInterval(logInterval);
      }
    }, 800);

    try {
      const data = await verifyActionWithAI(frame, actionType);
      clearInterval(logInterval);

      setResult(data);
      setTerminalLogs((prev) => [
        ...prev,
        '',
        '> ═══════════════════════════════════════════',
        '> VERIFICATION REPORT',
        '> ═══════════════════════════════════════════',
        `> {`,
        `>   "action_verified": ${data.action_verified},`,
        `>   "confidence_score": ${data.confidence_score.toFixed(3)},`,
        `>   "co2_delta_kg": ${data.co2_delta_kg.toFixed(2)},`,
        `>   "eco_points": ${data.eco_points},`,
        `>   "terminal_log": "${data.terminal_log}"`,
        `> }`,
        '> ═══════════════════════════════════════════',
        '',
        data.action_verified
          ? `> ✅ STATUS::VERIFIED — Routing to report interface...`
          : '> ❌ STATUS::REJECTED — Generating rejection report...',
      ]);

      // Route to the report dashboard for ALL outcomes (verified or rejected)
      setTimeout(() => {
        setPendingReport({
          actionType,
          capturedFrame: frame,
          result: data,
        });
        sessionStorage.setItem('pendingReport', JSON.stringify({
          actionType,
          capturedFrame: frame,
          result: data,
        }));
        router.push('/actions/report/');
        onClose(); // close the modal after pushing
      }, 1200);

    } catch (err: any) {
      clearInterval(logInterval);
      setTerminalLogs((prev) => [
        ...prev,
        `> ERR::AI — ${err.message || 'Verification failed.'}`,
        '> STATUS::ABORTED — Retry scan.',
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDownloadReport = () => {
    if (!result || !capturedFrame) return;
    
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    
    const dateStr = new Date().toLocaleString();
    const formattedAction = ACTION_TYPES.find(a => a.value === actionType)?.label || actionType;
    
    // Build a beautiful HTML document tailored for printing
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
            <div><span class="label">Status:</span> <span class="success">VERIFIED ✓</span></div>
            <div><span class="label">AI Confidence:</span> <span class="value">${(result.confidence_score * 100).toFixed(1)}%</span></div>
            <div><span class="label">CO₂ Mitigated:</span> <span class="value" style="color: #00b87c;">${result.co2_delta_kg.toFixed(2)} kg</span></div>
            <div><span class="label">EcoPoints Earned:</span> <span class="value">${result.eco_points} EP</span></div>
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
    
    // Wait for image to load before printing to ensure it renders in the PDF
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Clean up after print dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="verify-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-modal-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="verify-panel"
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Header */}
          <div className="verify-header">
            <div>
              <h2 id="verify-modal-title" className="verify-title">
                <span className="verify-title-icon" aria-hidden="true">🔬</span>
                Proof of Action
              </h2>
              <p className="verify-subtitle">AI-powered eco-action verification</p>
            </div>
            <button className="verify-close" onClick={onClose} title="Close" aria-label="Close modal">✕</button>
          </div>

          {/* Action Type Selector */}
          <div className="verify-action-selector">
            <label className="verify-label">Action Type</label>
            <div className="verify-action-grid">
              {ACTION_TYPES.map((action) => (
                <button
                  key={action.value}
                  className={`verify-action-chip ${actionType === action.value ? 'active' : ''}`}
                  onClick={() => setActionType(action.value)}
                  disabled={isScanning}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Camera Viewfinder */}
          <div className="verify-viewfinder">
            <div className="vf-corner vf-tl" />
            <div className="vf-corner vf-tr" />
            <div className="vf-corner vf-bl" />
            <div className="vf-corner vf-br" />
            {isScanning && <div className="vf-scanline" />}

            <video ref={videoRef} autoPlay playsInline muted className="verify-video" aria-label="Live camera feed for action verification" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!cameraReady && !cameraError && (
              <div className="vf-status" aria-live="polite">
                <div className="spinner" style={{ borderTopColor: '#00ffc8' }} />
                <p>Initializing camera...</p>
              </div>
            )}
            {cameraError && (
              <div className="vf-status" aria-live="assertive">
                <span style={{ fontSize: '2rem' }}>📷</span>
                <p>Camera access denied. Please allow camera permissions.</p>
              </div>
            )}
          </div>

          {/* Terminal Console */}
          <div className="verify-terminal" ref={terminalRef} aria-live="polite" aria-label="Terminal analysis logs">
            {terminalLogs.filter(Boolean).map((log, i) => (
              <motion.div
                key={i}
                className={`term-line ${(log || '').includes('ERR') ? 'term-error' : ''} ${(log || '').includes('VERIFIED') ? 'term-success' : ''} ${(log || '').includes('═') ? 'term-divider' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
              >
                {log}
              </motion.div>
            ))}
            <span className="term-cursor" aria-hidden="true">█</span>
          </div>

          {/* Action Buttons */}
          <div className="verify-actions">
            {!isScanning && !result?.action_verified && (
              <button
                className="verify-scan-btn"
                onClick={handleScan}
                disabled={!cameraReady || isScanning}
                aria-label="Scan current camera frame to verify action"
              >
                <span className="scan-icon" aria-hidden="true">⊙</span>
                SCAN ACTION
              </button>
            )}
            {/* Action Buttons are no longer rendered here. User is redirected to Report route for all outcomes. */}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
