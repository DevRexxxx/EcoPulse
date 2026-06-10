'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { createUserProfile } from '@/lib/firestore';
import { useUserStore } from '@/store/userStore';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading, user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user && !user.onboardingComplete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        const firebaseUser = await signUpWithEmail(email, password, displayName);
        await createUserProfile(firebaseUser.uid, email, displayName);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') setError('No account found with this email');
      else if (code === 'auth/wrong-password') setError('Incorrect password');
      else if (code === 'auth/email-already-in-use') setError('Email already registered');
      else if (code === 'auth/weak-password') setError('Password must be at least 6 characters');
      else if (code === 'auth/invalid-email') setError('Invalid email address');
      else setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Floating leaf particles
  const leaves = ['🍃', '🌿', '🌱', '☘️', '🍀'];

  return (
    <div className="auth-page">
      {/* Floating Leaves Background */}
      {leaves.map((leaf, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            fontSize: `${1.2 + Math.random() * 1.5}rem`,
            left: `${10 + i * 18}%`,
            animation: `leafFloat ${8 + i * 3}s linear infinite`,
            animationDelay: `${i * 1.5}s`,
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        >
          {leaf}
        </span>
      ))}

      <div className="auth-container">
        <div className="auth-header">
          <span className="logo-icon">🌍</span>
          <div className="logo">EcoPulse</div>
          <p>Track your carbon footprint. Save the planet.</p>
        </div>

        <div className="glass-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="input-group">
                <label htmlFor="displayName">Full Name</label>
                <input
                  id="displayName"
                  className="input"
                  type="text"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className={`input ${error ? 'input-error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className={`input ${error ? 'input-error' : ''}`}
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            {error && <p className="error-text">⚠️ {error}</p>}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : isSignUp ? (
                '🌱 Create Account'
              ) : (
                '🔑 Sign In'
              )}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '20px 0' }}>
            or continue with
          </div>

          <button
            className="google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <div className="auth-toggle">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} type="button">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <footer style={{
        position: 'absolute',
        bottom: '20px',
        width: '100%',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        letterSpacing: '0.5px'
      }}>
        © 2026 Eshaan Singh Deo | All Rights Reserved
      </footer>
    </div>
  );
}
