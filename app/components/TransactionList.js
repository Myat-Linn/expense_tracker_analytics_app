'use client';

const CATEGORY_ICONS = {
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📊', 'Gift': '🎁', 'Other Income': '💵',
  'Food & Dining': '🍔', 'Transportation': '🚗', 'Housing': '🏠', 'Entertainment': '🎬',
  'Shopping': '🛍️', 'Healthcare': '🏥', 'Education': '📚', 'Utilities': '⚡', 'Travel': '✈️', 'Other': '📦',
};

const ALL_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Gift', 'Other Income',
  'Food & Dining', 'Transportation', 'Housing', 'Entertainment',
  'Shopping', 'Healthcare', 'Education', 'Utilities', 'Travel', 'Other',
];

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TransactionList({ transactions, filters, onFilterChange, onDelete }) {
  return (
    <div className="glass-card tx-card animate-fade-in-up" id="transaction-list">
      <div className="tx-header">
        <h3 className="tx-title">Recent Transactions</h3>
        <span className="tx-count" id="transaction-count">{transactions.length}</span>
      </div>

      <div className="tx-filters">
        <input
          id="filter-search"
          className="input"
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={e => onFilterChange({ ...filters, search: e.target.value })}
        />
        <select
          id="filter-type"
          className="select"
          value={filters.type}
          onChange={e => onFilterChange({ ...filters, type: e.target.value })}
        >
          <option value="All">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          id="filter-category"
          className="select"
          value={filters.category}
          onChange={e => onFilterChange({ ...filters, category: e.target.value })}
        >
          <option value="All">All Categories</option>
          {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="tx-list">
        {transactions.length === 0 ? (
          <div className="tx-empty">
            <div className="tx-empty-icon">📭</div>
            <p>No transactions yet. Add your first one!</p>
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="tx-item" id={`tx-${tx.id}`}>
              <div className={`tx-icon ${tx.type}`}>
                {CATEGORY_ICONS[tx.category] || '📦'}
              </div>
              <div className="tx-info">
                <div className="tx-category">{tx.category}</div>
                {tx.description && <div className="tx-desc">{tx.description}</div>}
              </div>
              <div className="tx-right">
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </div>
                <div className="tx-date">{fmtDate(tx.date)}</div>
              </div>
              <button
                className="tx-delete"
                onClick={() => onDelete(tx.id)}
                aria-label="Delete"
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
