'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import FeatureList from './components/FeatureList';
import SubscriptionManagement from './components/SubscriptionManagement';
import NotificationSettings from './components/NotificationSettings';
import NotificationHistory from './components/NotificationHistory';
import PhonePreview from './components/PhonePreview';

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FeatureList />
            </div>
            <div className="hidden lg:block lg:col-span-1">
              <PhonePreview />
            </div>
          </div>
        );
      case 'subscriptions':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SubscriptionManagement />
            </div>
            <div className="hidden lg:block lg:col-span-1">
              <PhonePreview />
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <NotificationSettings />
            </div>
            <div className="hidden lg:block lg:col-span-1">
              <PhonePreview />
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <NotificationHistory />
            </div>
            <div className="hidden lg:block lg:col-span-1">
              <PhonePreview />
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FeatureList />
            </div>
            <div className="hidden lg:block lg:col-span-1">
              <PhonePreview />
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
