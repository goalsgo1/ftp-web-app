'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from './components/layout';
import { PageLayout } from './components/layout';
import { FeatureList } from './components/features/FeatureList';
import { SubscriptionManagement } from './components/features/SubscriptionManagement';
import { NotificationSettings } from './components/features/NotificationSettings';
import { NotificationHistory } from './components/features/NotificationHistory';

export default function Home() {
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && ['features', 'subscriptions', 'notifications', 'history'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['features', 'subscriptions', 'notifications', 'history'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'features':
        return (
          <PageLayout>
            <FeatureList />
          </PageLayout>
        );
      case 'subscriptions':
        return (
          <PageLayout>
            <SubscriptionManagement />
          </PageLayout>
        );
      case 'notifications':
        return (
          <PageLayout>
            <NotificationSettings />
          </PageLayout>
        );
      case 'history':
        return (
          <PageLayout>
            <NotificationHistory />
          </PageLayout>
        );
      default:
        return (
          <PageLayout>
            <FeatureList />
          </PageLayout>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
