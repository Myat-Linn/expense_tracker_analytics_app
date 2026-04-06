'use client';

import styles from './BudgetAlerts.module.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function BudgetAlerts({ budgetAlerts, onManageBudgets }) {
  const statusLabels = {
    safe: 'On Track',
    caution: 'Caution',
    warning: 'Warning',
    exceeded: 'Over Budget',
  };

  const statusClasses = {
    safe: styles.statusSafe,
    caution: styles.statusCaution,
    warning: styles.statusWarning,
    exceeded: styles.statusExceeded,
  };

  const fillClasses = {
    safe: styles.fillSafe,
    caution: styles.fillCaution,
    warning: styles.fillWarning,
    exceeded: styles.fillExceeded,
  };

  return (
    <div className={`glass-card ${styles.container} animate-fade-in-up`} id="budget-alerts">
      <div className={styles.header}>
        <h3 className={styles.title}>Budget Alerts</h3>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onManageBudgets}
          id="manage-budgets-btn"
        >
          ⚙ Manage
        </button>
      </div>

      {budgetAlerts.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎯</div>
          <p className={styles.emptyText}>
            No budgets set. Click &quot;Manage&quot; to set spending limits.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {budgetAlerts.map(alert => (
            <div key={alert.category} className={styles.alert}>
              <div className={styles.alertTop}>
                <span className={styles.alertCategory}>
                  {alert.category}
                </span>
                <span className={`${styles.alertStatus} ${statusClasses[alert.status]}`}>
                  {statusLabels[alert.status]}
                </span>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${fillClasses[alert.status]}`}
                  style={{ width: `${alert.percentage}%` }}
                />
              </div>

              <div className={styles.alertBottom}>
                <span>
                  <span className={styles.spent}>{formatCurrency(alert.spent)}</span>
                  {' of '}
                  {formatCurrency(alert.monthlyLimit)}
                </span>
                <span>
                  {formatCurrency(alert.remaining)} left
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
