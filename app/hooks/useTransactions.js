'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getStats,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  ALL_CATEGORIES,
  CATEGORY_COLORS,
} from '../lib/store';

export default function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [filters, setFilters] = useState({
    category: 'All',
    type: 'All',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  // Fetch transactions and budgets from TiDB on mount
  useEffect(() => {
    async function load() {
      try {
        const [txRes, budgetRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/budgets'),
        ]);

        const txData = await txRes.json();
        const budgetData = await budgetRes.json();

        // Normalize transaction data from DB (date comes as ISO string)
        if (Array.isArray(txData)) {
          setTransactions(txData.map(t => ({
            ...t,
            amount: Number(t.amount),
            date: t.date ? t.date.split('T')[0] : t.date,
          })));
        }

        // Normalize budget data (monthly_limit → monthlyLimit)
        if (Array.isArray(budgetData)) {
          setBudgets(budgetData.map(b => ({
            ...b,
            monthlyLimit: Number(b.monthly_limit || b.monthlyLimit),
          })));
        }
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Add a transaction → POST to API
  const addTransaction = useCallback(async (data) => {
    const transaction = {
      id: uuidv4(),
      ...data,
      amount: parseFloat(data.amount),
      date: data.date || new Date().toISOString().split('T')[0],
    };

    // Optimistic update
    setTransactions(prev => [transaction, ...prev]);

    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
    } catch (e) {
      console.error('Failed to save transaction:', e);
      // Rollback on error
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    }

    return transaction;
  }, []);

  // Delete a transaction → DELETE API
  const removeTransaction = useCallback(async (id) => {
    const prev = transactions;

    // Optimistic update
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete transaction:', e);
      setTransactions(prev); // Rollback
    }
  }, [transactions]);

  // Set a budget → POST to API
  const updateBudget = useCallback(async (data) => {
    const budget = {
      id: uuidv4(),
      ...data,
      monthlyLimit: parseFloat(data.monthlyLimit),
    };

    // Optimistic update
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.category === budget.category);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...budget };
        return updated;
      }
      return [...prev, budget];
    });

    try {
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      });
    } catch (e) {
      console.error('Failed to save budget:', e);
    }
  }, []);

  // Remove a budget → DELETE API
  const removeBudget = useCallback(async (category) => {
    const prev = budgets;

    // Optimistic update
    setBudgets(prev => prev.filter(b => b.category !== category));

    try {
      await fetch(`/api/budgets?category=${encodeURIComponent(category)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete budget:', e);
      setBudgets(prev); // Rollback
    }
  }, [budgets]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filters.category !== 'All' && t.category !== filters.category) return false;
      if (filters.type !== 'All' && t.type !== filters.type) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const matchDesc = t.description?.toLowerCase().includes(s);
        const matchCat = t.category.toLowerCase().includes(s);
        if (!matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  // Stats (computed client-side from all transactions)
  const stats = useMemo(() => getStats(transactions), [transactions]);

  // Budget alerts
  const budgetAlerts = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return budgets.map(b => {
      const spent = transactions
        .filter(t => {
          const d = new Date(t.date);
          return (
            t.type === 'expense' &&
            t.category === b.category &&
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
          );
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const limit = Number(b.monthlyLimit);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      let status = 'safe';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= 80) status = 'warning';
      else if (percentage >= 60) status = 'caution';

      return {
        ...b,
        spent,
        percentage: Math.min(percentage, 100),
        remaining: Math.max(limit - spent, 0),
        status,
      };
    });
  }, [budgets, transactions]);

  return {
    transactions,
    filteredTransactions,
    budgets,
    budgetAlerts,
    stats,
    filters,
    loading,
    setFilters,
    addTransaction,
    removeTransaction,
    updateBudget,
    removeBudget,
  };
}
