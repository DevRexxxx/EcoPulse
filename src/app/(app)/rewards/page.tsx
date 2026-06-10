'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { redeemReward } from '@/lib/firestore';
import { REWARDS_DATA } from '@/lib/mock/rewardsData';

export default function RewardsPage() {
  const { user, ecoPoints, addEcoPoints } = useUserStore();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<(typeof REWARDS_DATA)[0] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [redeemedIds, setRedeemedIds] = useState<Set<string>>(new Set());

  const handleRedeem = async () => {
    if (!user || !selectedReward) return;
    setRedeemingId(selectedReward.id);

    try {
      const success = await redeemReward(user.uid, selectedReward.id, selectedReward.pointsCost);
      if (success) {
        addEcoPoints(-selectedReward.pointsCost);
        setRedeemedIds((prev) => new Set(prev).add(selectedReward.id));
        setToast(`🎉 Redeemed: ${selectedReward.description}`);
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast('❌ Insufficient EcoPoints');
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Redeem failed:', err);
    } finally {
      setRedeemingId(null);
      setShowModal(false);
    }
  };

  const openRedeem = (reward: (typeof REWARDS_DATA)[0]) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ marginBottom: 8 }}>
          Rewards <span style={{ fontSize: '1.5rem' }}>🎁</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
          Redeem your EcoPoints for eco-friendly rewards
        </p>

        {/* Points Balance */}
        <div
          className="glass-card-glow"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '20px',
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: '2rem' }}>🪙</span>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your Balance</div>
            <div className="text-gradient-gold" style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              {ecoPoints.toLocaleString()} EP
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rewards Grid */}
      <div className="rewards-grid">
        {REWARDS_DATA.map((reward, i) => {
          const canAfford = ecoPoints >= reward.pointsCost;
          const isRedeemed = redeemedIds.has(reward.id);

          return (
            <motion.div
              key={reward.id}
              className="reward-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <span className="reward-icon">{reward.icon}</span>
              <span className="reward-partner">{reward.partnerName}</span>
              <h4>{reward.description}</h4>
              <div className="reward-cost">
                🪙 {reward.pointsCost.toLocaleString()} EP
              </div>
              <div className="reward-expiry">
                Expires: {new Date(reward.expiresAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {isRedeemed ? (
                <span className="badge badge-green" style={{ padding: '10px 16px', textAlign: 'center' }}>
                  ✅ Redeemed
                </span>
              ) : (
                <button
                  className={`btn ${canAfford ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => openRedeem(reward)}
                  disabled={!canAfford}
                  style={{ width: '100%' }}
                >
                  {canAfford ? '🎁 Redeem' : '🔒 Need more EP'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showModal && selectedReward && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirm Redemption</h3>
              <p>
                Redeem <strong>{selectedReward.description}</strong> from{' '}
                <strong>{selectedReward.partnerName}</strong> for{' '}
                <strong style={{ color: 'var(--accent-gold)' }}>
                  {selectedReward.pointsCost} EP
                </strong>
                ?
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleRedeem}
                  disabled={redeemingId !== null}
                >
                  {redeemingId ? 'Redeeming...' : '✅ Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
