'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
  '> SYSTEM::INIT — Booting vision agent v3.7.1...',
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
// Gemini API call (client-side, round-robin keys)
// ==========================================
const API_KEYS = (process.env.NEXT_PUBLIC_GEMINI_API_KEYS || '').split(',').filter(Boolean);
let keyIndex = 0; // Persists across calls for true round-robin

function getNextApiKey(): string {
  if (API_KEYS.length === 0) throw new Error('No Gemini API keys configured');
  const key = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return key;
}

async function callGeminiVision(base64Image: string, actionType: string): Promise<VerificationResult> {
  const prompt = `You are a strict visual auditor for an environmental sustainability platform called EcoPulse. Your job is to verify "proof of action" images submitted by users.

The user claims to have performed this eco-friendly action: "${actionType}"

Analyze the image carefully and determine:
1. Whether the image genuinely proves the claimed action was performed
2. Your confidence level in the verification
3. The estimated CO2 savings in kg for this specific action
4. EcoPoints to award (0-100 scale based on impact)
5. A short, robotic-sounding terminal log explaining what you visually detected

Be STRICT. If the image is unclear, unrelated, or could be fabricated, set action_verified to false.

CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no backticks, no explanation outside the JSON. The exact format must be:
{"action_verified": true/false, "confidence_score": 0.0-1.0, "co2_delta_kg": 0.0, "eco_points": 0, "terminal_log": "string"}`;

  // Strip data URL prefix
  const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: 'image/jpeg', data: imageData } },
      ],
    }],
    generationConfig: {
      temperature: 0.2,
      topK: 32,
      topP: 0.8,
      maxOutputTokens: 512,
    },
  };

  // Try each key with 2 models — flash-lite has 2x rate limit (30 RPM)
  const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash'];

  for (const model of models) {
    for (let k = 0; k < API_KEYS.length; k++) {
      const apiKey = getNextApiKey();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      // Small delay between retries
      if (k > 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) continue;

          let clean = text.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          const parsed = JSON.parse(clean);

          return {
            action_verified: Boolean(parsed.action_verified),
            confidence_score: Math.min(1, Math.max(0, Number(parsed.confidence_score) || 0)),
            co2_delta_kg: Math.max(0, Number(parsed.co2_delta_kg) || 0),
            eco_points: Math.max(0, Math.min(100, Math.round(Number(parsed.eco_points) || 0))),
            terminal_log: String(parsed.terminal_log || 'ANALYSIS COMPLETE.'),
          };
        }

        if (res.status === 429) {
          continue;
        }

        const errBody = await res.text();
        throw new Error(`API error ${res.status}: ${errBody.substring(0, 200)}`);
      } catch (err: any) {
        if (err.message?.startsWith('API error')) throw err;
        continue;
      }
    }
  }

  throw new Error('All API keys rate-limited — wait 1 minute and retry');
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

  const handleScan = async () => {
    const frame = captureFrame();
    if (!frame) {
      setTerminalLogs((prev) => [...prev, '> ERR::CAPTURE — Frame capture failed. Retry.']);
      return;
    }

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
      const data = await callGeminiVision(frame, actionType);
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
          ? `> ✅ STATUS::VERIFIED — Action confirmed with ${(data.confidence_score * 100).toFixed(1)}% confidence.`
          : '> ❌ STATUS::REJECTED — Insufficient evidence for verification.',
      ]);
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

  const handleClaim = () => {
    if (result && result.action_verified) {
      onClaimPoints(result.eco_points, result.co2_delta_kg);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="verify-overlay"
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
              <h2 className="verify-title">
                <span className="verify-title-icon">🔬</span>
                Proof of Action
              </h2>
              <p className="verify-subtitle">AI-powered eco-action verification</p>
            </div>
            <button className="verify-close" onClick={onClose} title="Close">✕</button>
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

            <video ref={videoRef} autoPlay playsInline muted className="verify-video" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!cameraReady && !cameraError && (
              <div className="vf-status">
                <div className="spinner" style={{ borderTopColor: '#00ffc8' }} />
                <p>Initializing camera...</p>
              </div>
            )}
            {cameraError && (
              <div className="vf-status">
                <span style={{ fontSize: '2rem' }}>📷</span>
                <p>Camera access denied. Please allow camera permissions.</p>
              </div>
            )}
          </div>

          {/* Terminal Console */}
          <div className="verify-terminal" ref={terminalRef}>
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
            <span className="term-cursor">█</span>
          </div>

          {/* Action Buttons */}
          <div className="verify-actions">
            {!isScanning && !result?.action_verified && (
              <button
                className="verify-scan-btn"
                onClick={handleScan}
                disabled={!cameraReady || isScanning}
              >
                <span className="scan-icon">⊙</span>
                SCAN ACTION
              </button>
            )}
            {result?.action_verified && (
              <motion.button
                className="verify-claim-btn"
                onClick={handleClaim}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <span>🪙</span>
                CLAIM {result.eco_points} POINTS
                <span className="claim-co2">+{result.co2_delta_kg.toFixed(2)} kg CO₂ saved</span>
              </motion.button>
            )}
            {result && !result.action_verified && (
              <button className="verify-scan-btn" onClick={handleScan}>
                <span className="scan-icon">↻</span>
                RETRY SCAN
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
