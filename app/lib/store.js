// Client-side localStorage persistence layer
// Provides all CRUD operations for transactions and budgets

const TRANSACTIONS_KEY = 'expense_tracker_transactions';
const BUDGETS_KEY = 'expense_tracker_budgets';

function getItem(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Transactions ---

export function getTransactions() {
  return getItem(TRANSACTIONS_KEY, []);
}

export function addTransaction(transaction) {
  const list = getTransactions();
  list.unshift(transaction);
  setItem(TRANSACTIONS_KEY, list);
  return list;
}

export function deleteTransaction(id) {
  const list = getTransactions().filter(t => t.id !== id);
  setItem(TRANSACTIONS_KEY, list);
  return list;
}

// --- Budgets ---

export function getBudgets() {
  return getItem(BUDGETS_KEY, []);
}

export function setBudget(budget) {
  const list = getBudgets();
  const idx = list.findIndex(b => b.category === budget.category);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...budget };
  } else {
    list.push(budget);
  }
  setItem(BUDGETS_KEY, list);
  return list;
}

export function deleteBudget(category) {
  const list = getBudgets().filter(b => b.category !== category);
  setItem(BUDGETS_KEY, list);
  return list;
}

// --- Stats helpers ---

export function getStats(transactions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Monthly trend data (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(currentYear, currentMonth - i, 1);
    const month = m.getMonth();
    const year = m.getFullYear();
    const label = m.toLocaleString('default', { month: 'short', year: '2-digit' });

    const income = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'income' && d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    monthlyTrend.push({ label, income, expenses });
  }

  // Category breakdown (current month expenses)
  const categoryBreakdown = {};
  monthlyTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
    });

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    monthlyIncome,
    monthlyExpenses,
    monthlyBalance: monthlyIncome - monthlyExpenses,
    monthlyTrend,
    categoryBreakdown,
  };
}

// --- Categories ---

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Utilities',
  'Travel',
  'Other',
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const CATEGORY_COLORS = {
  'Salary': '#34d399',
  'Freelance': '#818cf8',
  'Investment': '#fbbf24',
  'Gift': '#f472b6',
  'Other Income': '#64748b',
  'Food & Dining': '#fb923c',
  'Transportation': '#38bdf8',
  'Housing': '#a78bfa',
  'Entertainment': '#f472b6',
  'Shopping': '#34d399',
  'Healthcare': '#ef4444',
  'Education': '#fbbf24',
  'Utilities': '#94a3b8',
  'Travel': '#2dd4bf',
  'Other': '#64748b',
};
