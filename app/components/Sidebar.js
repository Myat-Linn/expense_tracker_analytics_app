'use client';

import { useState } from 'react';
import styles from './Sidebar.module.css';

export default function Sidebar({ activeView, onViewChange, onAddClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'budgets', label: 'Budgets', icon: '🎯' },
  ];

  const handleNav = (id) => {
    onViewChange(id);
    setMobileOpen(false);
  };

  return (
    <>
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        id="sidebar-toggle"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💎</div>
          <div>
            <div className={styles.logoText}>FinTrack</div>
            <div className={styles.logoSub}>Expense Analytics</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.sectionLabel}>Menu</div>
          {navItems.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`${styles.navItem} ${activeView === item.id ? styles.navItemActive : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className={styles.divider} />
          <div className={styles.sectionLabel}>Quick Actions</div>
        </nav>

        <button
          className={`btn btn-primary ${styles.addBtn}`}
          onClick={() => { onAddClick(); setMobileOpen(false); }}
          id="add-transaction-btn"
        >
          ＋ Add Transaction
        </button>
      </aside>
    </>
  );
}
