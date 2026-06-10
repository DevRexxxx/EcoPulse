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
              onClick={() => setIsSensorsOpen(true)}
              style={{ position: 'relative' }}
            >
              ◈
              <span className="sensors-dot" />
            </button>
            <Link href="/network">
              <button className="cc-icon-btn" title="Network" style={{ cursor: 'pointer' }}>◎</button>
            </Link>
            <button className="cc-icon-btn cc-logout" onClick={handleSignOut} title="Sign out">⏻</button>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            header {
              left: 0 !important;
              padding: 0 16px !important;
            }
            .cc-search {
              display: none !important;
            }
          }
        `}</style>
      </header>

      {/* Sensors Panel */}
      <SensorsPanel isOpen={isSensorsOpen} onClose={() => setIsSensorsOpen(false)} />
    </>
  );
}

