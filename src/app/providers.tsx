'use client';

import { useEffect, useState, ReactNode } from 'react';
import { onAuthChange } from '@/lib/auth';
import { getUserProfile, getTotalPoints, getStreak, getBaseline } from '@/lib/firestore';
import { useUserStore } from '@/store/userStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setBaseline, setStreak, setEcoPoints, setLoading, reset } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          // New user from Google sign-in — create profile
          const { createUserProfile } = await import('@/lib/firestore');
          profile = await createUserProfile(
            firebaseUser.uid,
            firebaseUser.email || '',
            firebaseUser.displayName || 'User'
          );
        }

        setUser(profile);

        // Load additional data in parallel
        const [points, streak, baseline] = await Promise.all([
          getTotalPoints(firebaseUser.uid),
          getStreak(firebaseUser.uid),
          getBaseline(firebaseUser.uid),
        ]);

        setEcoPoints(points);
        setStreak(streak);
        setBaseline(baseline);
      } else {
        reset();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [reset, setBaseline, setEcoPoints, setLoading, setStreak, setUser]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
