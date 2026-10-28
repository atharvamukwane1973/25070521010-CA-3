import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar.jsx';
import { AppHeader } from '../components/AppHeader.jsx';
import { TransactionModal } from '../components/TransactionModal.jsx';
import { api } from '../services/api.js';

export function AppLayout({ children, currentPath, onNavigate, title, subtitle, onRefresh }) {
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchGlobalMetadata = async () => {
    try {
      const [accRes, catRes, notifRes] = await Promise.all([
        api.accounts.list(),
        api.categories.list(),
        api.notifications.list(),
      ]);

      if (accRes?.data?.accounts) setAccounts(accRes.data.accounts);
      if (catRes?.data) setCategories(catRes.data);
      if (notifRes?.data?.unreadCount !== undefined) {
        setUnreadNotifications(notifRes.data.unreadCount);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchGlobalMetadata();
  }, [currentPath]);

  const handleTransactionSuccess = () => {
    fetchGlobalMetadata();
    if (onRefresh) onRefresh();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        unreadNotifications={unreadNotifications}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        <AppHeader
          title={title}
          subtitle={subtitle}
          onOpenNewTransaction={() => setIsTxModalOpen(true)}
          onNavigate={onNavigate}
          unreadCount={unreadNotifications}
        />

        <main style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={handleTransactionSuccess}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}
