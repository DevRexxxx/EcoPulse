'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Next.js App Router caught error:', error);
  }, [error]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb', color: '#111827' }}>
      <div style={{ maxWidth: '28rem', borderRadius: '0.75rem', backgroundColor: '#ffffff', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #fee2e2' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>Something went wrong!</h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#4b5563' }}>
          {error.message || 'An unexpected runtime error occurred.'}
        </p>
        <button
          onClick={() => reset()}
          style={{ borderRadius: '9999px', backgroundColor: '#059669', padding: '0.5rem 1.5rem', color: '#ffffff', fontWeight: 500, border: 'none', cursor: 'pointer' }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
