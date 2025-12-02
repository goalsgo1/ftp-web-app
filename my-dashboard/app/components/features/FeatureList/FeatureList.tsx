'use client';

import { useState, useEffect } from 'react';
import { FiExternalLink, FiCheck, FiInfo, FiBell, FiStar, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { PageHeader } from '../../ui/PageHeader';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SearchInput } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { StatCard } from '../../ui/StatCard';
import { onAuthChange, getFeatures, getCurrentUser } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import type { Feature } from '@/lib/firebase/features';
import AddFeatureModal from './AddFeatureModal';
import EditFeatureModal from './EditFeatureModal';
import { FiEdit2 } from 'react-icons/fi';

export default function FeatureList() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 로그인 상태 실시간 확인
  useEffect(() => {
    const unsubscribe = onAuthChange((user: User | null) => {
      setIsLoggedIn(!!user);
      setCurrentUserId(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  // 현재 사용자가 만든 기능인지 확인
  const isFeatureOwner = (feature: Feature): boolean => {
    if (!currentUserId || !feature.createdBy) return false;
    return feature.createdBy === currentUserId;
  };

  // 수정 모달 열기
  const handleEditClick = (feature: Feature) => {
    setEditingFeature(feature);
    setIsEditModalOpen(true);
  };

  // 수정 완료 후 처리
  const handleEditSuccess = async () => {
    try {
      setIsLoading(true);
      const data = await getFeatures();
      const formattedFeatures: Feature[] = data.map(f => ({
        ...f,
        id: f.id || '',
        subscribed: f.subscribed ?? false,
        notificationEnabled: f.notificationEnabled ?? false,
      }));
      setFeatures(formattedFeatures);
    } catch (err) {
      console.error('기능 목록 새로고침 실패:', err);
      setError('기능 목록을 새로고침하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Firestore에서 기능 목록 가져오기
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getFeatures();
        // Firestore 데이터를 컴포넌트에서 사용하는 형식으로 변환
        const formattedFeatures: Feature[] = data.map(f => ({
          ...f,
          id: f.id || '',
          subscribed: f.subscribed ?? false,
          notificationEnabled: f.notificationEnabled ?? false,
        }));
        setFeatures(formattedFeatures);
      } catch (err) {
        console.error('기능 목록 로드 실패:', err);
        setError('기능 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatures();
  }, []);

  const categories = ['all', ...Array.from(new Set(features.map(f => f.category)))];

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || feature.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSubscription = (id: string) => {
    setFeatures(features.map(f => 
      (f.id || '') === id ? { ...f, subscribed: !(f.subscribed ?? false) } : f
    ));
  };

  // 통계 계산
  const totalFeatures = features.length;
  const subscribedCount = features.filter(f => f.subscribed).length;
  const activeNotifications = features.filter(f => f.subscribed && f.notificationEnabled).length;

  const handleAddSuccess = async () => {
    try {
      setIsLoading(true);
      const data = await getFeatures();
      const formattedFeatures: Feature[] = data.map(f => ({
        ...f,
        id: f.id || '',
        subscribed: f.subscribed ?? false,
        notificationEnabled: f.notificationEnabled ?? false,
      }));
      setFeatures(formattedFeatures);
    } catch (err) {
      console.error('기능 목록 새로고침 실패:', err);
      setError('기능 목록을 새로고침하는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="웹 기능 목록"
          description="사용 가능한 웹 기능들을 탐색하고 구독하세요"
        />
        {isLoggedIn && (
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            icon={<FiPlus size={18} />}
          >
            기능 등록
          </Button>
        )}
      </div>

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

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            기능 목록을 불러오는 중...
          </p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 기능 목록 */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {filteredFeatures.map((feature) => (
          <Card key={feature.id || ''} hover className="flex flex-col h-full relative">
            {/* 수정 버튼 (만든 사람만 표시) */}
            {isFeatureOwner(feature) && (
              <button
                onClick={() => handleEditClick(feature)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors z-10"
                aria-label="기능 수정"
                title="기능 수정"
              >
                <FiEdit2 size={16} />
              </button>
            )}
            
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

            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2 flex-grow">
              {feature.description}
            </p>

            <div className="mt-auto">
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
                  onClick={() => toggleSubscription(feature.id || '')}
                >
                  {feature.subscribed ? '구독 취소' : '구독하기'}
                </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  // 세계시간 기능인 경우 특별 처리
                  if (feature.name === '세계시간' || feature.id === 'world-clock') {
                    window.location.href = `/features/world-clock?id=${feature.id || 'world-clock'}`;
                  } else {
                    window.open(feature.url, '_blank');
                  }
                }}
                icon={<FiExternalLink size={16} />}
                aria-label="웹사이트 열기"
              >
                <span className="sr-only">웹사이트 열기</span>
              </Button>
              </div>
            </div>
          </Card>
          ))}
        </div>
      )}

      {/* 빈 목록 상태 */}
      {!isLoading && !error && filteredFeatures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || filterCategory !== 'all' 
              ? '검색 결과가 없습니다.' 
              : '등록된 기능이 없습니다. 기능을 등록해보세요!'}
          </p>
          {!searchTerm && filterCategory === 'all' && isLoggedIn && (
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              icon={<FiPlus size={18} />}
            >
              첫 기능 등록하기
            </Button>
          )}
        </div>
      )}

      {/* 기능 등록 모달 */}
      <AddFeatureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* 기능 수정 모달 */}
      <EditFeatureModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFeature(null);
        }}
        onSuccess={handleEditSuccess}
        feature={editingFeature}
      />
    </div>
  );
}

