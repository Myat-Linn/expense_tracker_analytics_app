'use client';

import { useState } from 'react';
import styles from './Dashboard.module.css';
import useTransactions from './hooks/useTransactions';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionList from './components/TransactionList';
import MonthlyChart from './components/MonthlyChart';
import CategoryChart from './components/CategoryChart';
import BudgetAlerts from './components/BudgetAlerts';
import BudgetSettings from './components/BudgetSettings';

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const {
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
  } = useTransactions();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onAddClick={() => {}}
        />
        <main className="main-content">
          <div className={styles.dashboard}>
            <div className={styles.skeleton} style={{ height: 120 }} />
            <div className={styles.skeleton} style={{ height: 300 }} />
            <div className={styles.skeleton} style={{ height: 300 }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onAddClick={() => setShowAddModal(true)}
      />

      <main className="main-content">
        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.greeting}>
              {activeView === 'dashboard' && '📊 Dashboard'}
              {activeView === 'transactions' && '💰 Transactions'}
              {activeView === 'budgets' && '🎯 Budgets'}
            </h1>
            <p className={styles.date}>{today}</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              id="header-add-btn"
            >
              ＋ Add Transaction
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className={styles.dashboard}>
            <div className={styles.statsRow}>
              <StatsCards stats={stats} />
            </div>

            <div className={styles.chartsRow}>
              <MonthlyChart monthlyTrend={stats.monthlyTrend} />
              <CategoryChart categoryBreakdown={stats.categoryBreakdown} />
            </div>

            <div className={styles.bottomRow}>
              <TransactionList
                transactions={filteredTransactions}
                filters={filters}
                onFilterChange={setFilters}
                onDelete={removeTransaction}
              />
              <BudgetAlerts
                budgetAlerts={budgetAlerts}
                onManageBudgets={() => setShowBudgetModal(true)}
              />
            </div>
          </div>
        )}

        {/* Transactions View */}
        {activeView === 'transactions' && (
          <div className={`${styles.dashboard} ${styles.fullView}`}>
            <StatsCards stats={stats} />
            <TransactionList
              transactions={filteredTransactions}
              filters={filters}
              onFilterChange={setFilters}
              onDelete={removeTransaction}
            />
          </div>
        )}

        {/* Budgets View */}
        {activeView === 'budgets' && (
          <div className={`${styles.dashboard} ${styles.fullView}`}>
            <div className={styles.budgetFullView}>
              <BudgetAlerts
                budgetAlerts={budgetAlerts}
                onManageBudgets={() => setShowBudgetModal(true)}
              />
              <CategoryChart categoryBreakdown={stats.categoryBreakdown} />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addTransaction}
      />

      <BudgetSettings
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        budgets={budgets}
        onSave={updateBudget}
        onDelete={removeBudget}
      />
    </div>
  );
}
