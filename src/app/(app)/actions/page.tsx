'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { generateSuggestions } from '@/lib/mock/actionEngine';
import { awardPoints, logCompletedAction } from '@/lib/firestore';
import dynamic from 'next/dynamic';
import type { ActionSuggestion } from '@/types';

// Lazy load the heavy AI camera modal to drastically reduce initial JS bundle size
const AIVerificationModal = dynamic(() => import('@/components/verify/AIVerificationModal'), {
  ssr: false
});

const CATEGORY_ICONS: Record<string, string> = {
  mobility: '🚗',
  diet: '🍽️',
  energy: '⚡',
  shopping: '🛍️',
};

const CATEGORY_COLORS: Record<string, string> = {
  mobility: '#3B82F6',
  diet: '#10b981',
  energy: '#F59E0B',
  shopping: '#8B5CF6',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'badge-green',
  medium: 'badge-gold',
  hard: 'badge-red',
};

export default function ActionsPage() {
  const { user, baseline, addEcoPoints } = useUserStore();
  const [suggestions, setSuggestions] = useState<ActionSuggestion[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [showVerify, setShowVerify] = useState(false);

  useEffect(() => {
    setSuggestions(generateSuggestions(baseline, 3));
  }, [baseline]);

  const handleComplete = async (suggestion: ActionSuggestion) => {
    if (!user || completedIds.has(suggestion.id)) return;

    try {
      await logCompletedAction(user.uid, suggestion.suggestion, suggestion.co2SavedKg, suggestion.ecoPoints);
      addEcoPoints(suggestion.ecoPoints);
      setCompletedIds((prev) => new Set(prev).add(suggestion.id));
      setToast(`+${suggestion.ecoPoints} EcoPoints earned! 🎉`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Failed to complete action:', err);
    }
  };

  const handleRefresh = () => {
    setSuggestions(generateSuggestions(baseline, 3));
    setCompletedIds(new Set());
  };

  const handleClaimVerifiedPoints = async (points: number, co2: number) => {
    if (!user) return;
    try {
      await logCompletedAction(user.uid, 'AI Verified Action', co2, points);
      addEcoPoints(points);
      setToast(`🔬 Verified! +${points} EcoPoints & ${co2.toFixed(2)} kg CO₂ saved!`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error('Failed to claim verified points:', err);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-header" style={{ marginBottom: 28 }}>
          <div>
            <h1>
              Actions <span style={{ fontSize: '1.5rem' }}>⚡</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
              Personalized eco-suggestions powered by AI
            </p>
          </div>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            🔄 Refresh
          </button>
        </div>
      </motion.div>

      {/* Proof of Action Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        style={{ marginBottom: 24 }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 200, 0.06) 0%, rgba(0, 180, 255, 0.04) 100%)',
            border: '1px solid rgba(0, 255, 200, 0.15)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 0 6px rgba(0,255,200,0.5))' }}>🔬</span>
              <h3 style={{ color: '#00ffc8', fontSize: '1.1rem' }}>Proof of Action</h3>
              <span className="badge" style={{ background: 'rgba(0,255,200,0.12)', color: '#00ffc8', fontSize: '0.65rem' }}>
                AI POWERED
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Snap a photo of your eco-action (bus ticket, bike, recycling) and our AI will verify it in real-time to award bonus points.
            </p>
          </div>
          <button
            onClick={() => setShowVerify(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: 'rgba(0, 255, 200, 0.1)',
              border: '2px solid rgba(0, 255, 200, 0.35)',
              borderRadius: '14px',
              color: '#00ffc8',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.boxShadow = '0 0 25px rgba(0,255,200,0.2)';
              (e.target as HTMLElement).style.borderColor = 'rgba(0,255,200,0.6)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.boxShadow = 'none';
              (e.target as HTMLElement).style.borderColor = 'rgba(0,255,200,0.35)';
            }}
          >
            📷 Scan & Verify
          </button>
        </div>
      </motion.div>

      <div className="actions-list">
        <AnimatePresence>
          {suggestions.map((suggestion, i) => {
            const isCompleted = completedIds.has(suggestion.id);
            return (
              <motion.div
                key={suggestion.id}
                className="action-card"
                initial={{ opacity: 0, x: -30 }}
                animate={{
                  opacity: isCompleted ? 0.5 : 1,
                  x: 0,
                }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={isCompleted ? { pointerEvents: 'none' } : {}}
              >
                <div
                  className="action-icon"
                  style={{
                    background: `${CATEGORY_COLORS[suggestion.category]}15`,
                    color: CATEGORY_COLORS[suggestion.category],
                  }}
                >
                  {CATEGORY_ICONS[suggestion.category]}
                </div>

                <div className="action-body">
                  <h4>{suggestion.suggestion}</h4>

                  <div className="action-meta">
                    <span className="badge badge-green">🌍 {suggestion.co2SavedKg} kg CO₂</span>
                    <span className="badge badge-gold">🪙 +{suggestion.ecoPoints} EP</span>
                    <span className={`badge ${DIFFICULTY_COLORS[suggestion.difficulty]}`}>
                      {suggestion.difficulty}
                    </span>
                  </div>

                  <div className="action-actions">
                    {isCompleted ? (
                      <span className="badge badge-green" style={{ padding: '8px 16px' }}>
                        ✅ Completed
                      </span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => handleComplete(suggestion)}>
                        ✅ Complete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* AI Verification Modal */}
      <AIVerificationModal
        isOpen={showVerify}
        onClose={() => setShowVerify(false)}
        onClaimPoints={handleClaimVerifiedPoints}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast toast-success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
