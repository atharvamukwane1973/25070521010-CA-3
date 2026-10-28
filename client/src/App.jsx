import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';

// Public Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { FeaturesPage } from './pages/FeaturesPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { SignupPage } from './pages/SignupPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';
import { TermsPage } from './pages/TermsPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// Authenticated Pages
import { DashboardPage } from './pages/DashboardPage.jsx';
import { TransactionsPage } from './pages/TransactionsPage.jsx';
import { AccountsPage } from './pages/AccountsPage.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { BudgetsPage } from './pages/BudgetsPage.jsx';
import { GoalsPage } from './pages/GoalsPage.jsx';
import { RecurringPage } from './pages/RecurringPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';

export function App() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  // Synchronize with browser history (back/forward buttons)
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          fontSize: '1rem',
          fontFamily: 'var(--font-heading)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid rgba(244, 213, 46, 0.2)',
              borderTopColor: 'var(--accent-yellow)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span>Initializing Vaultly Security...</span>
        </div>
      </div>
    );
  }

  // Handle Protected / Authenticated Routes
  if (currentPath.startsWith('/app')) {
    if (!isAuthenticated) {
      // Unauthenticated access to protected route
      return (
        <PublicLayout currentPath={currentPath} onNavigate={navigate}>
          <NotFoundPage onNavigate={navigate} isAccessDenied={true} />
        </PublicLayout>
      );
    }

    // Determine layout title & view component
    let pageComponent = null;
    let title = 'Vaultly Workspace';
    let subtitle = '';

    switch (currentPath) {
      case '/app/dashboard':
        title = 'Portfolio Dashboard';
        subtitle = 'Real-time financial summary and cash flow dynamics';
        pageComponent = (
          <DashboardPage
            onNavigate={navigate}
            onOpenNewTransaction={() => {
              const addBtn = document.querySelector('header button.btn-primary');
              if (addBtn) addBtn.click();
            }}
          />
        );
        break;

      case '/app/transactions':
        title = 'Transaction Ledger';
        subtitle = 'Search, filter, and review all financial records';
        pageComponent = (
          <TransactionsPage
            onOpenNewTransaction={() => {
              const addBtn = document.querySelector('header button.btn-primary');
              if (addBtn) addBtn.click();
            }}
          />
        );
        break;

      case '/app/accounts':
        title = 'Accounts & Wallets';
        subtitle = 'Manage bank balances, physical cash, and digital assets';
        pageComponent = <AccountsPage />;
        break;

      case '/app/categories':
        title = 'Category Management';
        subtitle = 'Custom income and expenditure taxonomy';
        pageComponent = <CategoriesPage />;
        break;

      case '/app/budgets':
        title = 'Monthly Budgets';
        subtitle = 'Category spending limits and threshold alerts';
        pageComponent = <BudgetsPage />;
        break;

      case '/app/goals':
        title = 'Savings Goals';
        subtitle = 'Milestone targets for capital accumulation';
        pageComponent = <GoalsPage />;
        break;

      case '/app/recurring':
        title = 'Recurring Schedules';
        subtitle = 'Subscription management and scheduled payments';
        pageComponent = <RecurringPage />;
        break;

      case '/app/analytics':
        title = 'Reports & Analytics';
        subtitle = 'Spending velocities and merchant breakdowns';
        pageComponent = <AnalyticsPage />;
        break;

      case '/app/notifications':
        title = 'Notification Center';
        subtitle = 'Automated system alerts and threshold triggers';
        pageComponent = <NotificationsPage onNavigate={navigate} />;
        break;

      case '/app/settings':
        title = 'Settings & Security';
        subtitle = 'Account parameters and MongoDB Compass inspection';
        pageComponent = <SettingsPage />;
        break;

      default:
        title = 'Page Not Found';
        pageComponent = <NotFoundPage onNavigate={navigate} />;
    }

    return (
      <AppLayout
        currentPath={currentPath}
        onNavigate={navigate}
        title={title}
        subtitle={subtitle}
      >
        {pageComponent}
      </AppLayout>
    );
  }

  // Public Routes
  let publicPage = null;
  switch (currentPath) {
    case '/':
      publicPage = <LandingPage onNavigate={navigate} />;
      break;
    case '/features':
      publicPage = <FeaturesPage onNavigate={navigate} />;
      break;
    case '/login':
      publicPage = <LoginPage onNavigate={navigate} />;
      break;
    case '/signup':
      publicPage = <SignupPage onNavigate={navigate} />;
      break;
    case '/forgot-password':
      publicPage = <ForgotPasswordPage onNavigate={navigate} />;
      break;
    case '/privacy':
      publicPage = <PrivacyPage onNavigate={navigate} />;
      break;
    case '/terms':
      publicPage = <TermsPage onNavigate={navigate} />;
      break;
    default:
      publicPage = <NotFoundPage onNavigate={navigate} />;
  }

  return (
    <PublicLayout currentPath={currentPath} onNavigate={navigate}>
      {publicPage}
    </PublicLayout>
  );
}
