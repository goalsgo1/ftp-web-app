'use client';

import { useState } from 'react';
import { FiX, FiExternalLink, FiBell, FiBellOff } from 'react-icons/fi';
import { PageHeader } from '../../ui/PageHeader';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { StatCard } from '../../ui/StatCard';

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
      <PageHeader 
        title="구독 관리"
        description="현재 구독 중인 기능들을 관리하세요"
      />

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="전체 구독"
          value={subscriptions.length}
          variant="default"
        />
        <StatCard
          label="알림 활성화"
          value={subscriptions.filter(s => s.notificationEnabled).length}
          variant="success"
        />
        <StatCard
          label="알림 비활성화"
          value={subscriptions.filter(s => !s.notificationEnabled).length}
          variant="default"
        />
      </div>

      {/* 구독 목록 */}
      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {subscription.featureName}
                  </h3>
                  <Badge variant="default">
                    {subscription.category}
                  </Badge>
                  <Button
                    variant={subscription.notificationEnabled ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => toggleNotification(subscription.id)}
                    icon={subscription.notificationEnabled ? <FiBell size={12} /> : <FiBellOff size={12} />}
                  >
                    알림 {subscription.notificationEnabled ? 'ON' : 'OFF'}
                  </Button>
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
              <Button
                variant="danger"
                size="sm"
                onClick={() => unsubscribe(subscription.id)}
                icon={<FiX size={18} />}
                className="ml-4"
              >
                구독 취소
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              구독 중인 기능이 없습니다.
            </p>
            <Button variant="primary" onClick={() => window.location.hash = '#features'}>
              기능 목록에서 구독하기
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

