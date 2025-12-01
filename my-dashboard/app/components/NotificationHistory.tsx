'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { FiBell, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Notification {
  id: string;
  featureName: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    featureName: '날씨 알림',
    title: '비 예보',
    message: '오후 3시부터 비가 예상됩니다. 우산을 챙기세요.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
    read: false,
  },
  {
    id: '2',
    featureName: '주식 모니터링',
    title: '가격 변동',
    message: '삼성전자 주가가 5% 상승했습니다.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
    read: true,
  },
  {
    id: '3',
    featureName: '날씨 알림',
    title: '날씨 정보',
    message: '오늘의 최고 기온은 25도입니다.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5시간 전
    read: true,
  },
];

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return format(date, 'yyyy년 MM월 dd일');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          알림 히스토리
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          받은 알림들을 확인하고 관리하세요
        </p>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FiFilter size={20} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">필터:</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {f === 'all' ? '전체' : f === 'unread' ? '읽지 않음' : '읽음'}
            </button>
          ))}
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`
              bg-white dark:bg-gray-800 rounded-lg shadow-sm border 
              ${notif.read ? 'border-gray-200 dark:border-gray-700' : 'border-blue-200 dark:border-blue-800'}
              p-4 cursor-pointer hover:shadow-md transition-shadow
            `}
            onClick={() => {
              if (!notif.read) markAsRead(notif.id);
              setExpandedId(expandedId === notif.id ? null : notif.id);
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FiBell 
                    size={16} 
                    className={notif.read ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'} 
                  />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {notif.featureName}
                  </span>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {notif.title}
                </h3>
                {expandedId === notif.id && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                    {notif.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {formatTime(notif.timestamp)}
                </p>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {expandedId === notif.id ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <FiBell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            알림이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}

