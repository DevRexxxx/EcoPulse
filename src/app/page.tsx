'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // CRITICAL FIX: Only redirect if the user is genuinely on the root path.
    // Otherwise, refreshing subpages like /actions will trigger this and redirect them to dashboard.
    if (pathname !== '/') return;
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth');
      } else if (user && !user.onboardingComplete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading EcoPulse...</p>
    </div>
  );
}
