'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb', color: '#111827' }}>
          <div style={{ maxWidth: '28rem', borderRadius: '0.75rem', backgroundColor: '#ffffff', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #fee2e2' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>Critical System Error</h2>
            <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#4b5563' }}>{error.message}</p>
            <button
              onClick={() => reset()}
              style={{ borderRadius: '9999px', backgroundColor: '#059669', padding: '0.5rem 1.5rem', color: '#ffffff', fontWeight: 500, border: 'none', cursor: 'pointer' }}
            >
              Force Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
