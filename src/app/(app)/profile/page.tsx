'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { getUserStats, getUserBadges, deleteUserAccount } from '@/lib/firestore';
import { signOut } from '@/lib/auth';
import { BADGES_CATALOG } from '@/lib/mock/rewardsData';
import { useQuery } from '@tanstack/react-query';

export default function ProfilePage() {
  const { user, ecoPoints, streak, baseline, reset } = useUserStore();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Use React Query to auto-refetch data when returning to the page
  const { data: profileData } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const [stats, badges] = await Promise.all([
        getUserStats(user.uid),
        getUserBadges(user.uid),
      ]);
      return { stats, badges };
    },
    enabled: !!user,
  });

  const stats = profileData?.stats;
  const earnedBadges = profileData?.badges || [];

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUserAccount(user.uid);
      await signOut();
      reset();
      router.push('/auth');
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setDeleting(false);
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badgeId));

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>{user?.displayName}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span className="badge badge-green">🌍 Region: {user?.region || 'IN'}</span>
              <span className="badge badge-gold">🪙 {ecoPoints.toLocaleString()} EP</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ marginBottom: 24 }}
      >
        <h3 style={{ marginBottom: 16 }}>📊 Your Impact</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
          }}
        >
          {[
            { label: 'CO₂ Saved', value: `${stats?.totalCo2SavedKg?.toFixed(1) || '0'} kg`, icon: '🌍' },
            { label: 'Current Streak', value: `${streak.currentStreak} days`, icon: '🔥' },
            { label: 'Longest Streak', value: `${streak.longestStreak} days`, icon: '⭐' },
            { label: 'Trips Logged', value: `${stats?.tripsLogged || 0}`, icon: '🗺️' },
            { label: 'Badges Earned', value: `${earnedBadges.length}`, icon: '🏅' },
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '--', icon: '📅' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: '14px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: 4 }}>{item.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Baseline */}
      {baseline && (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ marginBottom: 24 }}
        >
          <h3 style={{ marginBottom: 16 }}>🎯 Your Baseline</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <span className="badge badge-blue">🍽️ Diet: {baseline.dietType.replace('_', ' ')}</span>
            <span className="badge badge-blue">🚗 Transit: {baseline.transitPref.replace('_', ' ')}</span>
            <span className="badge badge-blue">🏠 Home: {baseline.homeType.replace('_', ' ')}</span>
            <span className="badge badge-blue">⚡ Energy: {baseline.energyUsage}</span>
            <span className="badge badge-blue">🛍️ Shopping: {baseline.shoppingHabit}</span>
          </div>
        </motion.div>
      )}

      {/* Badges */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ marginBottom: 24 }}
      >
        <h3 style={{ marginBottom: 16 }}>🏅 Badge Collection</h3>
        <div className="badge-grid">
          {BADGES_CATALOG.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const earnedData = earnedBadges.find((b) => b.badgeId === badge.id);

            return (
              <div key={badge.id} className={`badge-card ${isEarned ? 'earned' : 'locked'}`}>
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                  {badge.description}
                </div>
                {isEarned && earnedData && (
                  <div className="badge-date">
                    Earned {new Date(earnedData.earnedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </div>
                )}
                {!isEarned && (
                  <div className="badge-date">🔒 Locked</div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <h3 style={{ marginBottom: 12, color: 'var(--accent-red)' }}>⚠️ Danger Zone</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
          🗑️ Delete Account
        </button>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account?</h3>
            <p>
              This will permanently delete your profile, all trip data, points, and badges. This
              action is irreversible.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? 'Deleting...' : '🗑️ Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
