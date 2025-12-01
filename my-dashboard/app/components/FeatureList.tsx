'use client';

import { useState } from 'react';
import { FiExternalLink, FiCheck, FiX, FiInfo } from 'react-icons/fi';

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          웹 기능 목록
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          사용 가능한 웹 기능들을 탐색하고 구독하세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="기능 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? '전체 카테고리' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* 기능 목록 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFeatures.map((feature) => (
          <div
            key={feature.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 
                     hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.name}
                </h3>
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full 
                               bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {feature.category}
                </span>
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
              <button
                onClick={() => toggleSubscription(feature.id)}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    feature.subscribed
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {feature.subscribed ? '구독 취소' : '구독하기'}
              </button>
              <a
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                         flex items-center gap-2"
              >
                <FiExternalLink size={16} />
              </a>
            </div>
          </div>
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

