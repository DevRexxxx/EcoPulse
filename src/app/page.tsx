'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
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
