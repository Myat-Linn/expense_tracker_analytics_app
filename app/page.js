'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import StatsCards from './components/StatsCards';
import AddModal from './components/AddModal';
import TransactionList from './components/TransactionList';

const EXPENSE_CATEGORIES = ['Food & Dining', 'Transportation', 'Housing', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Utilities', 'Travel', 'Other'];

const CATEGORY_COLORS = {
  'Salary': '#34d399', 'Freelance': '#818cf8', 'Investment': '#fbbf24', 'Gift': '#f472b6', 'Other Income': '#64748b',
  'Food & Dining': '#fb923c', 'Transportation': '#38bdf8', 'Housing': '#a78bfa', 'Entertainment': '#f472b6',
  'Shopping': '#34d399', 'Healthcare': '#ef4444', 'Education': '#fbbf24', 'Utilities': '#94a3b8', 'Travel': '#2dd4bf', 'Other': '#64748b',
};

function fmt$(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [filters, setFilters] = useState({ category: 'All', type: 'All', search: '' });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  // Load from TiDB on mount
  useEffect(() => {
    async function load() {
      try {
        const [txRes, bRes] = await Promise.all([fetch('/api/transactions'), fetch('/api/budgets')]);
        const txData = await txRes.json();
        const bData = await bRes.json();
        if (Array.isArray(txData)) {
          setTransactions(txData.map(t => ({ ...t, amount: Number(t.amount), date: t.date ? t.date.split('T')[0] : t.date })));
        }
        if (Array.isArray(bData)) {
          setBudgets(bData.map(b => ({ ...b, monthlyLimit: Number(b.monthly_limit || b.monthlyLimit) })));
        }
      } catch (e) {
        console.error('Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Add transaction
  const addTransaction = useCallback(async (data) => {
    const tx = { id: crypto.randomUUID(), ...data, amount: parseFloat(data.amount), date: data.date || new Date().toISOString().split('T')[0] };
    setTransactions(prev => [tx, ...prev]);
    try {
      await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tx) });
    } catch (e) {
      console.error('Save failed:', e);
      setTransactions(prev => prev.filter(t => t.id !== tx.id));
    }
  }, []);

  // Delete transaction
  const removeTransaction = useCallback(async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Delete failed:', e);
    }
  }, []);

  // Save budget
  const saveBudget = useCallback(async (data) => {
    const budget = { id: crypto.randomUUID(), ...data, monthlyLimit: parseFloat(data.monthlyLimit) };
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.category === budget.category);
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], ...budget }; return u; }
      return [...prev, budget];
    });
    try {
      await fetch('/api/budgets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(budget) });
    } catch (e) {
      console.error('Budget save failed:', e);
    }
  }, []);

  // Delete budget
  const removeBudget = useCallback(async (category) => {
    setBudgets(prev => prev.filter(b => b.category !== category));
    try {
      await fetch(`/api/budgets?category=${encodeURIComponent(category)}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Budget delete failed:', e);
    }
  }, []);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filters.category !== 'All' && t.category !== filters.category) return false;
      if (filters.type !== 'All' && t.type !== filters.type) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!t.description?.toLowerCase().includes(s) && !t.category.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthly = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === cm && d.getFullYear() === cy; });
    const monthlyIncome = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthlyExpenses = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Last 5 months trend
    const monthlyTrend = [];
    for (let i = 4; i >= 0; i--) {
      const m = new Date(cy, cm - i, 1);
      const mo = m.getMonth(), yr = m.getFullYear();
      const label = m.toLocaleString('default', { month: 'short', year: '2-digit' });
      const inc = transactions.filter(t => { const d = new Date(t.date); return t.type === 'income' && d.getMonth() === mo && d.getFullYear() === yr; }).reduce((s, t) => s + t.amount, 0);
      const exp = transactions.filter(t => { const d = new Date(t.date); return t.type === 'expense' && d.getMonth() === mo && d.getFullYear() === yr; }).reduce((s, t) => s + t.amount, 0);
      monthlyTrend.push({ label, income: inc, expenses: exp });
    }

    // Category breakdown (current month expenses)
    const categoryBreakdown = {};
    monthly.filter(t => t.type === 'expense').forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, monthlyIncome, monthlyExpenses, monthlyBalance: monthlyIncome - monthlyExpenses, monthlyTrend, categoryBreakdown };
  }, [transactions]);

  // Budget alerts
  const budgetAlerts = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth(), cy = now.getFullYear();
    return budgets.map(b => {
      const spent = transactions.filter(t => { const d = new Date(t.date); return t.type === 'expense' && t.category === b.category && d.getMonth() === cm && d.getFullYear() === cy; }).reduce((s, t) => s + t.amount, 0);
      const limit = Number(b.monthlyLimit);
      const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
      let status = 'safe';
      if (pct >= 100) status = 'exceeded';
      else if (pct >= 80) status = 'warning';
      else if (pct >= 60) status = 'caution';
      return { ...b, spent, percentage: pct, remaining: Math.max(limit - spent, 0), status };
    });
  }, [budgets, transactions]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const categoryEntries = Object.entries(stats.categoryBreakdown).sort((a, b) => b[1] - a[1]);
  const hasTrend = stats.monthlyTrend.some(m => m.income > 0 || m.expenses > 0);
  const existingBudgetCats = budgets.map(b => b.category);
  const availableBudgetCats = EXPENSE_CATEGORIES.filter(c => !existingBudgetCats.includes(c));
  const statusLabels = { safe: 'On Track', caution: 'Caution', warning: 'Warning', exceeded: 'Over Budget' };

  if (loading) {
    return (
      <>
        <header className="top-header">
          <div className="top-header-logo"><span>💎</span> FinTrack</div>
        </header>
        <div className="page-container">
          <div className="skeleton" style={{ height: 100 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Top Header */}
      <header className="top-header">
        <div>
          <div className="top-header-logo"><span>💎</span> FinTrack</div>
          <div className="top-header-sub">Expense Analytics</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="top-header-date">{today}</span>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} id="header-add-btn">
            ＋ Add Transaction
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="page-container">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Insights Row: Monthly Trend + Category Breakdown */}
        <div className="insights-row">
          <div className="glass-card insight-card animate-fade-in-up">
            <h3 className="insight-title">Monthly Trends</h3>
            <p className="insight-subtitle">Last 5 months · Income vs Expenses</p>
            {hasTrend ? (
              <div className="trend-list">
                {stats.monthlyTrend.map(m => (
                  <div key={m.label} className="trend-row">
                    <span className="trend-label">{m.label}</span>
                    <div className="trend-values">
                      <span className="trend-income">+{fmt$(m.income)}</span>
                      <span className="trend-expense">-{fmt$(m.expenses)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tx-empty">
                <div className="tx-empty-icon">📊</div>
                <p>Add transactions to see trends</p>
              </div>
            )}
          </div>

          <div className="glass-card insight-card animate-fade-in-up">
            <h3 className="insight-title">Spending by Category</h3>
            <p className="insight-subtitle">This month&apos;s expenses</p>
            {categoryEntries.length > 0 ? (
              <div className="category-list">
                {categoryEntries.map(([cat, val]) => (
                  <div key={cat} className="category-row">
                    <span className="category-dot" style={{ background: CATEGORY_COLORS[cat] || '#64748b' }} />
                    <span className="category-name">{cat}</span>
                    <span className="category-amount">{fmt$(val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tx-empty">
                <div className="tx-empty-icon">🍩</div>
                <p>Add expenses to see breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Transactions + Budget Alerts */}
        <div className="bottom-row">
          <TransactionList
            transactions={filtered}
            filters={filters}
            onFilterChange={setFilters}
            onDelete={removeTransaction}
          />

          {/* Budget Alerts */}
          <div className="glass-card budget-card animate-fade-in-up" id="budget-alerts">
            <div className="budget-header">
              <h3 className="budget-title">🎯 Budget Alerts</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowBudgetModal(true)} id="manage-budgets-btn">
                ⚙ Manage
              </button>
            </div>
            {budgetAlerts.length === 0 ? (
              <div className="budget-empty">
                <div className="budget-empty-icon">🎯</div>
                <p>No budgets set. Click &quot;Manage&quot; to add limits.</p>
              </div>
            ) : (
              <div className="budget-list">
                {budgetAlerts.map(a => (
                  <div key={a.category} className="budget-item">
                    <div className="budget-item-top">
                      <span className="budget-item-name">{a.category}</span>
                      <span className={`budget-status ${a.status}`}>{statusLabels[a.status]}</span>
                    </div>
                    <div className="budget-bar">
                      <div className={`budget-fill ${a.status}`} style={{ width: `${a.percentage}%` }} />
                    </div>
                    <div className="budget-item-bottom">
                      <span>{fmt$(a.spent)} / {fmt$(a.monthlyLimit)}</span>
                      <span>{fmt$(a.remaining)} left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addTransaction} />

      {/* Budget Settings Modal */}
      {showBudgetModal && (
        <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Budgets</h2>
              <button className="modal-close" onClick={() => setShowBudgetModal(false)}>✕</button>
            </div>

            {budgets.length > 0 && (
              <div className="budget-existing">
                {budgets.map(b => (
                  <div key={b.category} className="budget-existing-item">
                    <span>{b.category}</span>
                    <span className="budget-existing-limit">{fmt$(b.monthlyLimit)}/mo</span>
                    <button className="btn btn-icon btn-ghost btn-sm" onClick={() => removeBudget(b.category)} aria-label={`Delete ${b.category}`}>🗑</button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={e => {
              e.preventDefault();
              if (!budgetCategory || !budgetLimit) return;
              saveBudget({ category: budgetCategory, monthlyLimit: budgetLimit });
              setBudgetCategory('');
              setBudgetLimit('');
            }}>
              <div className="budget-form-row">
                <div className="form-group">
                  <label className="label" htmlFor="budget-category">Category</label>
                  <select id="budget-category" className="select" value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)} required>
                    <option value="">Select...</option>
                    {availableBudgetCats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="budget-limit">Monthly Limit ($)</label>
                  <input id="budget-limit" className="input" type="number" placeholder="500" step="1" min="1" value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowBudgetModal(false)}>Done</button>
                <button type="submit" className="btn btn-primary" id="save-budget-btn" disabled={!budgetCategory || !budgetLimit}>＋ Add Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
