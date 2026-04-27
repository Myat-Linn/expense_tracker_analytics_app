'use client';

export default function StatsCards({ stats }) {
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

  const cards = [
    { id: 'income', label: 'Total Income', value: stats.totalIncome, monthly: stats.monthlyIncome, icon: '📈', cls: 'income' },
    { id: 'expenses', label: 'Total Expenses', value: stats.totalExpenses, monthly: stats.monthlyExpenses, icon: '📉', cls: 'expense' },
    { id: 'balance', label: 'Net Balance', value: stats.balance, monthly: stats.monthlyBalance, icon: '💰', cls: 'balance' },
  ];

  return (
    <div className="stats-grid stagger">
      {cards.map(c => (
        <div key={c.id} id={`stat-${c.id}`} className="glass-card stat-card animate-fade-in-up">
          <div className="stat-card-header">
            <span className="stat-card-label">{c.label}</span>
            <div className={`stat-card-icon ${c.cls}`}>{c.icon}</div>
          </div>
          <div className={`stat-card-value ${c.cls === 'balance' ? (c.value >= 0 ? 'positive' : 'negative') : c.cls}`}>
            {fmt(c.value)}
          </div>
          <div className="stat-card-sub">
            {fmt(Math.abs(c.monthly))} this month
          </div>
        </div>
      ))}
    </div>
  );
}
