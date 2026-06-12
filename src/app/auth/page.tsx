'use client';

import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { createUserProfile } from '@/services/userService';
import { useUserStore } from '@/store/userStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading, user } = useUserStore();
  const router = useRouter();

  // Water Ripple State
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

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
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e?.code || '';
      if (code === 'auth/user-not-found') setError('No account found with this email');
      else if (code === 'auth/wrong-password') setError('Incorrect password');
      else if (code === 'auth/email-already-in-use') setError('An account already exists with this email');
      else if (code === 'auth/weak-password') setError('Password should be at least 6 characters');
      else if (code === 'auth/invalid-email') setError('Please enter a valid email');
      else setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e?.code !== 'auth/popup-closed-by-user') {
        setError(e?.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate water ripples continuously as the mouse moves
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    // Throttle ripple creation so it's not overwhelmingly dense
    if (Math.random() > 0.8) {
      const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() + Math.random() };
      setRipples((prev) => [...prev, newRipple]);

      // Clean up ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 2000);
    }
  };

  // Floating leaf particles
  const leaves = ['🍃', '🌿', '🌱', '☘️', '🍀'];

  return (
    <div 
      className="auth-page" 
      onMouseMove={handleMouseMove}
      style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', width: '100%' }}
    >
      {/* Interactive Water Ripple Layer */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0.6, scale: 0, borderWidth: '4px' }}
            animate={{ opacity: 0, scale: 3, borderWidth: '0px' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: r.x - 25,
              top: r.y - 25,
              width: 50,
              height: 50,
              borderRadius: '50%',
              borderColor: 'rgba(0, 255, 200, 0.5)',
              borderStyle: 'solid',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        ))}
      </AnimatePresence>

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
            zIndex: 1,
          }}
        >
          {leaf}
        </span>
      ))}

      <div className="auth-container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="auth-header">
          <span className="logo-icon">🌍</span>
          <div className="logo">EcoPulse</div>
          <p>Track your carbon footprint. Save the planet.</p>
        </div>

        {/* Floating Water Card Animation */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div 
            className="glass-card"
            whileHover={{ 
              scale: 1.02, 
              boxShadow: '0 0 40px rgba(0, 255, 200, 0.2), inset 0 0 20px rgba(0, 255, 200, 0.1)',
              backdropFilter: 'blur(16px) brightness(1.1)'
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ transition: 'border-color 0.4s ease' }}
          >
            <form className="auth-form" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="input-group"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>

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

              {error && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="error-text"
                >
                  ⚠️ {error}
                </motion.p>
              )}

              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 200, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="btn btn-primary btn-lg" 
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                ) : isSignUp ? (
                  '🌱 Create Account'
                ) : (
                  '🔑 Sign In'
                )}
              </motion.button>
            </form>

            <div className="divider-text" style={{ margin: '20px 0' }}>
              or continue with
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
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
            </motion.button>

            <div className="auth-toggle">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} type="button">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </motion.div>
        </motion.div>
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
        letterSpacing: '0.5px',
        zIndex: 10
      }}>
        © 2026 Eshaan Singh Deo | All Rights Reserved
      </footer>
    </div>
  );
}
