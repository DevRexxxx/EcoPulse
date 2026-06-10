'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { generateLeaderboard } from '@/lib/mock/leaderboardData';

export default function LeaderboardPage() {
  const { user, ecoPoints } = useUserStore();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const leaderboard = useMemo(
    () => generateLeaderboard(user?.displayName || 'You', ecoPoints),
    [user, ecoPoints]
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ marginBottom: 8 }}>
          Leaderboard <span style={{ fontSize: '1.5rem' }}>🏆</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          See how you rank in your neighborhood
        </p>

        <div className="chart-toggle" style={{ marginBottom: 24, display: 'inline-flex' }}>
          <button
            className={period === 'weekly' ? 'active' : ''}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
          <button
            className={period === 'monthly' ? 'active' : ''}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 12,
          marginBottom: 32,
          padding: '0 20px',
        }}
      >
        {[1, 0, 2].map((idx) => {
          const entry = leaderboard[idx];
          if (!entry) return null;
          const isFirst = idx === 0;
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + idx * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: isFirst ? '24px 20px' : '16px 16px',
                background: entry.isCurrentUser ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                border: `1px solid ${entry.isCurrentUser ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-xl)',
                minWidth: isFirst ? 140 : 120,
                boxShadow: entry.isCurrentUser ? 'var(--shadow-glow)' : 'none',
              }}
            >
              <span style={{ fontSize: isFirst ? '2.5rem' : '2rem' }}>{medals[idx]}</span>
              <div
                style={{
                  width: isFirst ? 56 : 44,
                  height: isFirst ? 56 : 44,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isFirst ? '1.2rem' : '0.9rem',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {entry.displayName.slice(0, 2)}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
                {entry.displayName}
              </div>
              <div style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: '1rem' }}>
                {entry.ecoPoints.toLocaleString()} EP
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Full List */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="leaderboard-list">
          {leaderboard.slice(3).map((entry, i) => (
            <motion.div
              key={entry.rank}
              className={`leaderboard-row ${entry.isCurrentUser ? 'current-user' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.03 }}
            >
              <div
                className="rank"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}
              >
                {entry.rank}
              </div>
              <div className="user-info">
                <div className="name">
                  {entry.displayName}
                  {entry.isCurrentUser && <span style={{ color: 'var(--green-400)' }}> (You)</span>}
                </div>
              </div>
              <div className="score">
                <div className="points">{entry.ecoPoints.toLocaleString()} EP</div>
                <div className="co2">{entry.co2SavedKg} kg saved</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
