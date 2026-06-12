'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import SensorsPanel from '@/components/sensors/SensorsPanel';
import HybridScanner from '@/components/search/HybridScanner';
import NotificationDropdown from '@/components/layout/NotificationDropdown';

export default function Header() {
  const { user } = useUserStore();
  const router = useRouter();
  const [isSensorsOpen, setIsSensorsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <>
      <header className="cc-header">
        <div className="cc-header-left">
          {/* Show Logo on Mobile (desktop shows Command Center) */}
          <Link href="/dashboard" className="cc-header-brand-mobile">
            <div className="cc-header-avatar">
              {user?.displayName ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
            </div>
            <span className="cc-header-logo-text">EcoPulse</span>
          </Link>
          <h1 className="cc-header-title">Command Center</h1>
        </div>

        <div className="cc-header-right">
          {/* Hybrid Scanner Component */}
          <HybridScanner />

          {/* Status Icons */}
          <div className="cc-header-icons">
            <NotificationDropdown />
            <button
              className="cc-icon-btn"
              title="Sensors"
              aria-label="Sensors"
              onClick={() => setIsSensorsOpen(true)}
              style={{ position: 'relative' }}
            >
              <span aria-hidden="true">◈</span>
              <span className="sensors-dot" />
            </button>
            <Link href="/network">
              <button className="cc-icon-btn" title="Network" aria-label="Network" style={{ cursor: 'pointer' }}><span aria-hidden="true">◎</span></button>
            </Link>
            <button className="cc-icon-btn cc-logout" onClick={handleSignOut} title="Sign out" aria-label="Sign out"><span aria-hidden="true">⏻</span></button>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            header {
              left: 0 !important;
              padding: 0 12px !important;
            }
            .cc-header-title {
              display: none !important;
            }
            .cc-header-brand-mobile {
              display: flex !important;
            }
          }
          .cc-header-brand-mobile {
            display: none;
            align-items: center;
            gap: 8px;
            text-decoration: none;
          }
          .cc-header-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(0, 242, 166, 0.15);
            color: #00F2A6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 700;
            border: 1px solid rgba(0, 242, 166, 0.3);
          }
          .cc-header-logo-text {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 1.2rem;
            color: #fff;
            letter-spacing: -0.02em;
          }
        `}</style>
      </header>

      {/* Sensors Panel */}
      <SensorsPanel isOpen={isSensorsOpen} onClose={() => setIsSensorsOpen(false)} />
    </>
  );
}

