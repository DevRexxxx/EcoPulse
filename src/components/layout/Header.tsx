'use client';

import { useUserStore } from '@/store/userStore';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user } = useUserStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <header className="cc-header">
      <div className="cc-header-left">
        <h1 className="cc-header-title">Command Center</h1>
      </div>

      <div className="cc-header-right">
        {/* Search */}
        <div className="cc-search">
          <span className="cc-search-icon">⊙</span>
          <span className="cc-search-text">Scan Network...</span>
        </div>

        {/* Status Icons */}
        <div className="cc-header-icons">
          <button className="cc-icon-btn" title="Notifications">
            <span>🔔</span>
            <span className="cc-icon-dot" />
          </button>
          <button className="cc-icon-btn" title="Sensors">◈</button>
          <button className="cc-icon-btn" title="Network">◎</button>
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
  );
}
