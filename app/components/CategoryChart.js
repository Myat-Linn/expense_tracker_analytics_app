'use client';

import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './CategoryChart.module.css';
import { CATEGORY_COLORS } from '../lib/store';

ChartJS.register(ArcElement, Tooltip, Legend);

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CategoryChart({ categoryBreakdown }) {
  const entries = useMemo(() => {
    return Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1]);
  }, [categoryBreakdown]);

  const hasData = entries.length > 0;

  const data = useMemo(() => ({
    labels: entries.map(([cat]) => cat),
    datasets: [
      {
        data: entries.map(([, val]) => val),
        backgroundColor: entries.map(([cat]) =>
          CATEGORY_COLORS[cat] || '#64748b'
        ),
        borderColor: '#1a2236',
        borderWidth: 3,
        hoverBorderColor: '#222d45',
        hoverOffset: 6,
      },
    ],
  }), [entries]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2236',
        titleColor: '#f0f2f5',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => ` $${ctx.raw.toLocaleString()}`,
        },
      },
    },
  }), []);

  return (
    <div className={`glass-card ${styles.container} animate-fade-in-up`} id="category-chart">
      <div className={styles.header}>
        <h3 className={styles.title}>Spending by Category</h3>
        <p className={styles.subtitle}>This month&apos;s expenses</p>
      </div>

      {hasData ? (
        <div className={styles.content}>
          <div className={styles.chartWrap}>
            <Doughnut data={data} options={options} />
          </div>
          <div className={styles.legend}>
            {entries.slice(0, 6).map(([cat, val]) => (
              <div key={cat} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: CATEGORY_COLORS[cat] || '#64748b' }}
                />
                <span className={styles.legendLabel}>{cat}</span>
                <span className={styles.legendValue}>{formatCurrency(val)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🍩</div>
          <p>Add expenses to see category breakdown</p>
        </div>
      )}
    </div>
  );
}
