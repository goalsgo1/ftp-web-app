'use client';

import { useState, useEffect, useRef } from 'react';
import { FiExternalLink, FiCheck, FiInfo, FiBell, FiStar, FiTrendingUp, FiPlus, FiChevronDown, FiChevronUp, FiMoreVertical, FiTrash2, FiEdit2, FiCheckCircle, FiClock } from 'react-icons/fi';
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
import { deleteFeature, getFeatureById } from '@/lib/firebase/features';
import { getCreatorSettings } from '@/lib/firebase/worldClock';
import AddFeatureModal from './AddFeatureModal';
import EditFeatureModal from './EditFeatureModal';

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
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [notificationStats, setNotificationStats] = useState<Record<string, { total: number; active: number; inactive: number }>>({});
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
          subscribed: f.subscribed ?? false,
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
      const stats: Record<string, { total: number; active: number; inactive: number }> = {};
      for (const feature of filteredFeatures) {
        if (feature.url?.startsWith('/features/world-clock') && feature.id && feature.createdBy) {
          try {
            const creatorSettings = await getCreatorSettings(feature.id, feature.createdBy);
            if (creatorSettings && creatorSettings.notifications?.alerts) {
              const alerts = creatorSettings.notifications.alerts;
              stats[feature.id] = {
                total: alerts.length,
                active: alerts.filter(a => a.active !== false).length,
                inactive: alerts.filter(a => a.active === false).length,
              };
            } else {
              stats[feature.id] = { total: 0, active: 0, inactive: 0 };
            }
          } catch (error) {
            console.error(`알림 통계 로드 실패 (${feature.id}):`, error);
            stats[feature.id] = { total: 0, active: 0, inactive: 0 };
          }
        }
      }
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
          subscribed: f.subscribed ?? false,
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
        
        // 세계시간 기능의 알림 통계 로드
        const stats: Record<string, { total: number; active: number; inactive: number }> = {};
        for (const feature of filteredFeatures) {
          if (feature.url?.startsWith('/features/world-clock') && feature.id && feature.createdBy) {
            try {
              const creatorSettings = await getCreatorSettings(feature.id, feature.createdBy);
              if (creatorSettings && creatorSettings.notifications?.alerts) {
                const alerts = creatorSettings.notifications.alerts;
                stats[feature.id] = {
                  total: alerts.length,
                  active: alerts.filter(a => a.active !== false).length,
                  inactive: alerts.filter(a => a.active === false).length,
                };
              } else {
                stats[feature.id] = { total: 0, active: 0, inactive: 0 };
              }
            } catch (error) {
              console.error(`알림 통계 로드 실패 (${feature.id}):`, error);
              stats[feature.id] = { total: 0, active: 0, inactive: 0 };
            }
          }
        }
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
      
      // 비공개 기능 필터링
      const filteredFeatures = formattedFeatures.filter(f => {
        if (f.isPublic !== false) return true;
        return f.createdBy === currentUserId;
      });
      
      setFeatures(filteredFeatures);
      
      // 알림 통계도 다시 로드
      const stats: Record<string, { total: number; active: number; inactive: number }> = {};
      for (const feature of filteredFeatures) {
        if (feature.url?.startsWith('/features/world-clock') && feature.id && feature.createdBy) {
          try {
            const creatorSettings = await getCreatorSettings(feature.id, feature.createdBy);
            if (creatorSettings && creatorSettings.notifications?.alerts) {
              const alerts = creatorSettings.notifications.alerts;
              stats[feature.id] = {
                total: alerts.length,
                active: alerts.filter(a => a.active !== false).length,
                inactive: alerts.filter(a => a.active === false).length,
              };
            } else {
              stats[feature.id] = { total: 0, active: 0, inactive: 0 };
            }
          } catch (error) {
            console.error(`알림 통계 로드 실패 (${feature.id}):`, error);
            stats[feature.id] = { total: 0, active: 0, inactive: 0 };
          }
        }
      }
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {filteredFeatures.map((feature) => {
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
                  {feature.subscribed && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
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
                  variant={feature.subscribed ? 'secondary' : 'primary'}
                  fullWidth
                  onClick={() => toggleSubscription(feature.id || '')}
                >
                  {feature.subscribed ? '구독 취소' : '구독하기'}
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

