'use client';

import { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiBell, 
  FiSettings, 
  FiList, 
  FiClock,
  FiUser,
  FiMenu,
  FiX
} from 'react-icons/fi';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const menuItems = [
    { id: 'features', label: '기능 목록', icon: FiList },
    { id: 'subscriptions', label: '구독 관리', icon: FiBell },
    { id: 'notifications', label: '알림 설정', icon: FiSettings },
    { id: 'history', label: '알림 히스토리', icon: FiClock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-900 dark:text-white">
                PushHub
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <FiUser size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-white dark:bg-gray-800 shadow-lg lg:shadow-none
            border-r border-gray-200 dark:border-gray-700
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-200 ease-in-out
            pt-16 lg:pt-0
          `}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-150
                    ${
                      activeTab === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* 오버레이 (모바일) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

