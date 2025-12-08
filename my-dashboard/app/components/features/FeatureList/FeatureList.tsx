'use client';

import { useState, useEffect, useRef } from 'react';
import { FiExternalLink, FiCheck, FiInfo, FiBell, FiStar, FiTrendingUp, FiPlus, FiChevronDown, FiChevronUp, FiMoreVertical, FiTrash2, FiEdit2, FiCheckCircle, FiClock, FiGrid, FiList } from 'react-icons/fi';
import { PageHeader } from '../../ui/PageHeader';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SearchInput } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { StatCard } from '../../ui/StatCard';
import { NotificationStats } from '../../ui/NotificationStats';
import { EmptyState } from '../../ui/EmptyState';
import { LoadingState } from '../../ui/LoadingState';
import { ErrorState } from '../../ui/ErrorState';
import { FeatureTypeBadge } from '../../ui/Badge/FeatureTypeBadge';
import { onAuthChange, getFeatures, getCurrentUser } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import type { Feature } from '@/lib/firebase/features';
import { deleteFeature, getFeatureById } from '@/lib/firebase/features';
import { loadNotificationStats } from '@/lib/utils/notificationStats';
import { 
  subscribeToFeature, 
  unsubscribeFromFeature, 
  isSubscribed,
  subscribeUserSubscriptions,
  getSubscriptionCounts
} from '@/lib/firebase/subscriptions';
import { ToastContainer } from '../../ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useClickOutside } from '@/hooks/useClickOutside';
import AddFeatureModal from './AddFeatureModal';
import EditFeatureModal from './EditFeatureModal';

export default function FeatureList() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'name'>('latest');
  const [subscriptionCounts, setSubscriptionCounts] = useState<Record<string, number>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [notificationStats, setNotificationStats] = useState<Record<string, { total: number; active: number; inactive: number }>>({});
  const [subscriptionStatuses, setSubscriptionStatuses] = useState<Record<string, boolean>>({});
  const [isSubscribing, setIsSubscribing] = useState<Record<string, boolean>>({});
  const { toasts, showToast, closeToast } = useToast();
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 로그인 상태 실시간 확인
  useEffect(() => {
    const unsubscribe = onAuthChange((user: User | null) => {
      setIsLoggedIn(!!user);
      setCurrentUserId(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  // 구독 상태 로드 및 실시간 동기화
  useEffect(() => {
    if (!currentUserId) {
      setSubscriptionStatuses({});
      return;
    }

    // 초기 구독 상태 로드
    const loadSubscriptionStatuses = async () => {
      try {
        const statuses: Record<string, boolean> = {};
        // features가 로드된 후에만 구독 상태 확인
        if (features.length > 0) {
          for (const feature of features) {
            if (feature.id) {
              const subscribed = await isSubscribed(currentUserId, feature.id);
              statuses[feature.id] = subscribed;
            }
          }
          setSubscriptionStatuses(statuses);
        }
      } catch (error) {
        console.error('구독 상태 로드 실패:', error);
      }
    };

    loadSubscriptionStatuses();

    // 실시간 동기화
    const unsubscribe = subscribeUserSubscriptions(currentUserId, (subscriptions) => {
      const statuses: Record<string, boolean> = {};
      subscriptions.forEach(sub => {
        if (sub.featureId) {
          statuses[sub.featureId] = true;
        }
      });
      // 기존 상태와 병합 (구독 취소된 경우도 반영)
      setSubscriptionStatuses(prev => {
        const merged = { ...prev };
        // 구독 목록에 있는 것만 true, 나머지는 false
        features.forEach(f => {
          if (f.id) {
            merged[f.id] = statuses[f.id] || false;
          }
        });
        return merged;
      });
    });

    return () => unsubscribe();
  }, [currentUserId]); // features 의존성 제거하여 무한 루프 방지

  // features가 변경될 때 구독 상태 업데이트
  useEffect(() => {
    if (!currentUserId || features.length === 0) return;

    const updateSubscriptionStatuses = async () => {
      try {
        const statuses: Record<string, boolean> = {};
        for (const feature of features) {
          if (feature.id) {
            const subscribed = await isSubscribed(currentUserId, feature.id);
            statuses[feature.id] = subscribed;
          }
        }
        setSubscriptionStatuses(prev => ({ ...prev, ...statuses }));
      } catch (error) {
        console.error('구독 상태 업데이트 실패:', error);
      }
    };

    updateSubscriptionStatuses();
  }, [currentUserId, features]);

  // 외부 클릭 시 카드 축소 및 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 카드 축소
      if (expandedCardId) {
        const expandedCard = cardRefs.current[expandedCardId];
        if (expandedCard && !expandedCard.contains(event.target as Node)) {
          setExpandedCardId(null);
        }
      }
      
      // 메뉴 닫기
      if (openMenuId) {
        const menuCard = menuRefs.current[openMenuId];
        if (menuCard && !menuCard.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    if (expandedCardId || openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [expandedCardId, openMenuId]);

  // 현재 사용자가 만든 기능인지 확인
  const isFeatureOwner = (feature: Feature): boolean => {
    if (!currentUserId || !feature.createdBy) return false;
    return feature.createdBy === currentUserId;
  };

  // 수정 모달 열기
  const handleEditClick = (feature: Feature) => {
    setEditingFeature(feature);
    setIsEditModalOpen(true);
    setOpenMenuId(null); // 메뉴 닫기
  };

  // 기능 삭제
  const handleDeleteClick = async (feature: Feature) => {
    if (!feature.id) return;
    
    if (confirm(`"${feature.name}" 기능을 삭제하시겠습니까?`)) {
      try {
        setIsLoading(true);
        await deleteFeature(feature.id);
        // 목록 새로고침
        const data = await getFeatures();
        const formattedFeatures: Feature[] = data.map(f => ({
          ...f,
          id: f.id || '',
          subscribed: false, // 구독 상태는 subscriptionStatuses에서 관리
          notificationEnabled: f.notificationEnabled ?? false,
        }));
        
        // 비공개 기능 필터링
        const filteredFeatures = formattedFeatures.filter(f => {
          if (f.isPublic !== false) return true;
          return f.createdBy === currentUserId;
        });
        
        setFeatures(filteredFeatures);
        setOpenMenuId(null); // 메뉴 닫기
      } catch (err: any) {
        console.error('기능 삭제 실패:', err);
        // 권한 오류인 경우 명확한 메시지 표시
        const errorMessage = err?.message || '기능 삭제에 실패했습니다.';
        setError(errorMessage);
        alert(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
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
      
      // 비공개 기능 필터링
      const filteredFeatures = formattedFeatures.filter(f => {
        if (f.isPublic !== false) return true;
        return f.createdBy === currentUserId;
      });
      
      setFeatures(filteredFeatures);
      
      // 알림 통계도 다시 로드
      const stats = await loadNotificationStats(filteredFeatures);
      setNotificationStats(stats);
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
          subscribed: false, // 구독 상태는 subscriptionStatuses에서 관리
          notificationEnabled: f.notificationEnabled ?? false,
        }));
        
        // 비공개 기능 필터링: 공개 기능이거나, 비공개 기능이지만 현재 사용자가 생성자인 경우만 표시
        const filteredFeatures = formattedFeatures.filter(f => {
          // 공개 기능이면 모든 사용자에게 보임
          if (f.isPublic !== false) return true;
          // 비공개 기능이면 생성자에게만 보임
          return f.createdBy === currentUserId;
        });
        
        setFeatures(filteredFeatures);
        
        // 구독자 수 로드
        const featureIds = filteredFeatures.filter(f => f.id).map(f => f.id!);
        if (featureIds.length > 0) {
          try {
            const counts = await getSubscriptionCounts(featureIds);
            setSubscriptionCounts(counts);
          } catch (error) {
            console.error('구독자 수 로드 실패:', error);
          }
        }
        
        // 세계시간 기능의 알림 통계 로드
        const stats = await loadNotificationStats(filteredFeatures);
        setNotificationStats(stats);
      } catch (err) {
        console.error('기능 목록 로드 실패:', err);
        setError('기능 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatures();
  }, [currentUserId]);

  const categories = ['all', ...Array.from(new Set(features.map(f => f.category)))];

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || feature.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // 정렬 적용
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        const countA = subscriptionCounts[a.id || ''] || 0;
        const countB = subscriptionCounts[b.id || ''] || 0;
        return countB - countA; // 구독자 수 내림차순
      case 'name':
        return a.name.localeCompare(b.name, 'ko'); // 이름 가나다순
      case 'latest':
      default:
        // 최신순 (createdAt 기준, 없으면 id 기준)
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA; // 최신순
    }
  });

  const handleToggleSubscription = async (feature: Feature) => {
    if (!currentUserId || !feature.id) {
      showToast('로그인이 필요합니다.', 'error', 3000);
      return;
    }

    const isCurrentlySubscribed = subscriptionStatuses[feature.id] || false;
    setIsSubscribing(prev => ({ ...prev, [feature.id!]: true }));

    try {
      if (isCurrentlySubscribed) {
        await unsubscribeFromFeature(currentUserId, feature.id);
        setSubscriptionStatuses(prev => ({ ...prev, [feature.id!]: false }));
        // 구독자 수 업데이트
        const newCount = Math.max(0, (subscriptionCounts[feature.id] || 0) - 1);
        setSubscriptionCounts(prev => ({ ...prev, [feature.id!]: newCount }));
        showToast(`"${feature.name}" 구독이 취소되었습니다.`, 'success', 2000);
      } else {
        await subscribeToFeature(currentUserId, feature.id);
        setSubscriptionStatuses(prev => ({ ...prev, [feature.id!]: true }));
        // 구독자 수 업데이트
        const newCount = (subscriptionCounts[feature.id] || 0) + 1;
        setSubscriptionCounts(prev => ({ ...prev, [feature.id!]: newCount }));
        showToast(`"${feature.name}" 구독이 완료되었습니다.`, 'success', 2000);
      }
    } catch (error: any) {
      console.error('구독 토글 실패:', error);
      showToast(error.message || '구독 처리에 실패했습니다.', 'error', 4000);
    } finally {
      setIsSubscribing(prev => ({ ...prev, [feature.id!]: false }));
    }
  };

  // 통계 계산
  const totalFeatures = features.length;
  const subscribedCount = features.filter(f => f.id && subscriptionStatuses[f.id]).length;
  const activeNotifications = features.filter(f => 
    f.id && subscriptionStatuses[f.id] && f.notificationEnabled
  ).length;
  
  // 신규 기능 (최근 7일 내 등록)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newFeatures = features.filter(f => {
    if (!f.createdAt) return false;
    return f.createdAt >= sevenDaysAgo;
  }).length;
  
  // 인기 기능 (구독자 수가 5명 이상)
  const popularFeatures = features.filter(f => {
    if (!f.id) return false;
    return (subscriptionCounts[f.id] || 0) >= 5;
  }).length;

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
      
      // 비공개 기능 필터링
      const filteredFeatures = formattedFeatures.filter(f => {
        if (f.isPublic !== false) return true;
        return f.createdBy === currentUserId;
      });
      
      setFeatures(filteredFeatures);
      
      // 알림 통계도 다시 로드
      const stats = await loadNotificationStats(filteredFeatures);
      setNotificationStats(stats);
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
            className="mr-20"
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
          label="신규 기능"
          value={newFeatures}
          variant="default"
          icon={<FiTrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="인기 기능"
          value={popularFeatures}
          variant="success"
          icon={<FiStar className="w-5 h-5" />}
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
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular' | 'name')}
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="name">이름순</option>
        </Select>
        {/* 뷰 모드 전환 버튼 */}
        <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-800">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'card'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="카드 보기"
            aria-label="카드 보기"
          >
            <FiGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="리스트 보기"
            aria-label="리스트 보기"
          >
            <FiList size={18} />
          </button>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && <LoadingState message="기능 목록을 불러오는 중..." />}

      {/* 에러 상태 */}
      {error && !isLoading && <ErrorState message={error} />}

      {/* 기능 목록 */}
      {!isLoading && !error && (
        viewMode === 'card' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {sortedFeatures.map((feature) => {
            const isExpanded = expandedCardId === feature.id;
            const cardId = feature.id || '';
            
            return (
            <div
              key={cardId}
              ref={(el) => {
                if (el) {
                  cardRefs.current[cardId] = el;
                }
              }}
            >
            <Card 
              hover 
              className={`flex flex-col h-full relative min-w-[240px] transition-all duration-300 ${
                isExpanded ? 'col-span-full row-span-2' : ''
              }`}
            >
            {/* 메뉴 버튼 (만든 사람만 표시) */}
            {isFeatureOwner(feature) && (
              <div className="absolute top-2 right-2 z-20" ref={(el) => {
                if (el) {
                  menuRefs.current[cardId] = el;
                }
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === cardId ? null : cardId);
                  }}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="메뉴"
                  title="메뉴"
                >
                  <FiMoreVertical size={16} />
                </button>
                
                {/* 드롭다운 메뉴 */}
                {openMenuId === cardId && (
                  <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(feature);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FiEdit2 size={16} />
                      수정
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(feature);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FiTrash2 size={16} />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4 pr-8">
              <div className="flex-1 min-w-0">
                <h3 className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words ${!isExpanded ? 'line-clamp-2' : ''}`}>
                  {feature.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* URL 또는 내부 기능 표시 */}
                  <FeatureTypeBadge feature={feature} />
                  <Badge variant="default">
                    {feature.category}
                  </Badge>
                  {/* 구독자 수 표시 */}
                  {feature.id && subscriptionCounts[feature.id] !== undefined && (
                    <Badge variant="default" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                      구독자 {subscriptionCounts[feature.id]}명
                    </Badge>
                  )}
                  {feature.id && subscriptionStatuses[feature.id] === true && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                      <FiCheck size={16} />
                      구독 중
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className={`text-gray-600 dark:text-gray-400 mb-4 text-sm break-words ${!isExpanded ? 'line-clamp-2 overflow-hidden' : ''}`}>
              {feature.description}
            </p>

            <div className="mt-auto">
              {/* 내부 기능인 경우에만 알림 상태 표시 */}
              {feature.url?.startsWith('/features/') && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiInfo size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      알림: {feature.notificationEnabled ? '활성화' : '비활성화'}
                    </span>
                  </div>
                  {/* 세계시간 기능의 알림 통계 표시 */}
                  {feature.url?.startsWith('/features/world-clock') && feature.id && notificationStats[feature.id] && (
                    <NotificationStats stats={notificationStats[feature.id]} />
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant={feature.id && subscriptionStatuses[feature.id] ? 'secondary' : 'primary'}
                  fullWidth
                  onClick={() => handleToggleSubscription(feature)}
                  disabled={!currentUserId || (feature.id ? isSubscribing[feature.id] : false)}
                >
                  {feature.id && subscriptionStatuses[feature.id] ? '구독 취소' : '구독하기'}
                </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  // Ctrl 키가 눌려있으면 새 탭에서 열기
                  const openInNewTab = e.ctrlKey || e.metaKey;
                  
                  // 내부 기능인 경우 (/features/로 시작하는 경우)
                  if (feature.url?.startsWith('/features/')) {
                    // URL 파라미터 파싱
                    const [path, queryString] = feature.url.split('?');
                    const params = new URLSearchParams(queryString || '');
                    
                    // feature.id를 featureId 파라미터로 추가 (각 기능을 고유하게 구분)
                    if (feature.id) {
                      params.set('featureId', feature.id);
                    }
                    
                    // 사용자 ID를 파라미터로 추가
                    if (currentUserId) {
                      params.set('userId', currentUserId);
                    }
                    
                    const newQueryString = params.toString();
                    const targetUrl = newQueryString ? `${path}?${newQueryString}` : path;
                    
                    if (openInNewTab) {
                      window.open(targetUrl, '_blank');
                    } else {
                      window.location.href = targetUrl;
                    }
                  } else {
                    // 외부 URL인 경우 그대로 사용
                    if (openInNewTab) {
                      window.open(feature.url, '_blank');
                    } else {
                      window.location.href = feature.url || '#';
                    }
                  }
                }}
                icon={<FiExternalLink size={16} />}
                aria-label="웹사이트 열기"
                title="웹사이트 열기 (Ctrl + 클릭: 새 탭에서 열기)"
              >
                <span className="sr-only">웹사이트 열기</span>
              </Button>
              </div>
              
              {/* 확장/축소 버튼 */}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 -mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCardId(isExpanded ? null : cardId);
                  }}
                  icon={isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                >
                  {isExpanded ? '접기' : '자세히 보기'}
                </Button>
              </div>
            </div>
          </Card>
          </div>
          );
          })}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedFeatures.map((feature) => {
              const cardId = feature.id || '';
              
              return (
                <Card
                  key={cardId}
                  hover
                  className="relative"
                >
                  <div className="flex items-start gap-4">
                    {/* 메뉴 버튼 (만든 사람만 표시) */}
                    {isFeatureOwner(feature) && (
                      <div className="absolute top-4 right-4 z-20" ref={(el) => {
                        if (el) {
                          menuRefs.current[cardId] = el;
                        }
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === cardId ? null : cardId);
                          }}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
                          aria-label="메뉴"
                          title="메뉴"
                        >
                          <FiMoreVertical size={16} />
                        </button>
                        
                        {/* 드롭다운 메뉴 */}
                        {openMenuId === cardId && (
                          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-30">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(feature);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <FiEdit2 size={16} />
                              수정
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(feature);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <FiTrash2 size={16} />
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {feature.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {/* URL 또는 내부 기능 표시 */}
                            {feature.url?.startsWith('/features/') ? (
                              <Badge variant="default" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                                내부 기능
                              </Badge>
                            ) : feature.url ? (
                              <Badge variant="default" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700">
                                외부 URL
                              </Badge>
                            ) : null}
                            <Badge variant="default">
                              {feature.category}
                            </Badge>
                            {/* 구독자 수 표시 */}
                            {feature.id && subscriptionCounts[feature.id] !== undefined && (
                              <Badge variant="default" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                                구독자 {subscriptionCounts[feature.id]}명
                              </Badge>
                            )}
                            {feature.id && subscriptionStatuses[feature.id] === true && (
                              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                <FiCheck size={16} />
                                구독 중
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                        {feature.description}
                      </p>

                      {/* 내부 기능인 경우에만 알림 상태 표시 */}
                      {feature.url?.startsWith('/features/') && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FiInfo size={16} className="text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              알림: {feature.notificationEnabled ? '활성화' : '비활성화'}
                            </span>
                          </div>
                          {/* 세계시간 기능의 알림 통계 표시 */}
                          {feature.url?.startsWith('/features/world-clock') && feature.id && notificationStats[feature.id] && (
                            <div className="flex items-center gap-3 text-xs bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                              <span className="flex items-center gap-1.5 cursor-help" title="전체 알림">
                                <FiBell size={14} className="text-blue-500" />
                                <span className="font-semibold text-blue-600 dark:text-blue-400">{notificationStats[feature.id].total}</span>
                              </span>
                              <span className="flex items-center gap-1.5 cursor-help" title="활성 알림">
                                <FiCheckCircle size={14} className="text-green-500" />
                                <span className="font-semibold text-green-600 dark:text-green-400">{notificationStats[feature.id].active}</span>
                              </span>
                              <span className="flex items-center gap-1.5 cursor-help" title="비활성 알림">
                                <FiClock size={14} className="text-gray-500" />
                                <span className="font-semibold text-gray-600 dark:text-gray-400">{notificationStats[feature.id].inactive}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant={feature.id && subscriptionStatuses[feature.id] ? 'secondary' : 'primary'}
                          onClick={() => handleToggleSubscription(feature)}
                          disabled={!currentUserId || (feature.id ? isSubscribing[feature.id] : false)}
                        >
                          {feature.id && subscriptionStatuses[feature.id] ? '구독 취소' : '구독하기'}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            // Ctrl 키가 눌려있으면 새 탭에서 열기
                            const openInNewTab = e.ctrlKey || e.metaKey;
                            
                            // 내부 기능인 경우 (/features/로 시작하는 경우)
                            if (feature.url?.startsWith('/features/')) {
                              // URL 파라미터 파싱
                              const [path, queryString] = feature.url.split('?');
                              const params = new URLSearchParams(queryString || '');
                              
                              // feature.id를 featureId 파라미터로 추가 (각 기능을 고유하게 구분)
                              if (feature.id) {
                                params.set('featureId', feature.id);
                              }
                              
                              // 사용자 ID를 파라미터로 추가
                              if (currentUserId) {
                                params.set('userId', currentUserId);
                              }
                              
                              const newQueryString = params.toString();
                              const targetUrl = newQueryString ? `${path}?${newQueryString}` : path;
                              
                              if (openInNewTab) {
                                window.open(targetUrl, '_blank');
                              } else {
                                window.location.href = targetUrl;
                              }
                            } else {
                              // 외부 URL인 경우 그대로 사용
                              if (openInNewTab) {
                                window.open(feature.url, '_blank');
                              } else {
                                window.location.href = feature.url || '#';
                              }
                            }
                          }}
                          icon={<FiExternalLink size={16} />}
                          aria-label="웹사이트 열기"
                          title="웹사이트 열기 (Ctrl + 클릭: 새 탭에서 열기)"
                        >
                          <span className="sr-only">웹사이트 열기</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* 빈 목록 상태 */}
      {!isLoading && !error && sortedFeatures.length === 0 && (
        <EmptyState
          message={
            searchTerm || filterCategory !== 'all' 
              ? '검색 결과가 없습니다.' 
              : '등록된 기능이 없습니다. 기능을 등록해보세요!'
          }
          actionLabel={!searchTerm && filterCategory === 'all' && isLoggedIn ? '첫 기능 등록하기' : undefined}
          onAction={!searchTerm && filterCategory === 'all' && isLoggedIn ? () => setIsAddModalOpen(true) : undefined}
          icon={!searchTerm && filterCategory === 'all' ? <FiStar size={48} className="text-gray-400 mx-auto" /> : undefined}
        />
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

      {/* 토스트 알림 컨테이너 */}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

