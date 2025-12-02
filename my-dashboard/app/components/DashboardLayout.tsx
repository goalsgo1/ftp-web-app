'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiBell, 
  FiSettings, 
  FiList, 
  FiClock,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { onAuthChange, logout, getCurrentUser } from '../lib/firebase';
import type { User } from 'firebase/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

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
              {isLoading ? (
                // 로딩 중
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : user ? (
                // 로그인 상태: 로그아웃 버튼
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="로그아웃"
                  title={`${user.email || '사용자'} 로그아웃`}
                >
                  <FiLogOut size={20} />
                </button>
              ) : (
                // 로그아웃 상태: 로그인 링크
                <a
                  href="/login"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="로그인"
                  title="로그인"
                >
                  <FiUser size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* 사이드바 */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            ${sidebarCollapsed ? 'w-16' : 'w-64'} 
            bg-white dark:bg-gray-800 shadow-lg lg:shadow-none
            border-r border-gray-200 dark:border-gray-700
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-all duration-200 ease-in-out
            pt-16 lg:pt-0
            lg:h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)]
          `}
        >
          {/* 토글 버튼 (데스크톱만) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-4 z-10
                     bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                     rounded-full p-1.5 shadow-md
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     transition-colors"
            aria-label={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {sidebarCollapsed ? (
              <FiChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <FiChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <nav className={`${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-2`}>
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
                    w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} 
                    ${sidebarCollapsed ? 'px-0 py-3' : 'px-4 py-3'} 
                    rounded-lg
                    transition-colors duration-150
                    ${
                      activeTab === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  )}
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
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

