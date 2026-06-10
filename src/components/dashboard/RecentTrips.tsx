'use client';

import type { Trip } from '@/types';
import { TRANSPORT_LABELS } from '@/lib/mock/emissionsCalculator';

interface RecentTripsProps {
  trips: Trip[];
  loading: boolean;
}

export default function RecentTrips({ trips, loading }: RecentTripsProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 56 }} />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '30px 20px' }}>
        <span className="empty-icon">🚶</span>
        <p>No trips logged yet. Start tracking your commute!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {trips.map((trip) => {
        const transport = TRANSPORT_LABELS[trip.mode];
        const timeAgo = getTimeAgo(trip.recordedAt);

        return (
          <div
            key={trip.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{transport?.icon || '🚗'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{transport?.label || trip.mode}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {trip.distanceKm} km · {timeAgo}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: trip.co2eKg === 0 ? 'var(--green-400)' : 'var(--text-primary)',
                }}
              >
                {trip.co2eKg === 0 ? '0 🌱' : `${trip.co2eKg.toFixed(2)} kg`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>CO₂</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}
