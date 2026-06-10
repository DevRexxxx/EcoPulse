'use client';

import { useUserStore } from '@/store/userStore';

export default function ConnectedDevicesWidget() {
  const { hasConnectedDevice } = useUserStore();

  return (
    <div className="cc-bento-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="cc-card-header">
        <h2 className="cc-card-title">Automated Tracking (IoT)</h2>
        {hasConnectedDevice && (
          <span className="cc-badge" style={{ background: 'rgba(0, 242, 166, 0.1)', color: '#00F2A6' }}>
            ● Active Sync
          </span>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        {hasConnectedDevice ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 242, 166, 0.1)' }}>
            <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>🌡️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Nest Thermostat</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>Living Room • Last synced: Just now</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f87171' }}>1.2 kW</div>
              <div style={{ fontSize: '0.85rem', color: '#00F2A6' }}>Eco Mode ON</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
            <div style={{ fontSize: '2rem', opacity: 0.5, marginBottom: '12px' }}>🔌</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>No smart devices detected yet.</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', marginTop: '4px' }}>Use the Network Scanner in the top menu to detect compatible hardware.</p>
          </div>
        )}
      </div>
    </div>
  );
}
