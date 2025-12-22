'use client';

import { useState } from 'react';
import { FiBell, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { PageHeader } from '../../ui/PageHeader';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

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
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="알림 히스토리"
        description="받은 알림들을 확인하고 관리하세요"
      />

      {/* 필터 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FiFilter size={20} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">필터:</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '전체' : f === 'unread' ? '읽지 않음' : '읽음'}
            </Button>
          ))}
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <Card
            key={notif.id}
            hover
            className={`
              cursor-pointer
              ${notif.read ? '' : 'border-blue-200 dark:border-blue-800'}
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
              <button
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedId(expandedId === notif.id ? null : notif.id);
                }}
              >
                {expandedId === notif.id ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FiBell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              알림이 없습니다.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

