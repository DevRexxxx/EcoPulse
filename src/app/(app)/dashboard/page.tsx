'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import { getEmissionsHistory } from '@/services/tripService';
import dynamic from 'next/dynamic';
import type { EmissionDataPoint } from '@/types';

// Lazy load heavy charting libraries to optimize initial page load speed
const CarbonGraph = dynamic(() => import('@/components/dashboard/CarbonGraph'), { 
  ssr: false,
  loading: () => <div className="spinner" style={{ margin: 'auto', marginTop: '40px' }} />
});

import ConnectedDevicesWidget from '@/components/dashboard/ConnectedDevicesWidget';

// ==========================================
// Sector Grid Leaderboard Data (Mock)
// ==========================================
const SECTOR_GRID = [
  { rank: 1, name: 'Mumbai Metro', credits: '28,410 CR', delta: '+12.4%' },
  { rank: 2, name: 'Delhi NCR Grid', credits: '22,090 CR', delta: '+8.7%' },
  { rank: 3, name: 'Bengaluru Tech Node', credits: '19,750 CR', delta: '+5.2%' },
  { rank: 4, name: 'Your Local Node (You)', credits: '14,050 CR', delta: '+3.8%', isUser: true },
  { rank: 5, name: 'Chennai Core', credits: '11,200 CR', delta: '+1.1%' },
];

// ==========================================
// Animated Counter Hook
// ==========================================
function useAnimatedValue(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [target, duration]);
  return value;
}

// ==========================================
// Mini Area Chart (SVG)
// ==========================================
function MiniAreaChart() {
  const points = [20, 35, 28, 45, 38, 55, 48, 62, 56, 70, 65, 78, 72, 85, 80, 92];
  const width = 600;
  const height = 200;
  const maxVal = Math.max(...points);
  const step = width / (points.length - 1);

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (p / maxVal) * height}`)
    .join(' ');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="cc-hero-chart" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00F2A6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00F2A6" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGradient)" />
      <path d={pathD} fill="none" stroke="#00F2A6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ==========================================
// Stagger Animation Config
// ==========================================
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, delay: i * 0.05, ease: [0.34, 1.56, 0.64, 1] },
  }),
};

// ==========================================
// Dashboard Page
// ==========================================
export default function DashboardPage() {
  const { user, streak } = useUserStore();
  const [chartData, setChartData] = useState<EmissionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const co2Counter = useAnimatedValue(42891, 1200);
  const creditsCounter = useAnimatedValue(14050, 1000);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const history = await getEmissionsHistory(user.uid, 14);
      setChartData(history);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user, loadDashboardData]);

  return (
    <div className="cc-bento-grid">
      {/* ========== HERO CARD — Global CO2 Mitigation ========== */}
      <motion.div
        className="cc-bento-card cc-hero-card"
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <MiniAreaChart />
        <div className="cc-hero-content">
          <div className="cc-card-label">GLOBAL CO₂ MITIGATION</div>
          <div className="cc-hero-value">
            {co2Counter.toLocaleString()}
            <span className="cc-hero-unit">tons</span>
          </div>
          <div className="cc-hero-meta">
            <span className="cc-delta-positive">▲ 12.4%</span>
            <span className="cc-meta-sep">·</span>
            <span className="cc-meta-text">vs. previous cycle</span>
          </div>
        </div>
      </motion.div>

      {/* ========== CONNECTED DEVICES WIDGET ========== */}
      <motion.div
        className="cc-devices-card"
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <ConnectedDevicesWidget />
      </motion.div>

      {/* ========== SECTOR GRID — Leaderboard ========== */}
      <motion.div
        className="cc-bento-card cc-sector-card"
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="cc-card-label">SECTOR GRID</div>
        <div className="cc-card-sublabel">Live Network Rankings</div>

        <div className="cc-sector-list">
          {SECTOR_GRID.map((sector) => (
            <div
              key={sector.rank}
              className={`cc-sector-item ${sector.isUser ? 'cc-sector-you' : ''}`}
            >
              <div className="cc-sector-rank">
                {sector.rank <= 3 ? ['◈', '◇', '△'][sector.rank - 1] : `${sector.rank}`}
              </div>
              <div className="cc-sector-info">
                <div className="cc-sector-name">{sector.name}</div>
                <div className="cc-sector-credits">{sector.credits}</div>
              </div>
              <div className="cc-sector-delta">{sector.delta}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ========== ACCUMULATED CREDITS ========== */}
      <motion.div
        className="cc-bento-card cc-stat-card cc-stat-credits"
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="cc-card-label">ACCUMULATED CREDITS</div>
        <div className="cc-stat-value cc-stat-cyan">
          {creditsCounter.toLocaleString()}
          <span className="cc-stat-unit">CR</span>
        </div>
        <div className="cc-stat-bar">
          <motion.div
            className="cc-stat-bar-fill cc-bar-cyan"
            initial={{ width: 0 }}
            animate={{ width: '68%' }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
        <div className="cc-stat-meta">Next milestone: 20,000 CR</div>
      </motion.div>

      {/* ========== UPTIME STREAK ========== */}
      <motion.div
        className="cc-bento-card cc-stat-card cc-stat-streak"
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="cc-card-label">UPTIME STREAK</div>
        <div className="cc-stat-value cc-stat-red">
          {streak.currentStreak || 128}
          <span className="cc-stat-unit">Cycles</span>
        </div>
        <div className="cc-stat-bar">
          <motion.div
            className="cc-stat-bar-fill cc-bar-red"
            initial={{ width: 0 }}
            animate={{ width: '82%' }}
            transition={{ duration: 1.5, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
        <div className="cc-stat-meta">Personal best: 156 Cycles</div>
      </motion.div>

      {/* ========== HOW IT WORKS FOOTER ========== */}
      <motion.div
        className="cc-bento-card cc-diag-card"
        custom={4}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="cc-diag-left">
          <div className="cc-card-label">HOW ECOPULSE WORKS</div>
          <p className="cc-diag-text">
            EcoPulse uses Gemini AI to visually verify your sustainable actions. Complete eco-tasks, upload your proof, and watch your carbon mitigation metrics update <span className="cc-diag-highlight">in real-time</span>.
          </p>
        </div>
        <div className="cc-diag-right">
          <Link href="/leaderboard" className="cc-btn-muted" style={{ textDecoration: 'none' }}>
            Leaderboard
          </Link>
          <Link href="/actions" className="cc-btn-glow" style={{ textDecoration: 'none' }}>
            View Actions
          </Link>
        </div>
      </motion.div>

      {/* ========== CARBON TIMELINE (existing chart) ========== */}
      <motion.div
        className="cc-bento-card cc-chart-card"
        custom={5}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="cc-card-label">CARBON TIMELINE</div>
        <div className="cc-card-sublabel">14-day emission tracking matrix</div>
        <CarbonGraph data={chartData} loading={loading} />
      </motion.div>
    </div>
  );
}
