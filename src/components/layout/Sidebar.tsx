'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/log-trip', label: 'Log Trip', icon: '◎' },
  { href: '/actions', label: 'Actions', icon: '⚡' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '◆' },
  { href: '/rewards', label: 'Rewards', icon: '✦' },
  { href: '/profile', label: 'Profile', icon: '◉' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUserStore();

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="cc-sidebar sidebar-desktop">
      {/* Profile + Logo */}
      <Link href="/dashboard" className="cc-sidebar-brand">
        <div className="cc-sidebar-avatar">{initials}</div>
        <span className="cc-sidebar-logo">EcoPulse</span>
      </Link>

      {/* Divider */}
      <div className="cc-sidebar-divider" />

      {/* Nav Items */}
      <nav className="cc-sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`cc-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="cc-sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <span className="cc-sidebar-active-dot" />}
            </Link>
          );
        })}
      </nav>

      {/* Emergency Button & Footer */}
      <div className="cc-sidebar-footer">
        <button className="cc-emergency-btn">
          <span className="cc-emergency-pulse" />
          <span>⚠</span>
          <span>Emergency Protocols</span>
        </button>
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#00ffc8', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800,
          letterSpacing: '0.1em',
          textShadow: '0 0 10px rgba(0,255,200,0.3)'
        }}>
          VERSION 4.0
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar-desktop {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
}
