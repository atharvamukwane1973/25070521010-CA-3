import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatINR } from '../utils/currency.js';
import { formatDate } from '../utils/dates.js';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Building,
  Tag,
  Zap,
} from 'lucide-react';

export function AnalyticsPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Date filters (defaults to last 30 days)
  const [rangePreset, setRangePreset] = useState('30');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchAnalytics = async (start, end) => {
    setIsLoading(true);
    try {
      const res = await api.reports.getAnalytics(start, end);
      if (res?.data) {
        setData(res.data);
      }
    } catch {
      toast.error('Failed to load financial analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(startDate, endDate);
  }, [startDate, endDate]);

  const handlePresetChange = (days) => {
    setRangePreset(days);
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(days, 10));
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Reports & Financial Insights</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Deep analytics into spending velocities, top merchants, and net cash flow trends.
          </p>
        </div>

        {/* Date presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['7', '30', '90', '180'].map((p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              className={rangePreset === p ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
              style={{ height: '36px', padding: '0 12px', fontSize: '0.8rem' }}
            >
              {p} Days
            </button>
          ))}
          <button
            onClick={() => {
              window.location.href = api.transactions.exportCsvUrl();
            }}
            className="btn-secondary btn-sm"
            style={{ height: '36px' }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {data?.totals && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Period Inflow
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>
              {formatINR(data.totals.incomePaise)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Over {data.dateRange?.days} active recorded days
            </div>
          </div>

          <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Period Outflow
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.2rem' }}>
              {formatINR(data.totals.expensePaise)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Total category expenditures
            </div>
          </div>

          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-yellow)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Net Capital Saved
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-yellow)', marginTop: '0.2rem' }}>
              {formatINR(data.totals.netSavingsPaise)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Retained wealth in period
            </div>
          </div>

          <div className="glass-card" style={{ borderLeft: '4px solid #60A5FA' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Daily Burn Rate
            </span>
            <div className="mono-number" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60A5FA', marginTop: '0.2rem' }}>
              {formatINR(data.totals.avgDailyExpensePaise)} / day
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Average daily expenditure velocity
            </div>
          </div>
        </div>
      )}

      {/* Top Categories and Top Merchants Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Top Spending Categories */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={18} color="var(--accent-yellow)" /> Top Expenditure Categories
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data?.topCategories?.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No category expenses found in this time range.
              </div>
            ) : (
              data?.topCategories?.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span className="mono-number" style={{ fontWeight: 700 }}>
                        {formatINR(cat.totalPaise)}
                      </span>
                      <span style={{ color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${cat.percentage}%`,
                        height: '100%',
                        background: cat.color || 'var(--accent-yellow)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Merchants */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="var(--success)" /> Top Payees & Merchants
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.topMerchants?.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No merchant activity found in this period.
              </div>
            ) : (
              data?.topMerchants?.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {m.merchant}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {m.count} transaction{m.count > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="mono-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatINR(m.totalPaise)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
