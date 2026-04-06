'use client';

import { useState } from 'react';
import styles from './AddTransactionModal.module.css';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../lib/store';

export default function AddTransactionModal({ isOpen, onClose, onAdd }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;

    onAdd({
      type,
      amount,
      category,
      description,
      date,
    });

    // Reset
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Transaction</h2>
          <button className="modal-close" onClick={onClose} id="modal-close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Toggle */}
          <div className={styles.typeToggle}>
            <button
              type="button"
              id="type-income-btn"
              className={`${styles.typeBtn} ${type === 'income' ? styles.typeBtnIncome : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              📈 Income
            </button>
            <button
              type="button"
              id="type-expense-btn"
              className={`${styles.typeBtn} ${type === 'expense' ? styles.typeBtnExpense : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              📉 Expense
            </button>
          </div>

          {/* Amount & Date */}
          <div className={styles.row}>
            <div className="form-group">
              <label className="label" htmlFor="tx-amount">Amount ($)</label>
              <input
                id="tx-amount"
                className="input"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="tx-date">Date</label>
              <input
                id="tx-date"
                className="input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="label" htmlFor="tx-category">Category</label>
            <select
              id="tx-category"
              className="select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="label" htmlFor="tx-description">Description (optional)</label>
            <input
              id="tx-description"
              className="input"
              type="text"
              placeholder="e.g. Lunch at Subway"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="submit-transaction-btn"
              className={`btn ${type === 'income' ? 'btn-income' : 'btn-expense'}`}
            >
              {type === 'income' ? '＋ Add Income' : '＋ Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
