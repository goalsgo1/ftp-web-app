'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiExternalLink, FiBell, FiBellOff } from 'react-icons/fi';

interface Subscription {
  id: string;
  featureName: string;
  description: string;
  category: string;
  url: string;
  subscribedAt: Date;
  notificationEnabled: boolean;
}

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    featureName: '날씨 알림',
    description: '실시간 날씨 정보와 알림',
    category: '생활',
    url: 'https://weather.example.com',
    subscribedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    notificationEnabled: true,
  },
  {
    id: '2',
    featureName: '주식 모니터링',
    description: '관심 종목의 가격 변동 알림',
    category: '금융',
    url: 'https://stock.example.com',
    subscribedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    notificationEnabled: false,
  },
];

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);

  const toggleNotification = (id: string) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === id ? { ...sub, notificationEnabled: !sub.notificationEnabled } : sub
    ));
  };

  const unsubscribe = (id: string) => {
    if (confirm('정말 구독을 취소하시겠습니까?')) {
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          구독 관리
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          현재 구독 중인 기능들을 관리하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체 구독</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {subscriptions.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">알림 활성화</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {subscriptions.filter(s => s.notificationEnabled).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">알림 비활성화</div>
          <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
            {subscriptions.filter(s => !s.notificationEnabled).length}
          </div>
        </div>
      </div>

      {/* 구독 목록 */}
      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {subscription.featureName}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full 
                                 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {subscription.category}
                  </span>
                  <button
                    onClick={() => toggleNotification(subscription.id)}
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                      transition-colors
                      ${
                        subscription.notificationEnabled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {subscription.notificationEnabled ? (
                      <>
                        <FiBell size={12} />
                        알림 ON
                      </>
                    ) : (
                      <>
                        <FiBellOff size={12} />
                        알림 OFF
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {subscription.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>구독일: {formatDate(subscription.subscribedAt)}</span>
                  <a
                    href={subscription.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    웹사이트 방문
                    <FiExternalLink size={14} />
                  </a>
                </div>
              </div>
              <button
                onClick={() => unsubscribe(subscription.id)}
                className="ml-4 px-4 py-2 text-red-600 dark:text-red-400 
                         hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg 
                         transition-colors flex items-center gap-2"
              >
                <FiX size={18} />
                구독 취소
              </button>
            </div>
          </div>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            구독 중인 기능이 없습니다.
          </p>
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            기능 목록에서 구독하기
          </a>
        </div>
      )}
    </div>
  );
}

