'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: '📊' },
  { href: '/log-trip', label: 'Log', icon: '➕' },
  { href: '/actions', label: 'Actions', icon: '⚡' },
  { href: '/leaderboard', label: 'Rank', icon: '🏆' },
  { href: '/rewards', label: 'Rewards', icon: '🎁' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'var(--bottom-nav-height)',
          background: 'rgba(12, 17, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px',
          zIndex: 100,
        }}
        className="bottom-nav-mobile"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.65rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--green-400)' : 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
                position: 'relative',
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: -1,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 20,
                    height: 3,
                    borderRadius: 2,
                    background: 'var(--green-500)',
                  }}
                />
              )}
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          .bottom-nav-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
