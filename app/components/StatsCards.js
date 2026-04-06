'use client';

import styles from './StatsCards.module.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function StatsCards({ stats }) {
  const cards = [
    {
      id: 'income',
      label: 'Total Income',
      value: stats.totalIncome,
      monthly: stats.monthlyIncome,
      icon: '📈',
      cardClass: styles.cardIncome,
      iconClass: styles.iconIncome,
      valueClass: styles.valueIncome,
    },
    {
      id: 'expenses',
      label: 'Total Expenses',
      value: stats.totalExpenses,
      monthly: stats.monthlyExpenses,
      icon: '📉',
      cardClass: styles.cardExpense,
      iconClass: styles.iconExpense,
      valueClass: styles.valueExpense,
    },
    {
      id: 'balance',
      label: 'Net Balance',
      value: stats.balance,
      monthly: stats.monthlyBalance,
      icon: '💰',
      cardClass: styles.cardBalance,
      iconClass: styles.iconBalance,
      valueClass: stats.balance >= 0 ? styles.valueBalance : styles.valueNegative,
    },
  ];

  return (
    <div className={`${styles.grid} stagger`}>
      {cards.map(card => (
        <div
          key={card.id}
          id={`stat-${card.id}`}
          className={`glass-card ${styles.card} ${card.cardClass} animate-fade-in-up`}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>{card.label}</span>
            <div className={`${styles.cardIcon} ${card.iconClass}`}>
              {card.icon}
            </div>
          </div>
          <div className={`${styles.cardValue} ${card.valueClass}`}>
            {formatCurrency(card.value)}
          </div>
          <div className={styles.cardSub}>
            <span className={card.monthly >= 0 ? styles.trendUp : styles.trendDown}>
              {formatCurrency(Math.abs(card.monthly))}
            </span>
            {' this month'}
          </div>
        </div>
      ))}
    </div>
  );
}
