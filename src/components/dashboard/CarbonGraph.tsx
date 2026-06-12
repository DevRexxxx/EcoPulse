'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { EmissionDataPoint } from '@/types';

interface CarbonGraphProps {
  data: EmissionDataPoint[];
  loading: boolean;
}

export default function CarbonGraph({ data, loading }: CarbonGraphProps) {
  const [range, setRange] = useState<'7d' | '14d' | '30d'>('14d');

  if (loading) {
    return (
      <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const filteredData =
    range === '7d' ? data.slice(-7) : range === '14d' ? data.slice(-14) : data;

  const hasData = filteredData.some((d) => d.co2eKg > 0);

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green-400)' }}>
            {Number(payload[0].value || 0).toFixed(2)} kg CO₂
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Range Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <div className="chart-toggle">
          {(['7d', '14d', '30d'] as const).map((r) => (
            <button
              key={r}
              className={range === r ? 'active' : ''}
              onClick={() => setRange(r)}
            >
              {r === '7d' ? '7 Days' : r === '14d' ? '14 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="empty-state" style={{ padding: '40px 20px' }}>
          <span className="empty-icon">📉</span>
          <p>No emissions data yet. Log a trip to see your carbon timeline!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
              tickLine={false}
              tickFormatter={(v) => `${v}kg`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="co2eKg"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#colorCo2)"
              animationDuration={1000}
              dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#0A2F1F', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
