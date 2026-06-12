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

      </header>

      {/* Sensors Panel */}
      <SensorsPanel isOpen={isSensorsOpen} onClose={() => setIsSensorsOpen(false)} />
    </>
  );
}

