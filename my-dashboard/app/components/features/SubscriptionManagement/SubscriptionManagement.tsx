'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiExternalLink, FiCheck, FiInfo, FiBell, FiStar, FiChevronDown, FiChevronUp, FiX, FiBellOff, FiCheckCircle, FiClock } from 'react-icons/fi';
import { PageHeader } from '../../ui/PageHeader';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SearchInput } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { StatCard } from '../../ui/StatCard';
import { ToastContainer, type Toast } from '../../ui/Toast';
import { onAuthChange, getCurrentUser } from '@/lib/firebase';
import { getCreatorSettings } from '@/lib/firebase/worldClock';
import { 
  getUserSubscriptions, 
  unsubscribeFromFeature, 
  toggleNotification,
  subscribeUserSubscriptions 
} from '@/lib/firebase/subscriptions';
import type { User } from 'firebase/auth';
import type { SubscriptionWithFeature } from '@/types/subscriptions';

export default function SubscriptionManagement() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithFeature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [notificationStats, setNotificationStats] = useState<Record<string, { total: number; active: number; inactive: number }>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthChange((user: User | null) => {
      setUser(user);
      if (!user) {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 구독 목록 로드
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadSubscriptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserSubscriptions(user.uid);
        setSubscriptions(data);
        
        // 알림 통계 로드
        const stats: Record<string, { total: number; active: number; inactive: number }> = {};
        for (const subscription of data) {
          if (subscription.feature.url?.startsWith('/features/world-clock') && subscription.feature.id && subscription.feature.createdBy) {
            try {
              const creatorSettings = await getCreatorSettings(subscription.feature.id, subscription.feature.createdBy);
              if (creatorSettings && creatorSettings.notifications?.alerts) {
                const alerts = creatorSettings.notifications.alerts;
                stats[subscription.feature.id] = {
                  total: alerts.length,
                  active: alerts.filter(a => a.active !== false).length,
                  inactive: alerts.filter(a => a.active === false).length,
                };
              } else {
                stats[subscription.feature.id] = { total: 0, active: 0, inactive: 0 };
              }
            } catch (error) {
              console.error(`알림 통계 로드 실패 (${subscription.feature.id}):`, error);
              stats[subscription.feature.id] = { total: 0, active: 0, inactive: 0 };
            }
          }
        }
        setNotificationStats(stats);
      } catch (err: any) {
        console.error('구독 목록 로드 실패:', err);
        setError(err.message || '구독 목록을 불러오는데 실패했습니다.');
        setToasts(prev => [...prev, {
          id: Date.now().toString(),
          message: err.message || '구독 목록을 불러오는데 실패했습니다.',
          type: 'error',
          duration: 4000,
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptions();
  }, [user]);

  // 실시간 동기화
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeUserSubscriptions(user.uid, async (updatedSubscriptions) => {
      setSubscriptions(updatedSubscriptions);
      
      // 알림 통계도 다시 로드
      const stats: Record<string, { total: number; active: number; inactive: number }> = {};
      for (const subscription of updatedSubscriptions) {
        if (subscription.feature.url?.startsWith('/features/world-clock') && subscription.feature.id && subscription.feature.createdBy) {
          try {
            const creatorSettings = await getCreatorSettings(subscription.feature.id, subscription.feature.createdBy);
            if (creatorSettings && creatorSettings.notifications?.alerts) {
              const alerts = creatorSettings.notifications.alerts;
              stats[subscription.feature.id] = {
                total: alerts.length,
                active: alerts.filter(a => a.active !== false).length,
                inactive: alerts.filter(a => a.active === false).length,
              };
            } else {
              stats[subscription.feature.id] = { total: 0, active: 0, inactive: 0 };
            }
          } catch (error) {
            console.error(`알림 통계 로드 실패 (${subscription.feature.id}):`, error);
            stats[subscription.feature.id] = { total: 0, active: 0, inactive: 0 };
          }
        }
      }
      setNotificationStats(stats);
    });

    return () => unsubscribe();
  }, [user]);

  // 외부 클릭 시 카드 접기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedCardId) {
        const cardElement = cardRefs.current[expandedCardId];
        if (cardElement && !cardElement.contains(event.target as Node)) {
          setExpandedCardId(null);
        }
      }
    };

    if (expandedCardId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedCardId]);

  const handleToggleNotification = async (subscription: SubscriptionWithFeature) => {
    if (!user || !subscription.id) return;

    try {
      const newEnabled = !subscription.notificationEnabled;
      await toggleNotification(user.uid, subscription.featureId, newEnabled);
      
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: `알림이 ${newEnabled ? '활성화' : '비활성화'}되었습니다.`,
        type: 'success',
        duration: 2000,
      }]);
    } catch (err: any) {
      console.error('알림 설정 변경 실패:', err);
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: err.message || '알림 설정 변경에 실패했습니다.',
        type: 'error',
        duration: 4000,
      }]);
    }
  };

  const handleUnsubscribe = async (subscription: SubscriptionWithFeature) => {
    if (!user || !subscription.id) return;

    if (!confirm(`"${subscription.feature.name}" 기능의 구독을 취소하시겠습니까?`)) {
      return;
    }

    try {
      await unsubscribeFromFeature(user.uid, subscription.featureId);
      
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '구독이 취소되었습니다.',
        type: 'success',
        duration: 2000,
      }]);
    } catch (err: any) {
      console.error('구독 취소 실패:', err);
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: err.message || '구독 취소에 실패했습니다.',
        type: 'error',
        duration: 4000,
      }]);
    }
  };

  const handleCloseToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 카테고리 목록 추출
  const categories = ['all', ...Array.from(new Set(subscriptions.map(s => s.feature.category)))];

  // 필터링된 구독 목록
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || subscription.feature.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // 통계 계산
  const totalSubscriptions = subscriptions.length;
  const activeNotifications = subscriptions.filter(s => s.notificationEnabled).length;
  const inactiveNotifications = subscriptions.filter(s => !s.notificationEnabled).length;

  // 로그인하지 않은 경우
  if (!user && !isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="구독 관리"
          description="현재 구독 중인 기능들을 관리하세요"
        />
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              구독 관리를 사용하려면 로그인이 필요합니다.
            </p>
            <Button variant="primary" onClick={() => router.push('/login')}>
              로그인하기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="구독 관리"
        description="현재 구독 중인 기능들을 관리하세요"
      />

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="전체 구독"
          value={totalSubscriptions}
          variant="default"
          icon={<FiStar className="w-5 h-5" />}
        />
        <StatCard
          label="알림 활성화"
          value={activeNotifications}
          variant="success"
          icon={<FiCheck className="w-5 h-5" />}
        />
        <StatCard
          label="알림 비활성화"
          value={inactiveNotifications}
          variant="default"
          icon={<FiBellOff className="w-5 h-5" />}
        />
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="구독 기능 검색..."
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
            구독 목록을 불러오는 중...
          </p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 구독 목록 */}
      {!isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {filteredSubscriptions.map((subscription) => {
            const isExpanded = expandedCardId === subscription.id;
            const cardId = subscription.id || '';
            const feature = subscription.feature;
            
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
                  <div className="flex items-start justify-between mb-4 pr-8">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {feature.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
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
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                          <FiCheck size={16} />
                          구독 중
                        </span>
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
                            알림: {subscription.notificationEnabled ? '활성화' : '비활성화'}
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
                        variant="secondary"
                        fullWidth
                        onClick={() => handleUnsubscribe(subscription)}
                        icon={<FiX size={16} />}
                      >
                        구독 취소
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          const openInNewTab = e.ctrlKey || e.metaKey;
                          
                          if (feature.url?.startsWith('/features/')) {
                            const [path, queryString] = feature.url.split('?');
                            const params = new URLSearchParams(queryString || '');
                            
                            if (feature.id) {
                              params.set('featureId', feature.id);
                            }
                            
                            if (user?.uid) {
                              params.set('userId', user.uid);
                            }
                            
                            const newQueryString = params.toString();
                            const targetUrl = newQueryString ? `${path}?${newQueryString}` : path;
                            
                            if (openInNewTab) {
                              window.open(targetUrl, '_blank');
                            } else {
                              window.location.href = targetUrl;
                            }
                          } else {
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
      )}

      {/* 빈 목록 상태 */}
      {!isLoading && !error && filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || filterCategory !== 'all' 
              ? '검색 결과가 없습니다.' 
              : '구독 중인 기능이 없습니다. 기능 목록에서 구독해보세요!'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <Button
              variant="primary"
              onClick={() => router.push('/#features')}
              icon={<FiStar size={18} />}
            >
              기능 목록에서 구독하기
            </Button>
          )}
        </div>
      )}

      {/* 토스트 알림 컨테이너 */}
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
    </div>
  );
}
