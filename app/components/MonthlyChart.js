'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './MonthlyChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MonthlyChart({ monthlyTrend }) {
  const hasData = monthlyTrend.some(m => m.income > 0 || m.expenses > 0);

  const data = useMemo(() => ({
    labels: monthlyTrend.map(m => m.label),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrend.map(m => m.income),
        backgroundColor: 'rgba(52, 211, 153, 0.7)',
        borderColor: '#34d399',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: monthlyTrend.map(m => m.expenses),
        backgroundColor: 'rgba(244, 114, 182, 0.7)',
        borderColor: '#f472b6',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }), [monthlyTrend]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#94a3b8',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 12, family: 'Inter' },
        },
      },
      tooltip: {
        backgroundColor: '#1a2236',
        titleColor: '#f0f2f5',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            return `${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#64748b',
          font: { size: 11, family: 'Inter' },
          callback: (v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`,
        },
        border: { display: false },
      },
    },
  }), []);

  return (
    <div className={`glass-card ${styles.container} animate-fade-in-up`} id="monthly-chart">
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Monthly Trends</h3>
          <p className={styles.subtitle}>Income vs Expenses — Last 6 months</p>
        </div>
      </div>
      {hasData ? (
        <div className={styles.chartWrap}>
          <Bar data={data} options={options} />
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📊</div>
          <p>Add transactions to see trends</p>
        </div>
      )}
    </div>
  );
}
