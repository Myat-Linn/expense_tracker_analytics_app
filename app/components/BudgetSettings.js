'use client';

import { useState } from 'react';
import styles from './BudgetSettings.module.css';
import { EXPENSE_CATEGORIES } from '../lib/store';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function BudgetSettings({ isOpen, onClose, budgets, onSave, onDelete }) {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  if (!isOpen) return null;

  const existingCategories = budgets.map(b => b.category);
  const availableCategories = EXPENSE_CATEGORIES.filter(
    c => !existingCategories.includes(c)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !limit) return;

    onSave({
      category,
      monthlyLimit: limit,
    });

    setCategory('');
    setLimit('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Budgets</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Existing budgets */}
        {budgets.length > 0 && (
          <div className={styles.list}>
            {budgets.map(b => (
              <div key={b.category} className={styles.budgetItem}>
                <span className={styles.budgetCategory}>{b.category}</span>
                <span className={styles.budgetLimit}>
                  {formatCurrency(b.monthlyLimit)}/mo
                </span>
                <button
                  className="btn btn-icon btn-ghost btn-sm"
                  onClick={() => onDelete(b.category)}
                  aria-label={`Delete ${b.category} budget`}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new budget */}
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className="form-group">
              <label className="label" htmlFor="budget-category">Category</label>
              <select
                id="budget-category"
                className="select"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                <option value="">Select...</option>
                {availableCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="budget-limit">Monthly Limit ($)</label>
              <input
                id="budget-limit"
                className="input"
                type="number"
                placeholder="500"
                step="1"
                min="1"
                value={limit}
                onChange={e => setLimit(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Done
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-budget-btn"
              disabled={!category || !limit}
            >
              ＋ Add Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
