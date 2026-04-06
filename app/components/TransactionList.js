'use client';

import styles from './TransactionList.module.css';
import { ALL_CATEGORIES, CATEGORY_COLORS } from '../lib/store';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const CATEGORY_ICONS = {
  'Salary': '💼',
  'Freelance': '💻',
  'Investment': '📊',
  'Gift': '🎁',
  'Other Income': '💵',
  'Food & Dining': '🍔',
  'Transportation': '🚗',
  'Housing': '🏠',
  'Entertainment': '🎬',
  'Shopping': '🛍️',
  'Healthcare': '🏥',
  'Education': '📚',
  'Utilities': '⚡',
  'Travel': '✈️',
  'Other': '📦',
};

export default function TransactionList({
  transactions,
  filters,
  onFilterChange,
  onDelete,
}) {
  return (
    <div className={`glass-card ${styles.container} animate-fade-in-up`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recent Transactions</h3>
        <span className={styles.count} id="transaction-count">
          {transactions.length}
        </span>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          id="filter-search"
          className={`input ${styles.search}`}
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={e => onFilterChange({ ...filters, search: e.target.value })}
        />
        <select
          id="filter-type"
          className={`select ${styles.filterSelect}`}
          value={filters.type}
          onChange={e => onFilterChange({ ...filters, type: e.target.value })}
        >
          <option value="All">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          id="filter-category"
          className={`select ${styles.filterSelect}`}
          value={filters.category}
          onChange={e => onFilterChange({ ...filters, category: e.target.value })}
        >
          <option value="All">All Categories</option>
          {ALL_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Transaction list */}
      <div className={styles.list}>
        {transactions.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <p className={styles.emptyText}>
              No transactions yet. Add your first one!
            </p>
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className={styles.item} id={`tx-${tx.id}`}>
              <div
                className={`${styles.itemIcon} ${tx.type === 'income' ? styles.itemIconIncome : styles.itemIconExpense}`}
              >
                {CATEGORY_ICONS[tx.category] || '📦'}
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemCategory}>{tx.category}</div>
                {tx.description && (
                  <div className={styles.itemDesc}>{tx.description}</div>
                )}
              </div>
              <div className={styles.itemRight}>
                <div
                  className={`${styles.itemAmount} ${tx.type === 'income' ? styles.amountIncome : styles.amountExpense}`}
                >
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
                <div className={styles.itemDate}>{formatDate(tx.date)}</div>
              </div>
              <button
                className={`btn btn-icon btn-ghost ${styles.deleteBtn}`}
                onClick={() => onDelete(tx.id)}
                aria-label="Delete transaction"
                title="Delete"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
