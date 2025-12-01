'use client';

import { useState } from 'react';
import { FiExternalLink, FiCheck, FiInfo, FiBell, FiStar, FiTrendingUp } from 'react-icons/fi';
import { PageHeader } from '../../ui/PageHeader';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SearchInput } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { StatCard } from '../../ui/StatCard';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  subscribed: boolean;
  notificationEnabled: boolean;
}

const mockFeatures: Feature[] = [
  {
    id: '1',
    name: '날씨 알림',
    description: '실시간 날씨 정보와 알림을 받아보세요',
    category: '생활',
    url: 'https://weather.example.com',
    subscribed: true,
    notificationEnabled: true,
  },
  {
    id: '2',
    name: '주식 모니터링',
    description: '관심 종목의 가격 변동을 실시간으로 알림',
    category: '금융',
    url: 'https://stock.example.com',
    subscribed: true,
    notificationEnabled: false,
  },
  {
    id: '3',
    name: '할일 관리',
    description: '일정과 할일을 관리하고 알림을 받으세요',
    category: '생산성',
    url: 'https://todo.example.com',
    subscribed: false,
    notificationEnabled: false,
  },
  {
    id: '4',
    name: '뉴스 요약',
    description: 'AI가 요약한 주요 뉴스를 매일 받아보세요',
    category: '정보',
    url: 'https://news.example.com',
    subscribed: false,
    notificationEnabled: false,
  },
];

export default function FeatureList() {
  const [features, setFeatures] = useState<Feature[]>(mockFeatures);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(features.map(f => f.category)))];

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || feature.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSubscription = (id: string) => {
    setFeatures(features.map(f => 
      f.id === id ? { ...f, subscribed: !f.subscribed } : f
    ));
  };

  // 통계 계산
  const totalFeatures = features.length;
  const subscribedCount = features.filter(f => f.subscribed).length;
  const activeNotifications = features.filter(f => f.subscribed && f.notificationEnabled).length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="웹 기능 목록"
        description="사용 가능한 웹 기능들을 탐색하고 구독하세요"
      />

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="전체 기능"
          value={totalFeatures}
          variant="default"
          icon={<FiStar className="w-5 h-5" />}
        />
        <StatCard
          label="구독 중"
          value={subscribedCount}
          variant="success"
          icon={<FiCheck className="w-5 h-5" />}
        />
        <StatCard
          label="활성 알림"
          value={activeNotifications}
          variant="warning"
          icon={<FiBell className="w-5 h-5" />}
        />
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="기능 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? '전체 카테고리' : cat}
            </option>
          ))}
        </Select>
      </div>

      {/* 기능 목록 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {filteredFeatures.map((feature) => (
          <Card key={feature.id} hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.name}
                </h3>
                <Badge variant="default">
                  {feature.category}
                </Badge>
              </div>
              {feature.subscribed && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <FiCheck size={16} />
                  구독 중
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {feature.description}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <FiInfo size={16} className="text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                알림: {feature.notificationEnabled ? '활성화' : '비활성화'}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant={feature.subscribed ? 'secondary' : 'primary'}
                fullWidth
                onClick={() => toggleSubscription(feature.id)}
              >
                {feature.subscribed ? '구독 취소' : '구독하기'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.open(feature.url, '_blank')}
                icon={<FiExternalLink size={16} />}
                aria-label="웹사이트 열기"
              />
            </div>
          </Card>
        ))}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            검색 결과가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}

