'use client';

import { motion } from 'framer-motion';

interface StatsOverviewProps {
  totalCo2Saved: number;
  ecoPoints: number;
  currentStreak: number;
  tripsLogged: number;
}

export default function StatsOverview({ totalCo2Saved, ecoPoints, currentStreak, tripsLogged }: StatsOverviewProps) {
  const stats = [
    { icon: '🌍', label: 'CO₂ Saved', value: `${totalCo2Saved.toFixed(1)} kg`, color: '#10b981' },
    { icon: '🪙', label: 'EcoPoints', value: ecoPoints.toLocaleString(), color: '#F59E0B' },
    { icon: '🔥', label: 'Day Streak', value: currentStreak.toString(), color: '#F97316' },
    { icon: '🗺️', label: 'Trips Logged', value: tripsLogged.toString(), color: '#3B82F6' },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="stat-card"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
            {stat.icon}
          </div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
