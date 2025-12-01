'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import FeatureList from './components/FeatureList';
import SubscriptionManagement from './components/SubscriptionManagement';
import NotificationSettings from './components/NotificationSettings';
import NotificationHistory from './components/NotificationHistory';
import PhonePreview from './components/PhonePreview';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

export default function Home() {
  const [activeTab, setActiveTab] = useState('features');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

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
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300">
              <div className={`${isPreviewVisible ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <FeatureList />
              </div>
              {isPreviewVisible && (
                <div className="hidden lg:block lg:col-span-1 relative">
                  <PhonePreview onClose={() => setIsPreviewVisible(false)} />
                </div>
              )}
            </div>
            {!isPreviewVisible && (
              <button
                onClick={() => setIsPreviewVisible(true)}
                className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-[100] 
                         bg-blue-600 hover:bg-blue-700 text-white 
                         p-4 rounded-l-lg shadow-2xl
                         transition-all hover:scale-110 hover:right-2
                         items-center justify-center
                         border-2 border-blue-400"
                aria-label="프리뷰 열기"
                title="프리뷰 보기"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}
          </div>
        );
      case 'subscriptions':
        return (
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300">
              <div className={`${isPreviewVisible ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <SubscriptionManagement />
              </div>
              {isPreviewVisible && (
                <div className="hidden lg:block lg:col-span-1 relative">
                  <PhonePreview onClose={() => setIsPreviewVisible(false)} />
                </div>
              )}
            </div>
            {!isPreviewVisible && (
              <button
                onClick={() => setIsPreviewVisible(true)}
                className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-[100] 
                         bg-blue-600 hover:bg-blue-700 text-white 
                         p-4 rounded-l-lg shadow-2xl
                         transition-all hover:scale-110 hover:right-2
                         items-center justify-center
                         border-2 border-blue-400"
                aria-label="프리뷰 열기"
                title="프리뷰 보기"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}
          </div>
        );
      case 'notifications':
        return (
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300">
              <div className={`${isPreviewVisible ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <NotificationSettings />
              </div>
              {isPreviewVisible && (
                <div className="hidden lg:block lg:col-span-1 relative">
                  <PhonePreview onClose={() => setIsPreviewVisible(false)} />
                </div>
              )}
            </div>
            {!isPreviewVisible && (
              <button
                onClick={() => setIsPreviewVisible(true)}
                className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-[100] 
                         bg-blue-600 hover:bg-blue-700 text-white 
                         p-4 rounded-l-lg shadow-2xl
                         transition-all hover:scale-110 hover:right-2
                         items-center justify-center
                         border-2 border-blue-400"
                aria-label="프리뷰 열기"
                title="프리뷰 보기"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}
          </div>
        );
      case 'history':
        return (
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300">
              <div className={`${isPreviewVisible ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <NotificationHistory />
              </div>
              {isPreviewVisible && (
                <div className="hidden lg:block lg:col-span-1 relative">
                  <PhonePreview onClose={() => setIsPreviewVisible(false)} />
                </div>
              )}
            </div>
            {!isPreviewVisible && (
              <button
                onClick={() => setIsPreviewVisible(true)}
                className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-[100] 
                         bg-blue-600 hover:bg-blue-700 text-white 
                         p-4 rounded-l-lg shadow-2xl
                         transition-all hover:scale-110 hover:right-2
                         items-center justify-center
                         border-2 border-blue-400"
                aria-label="프리뷰 열기"
                title="프리뷰 보기"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}
          </div>
        );
      default:
        return (
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300">
              <div className={`${isPreviewVisible ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <FeatureList />
              </div>
              {isPreviewVisible && (
                <div className="hidden lg:block lg:col-span-1 relative">
                  <PhonePreview onClose={() => setIsPreviewVisible(false)} />
                </div>
              )}
            </div>
            {!isPreviewVisible && (
              <button
                onClick={() => setIsPreviewVisible(true)}
                className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-[100] 
                         bg-blue-600 hover:bg-blue-700 text-white 
                         p-4 rounded-l-lg shadow-2xl
                         transition-all hover:scale-110 hover:right-2
                         items-center justify-center
                         border-2 border-blue-400"
                aria-label="프리뷰 열기"
                title="프리뷰 보기"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}
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
