'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiFileText, FiSearch, FiFilter, FiTrendingUp, FiClock, FiTag, FiExternalLink, FiStar, FiCalendar, FiRefreshCw, FiSettings, FiZap, FiEdit2, FiX, FiTrash2 } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardLayout } from '@/components/layout';
import { PageLayout } from '@/components/layout';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { onAuthChange, getCurrentUser } from '@/lib/firebase';
import { getFeatureById, updateFeature, type Feature } from '@/lib/firebase/features';
import {
  getNewsArticles,
  getNewsStatistics,
  type NewsArticle,
  type NewsStatistics
} from '@/lib/firebase/newsScraper';
import type { User } from 'firebase/auth';

export default function NewsScraperPage() {
  const searchParams = useSearchParams();
  const featureId = searchParams.get('featureId') || searchParams.get('id') || 'news-scraper';

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [feature, setFeature] = useState<Feature | null>(null);
  const [scrapingKeywords, setScrapingKeywords] = useState<string[]>([]);

  // 뉴스 관련 상태
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'published_at' | 'importance_score'>('published_at');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [analyzingArticleId, setAnalyzingArticleId] = useState<string | null>(null);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [isScrapeConfirmModalOpen, setIsScrapeConfirmModalOpen] = useState(false);
  const [editingKeywords, setEditingKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // 통계
  const [stats, setStats] = useState<NewsStatistics>({
    totalArticles: 0,
    todayArticles: 0,
    byCategory: {},
    avgImportance: 0,
    lastScraping: null,
    bySource: {},
  });

  // 접근 권한 체크
  useEffect(() => {
    const checkAccess = async () => {
      if (featureId === 'news-scraper') {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      try {
        const featureData = await getFeatureById(featureId);

        if (!featureData) {
          setHasAccess(false);
          setAccessError('존재하지 않는 기능입니다.');
          setIsLoading(false);
          return;
        }

        setFeature(featureData);

        // 키워드 설정
        if (featureData.newsKeywords && featureData.newsKeywords.length > 0) {
          setScrapingKeywords(featureData.newsKeywords);
        } else {
          setScrapingKeywords([]);
        }

        const currentUser = getCurrentUser();

        if (featureData.isPublic) {
          setHasAccess(true);
          return;
        }

        if (!currentUser) {
          setHasAccess(false);
          setAccessError('비공개 기능입니다. 로그인이 필요합니다.');
          setIsLoading(false);
          return;
        }

        if (featureData.createdBy === currentUser.uid) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          setAccessError('비공개 기능입니다. 접근 권한이 없습니다.');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('접근 권한 확인 실패:', error);
        setHasAccess(false);
        setAccessError('접근 권한을 확인하는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [featureId]);

  // 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 뉴스 데이터 로드
  useEffect(() => {
    if (!hasAccess || !featureId) return;

    const loadArticles = async () => {
      try {
        setIsLoading(true);

        // Firebase에서 뉴스 목록 가져오기
        const loadedArticles = await getNewsArticles(featureId, {
          category: selectedCategory !== 'all' ? selectedCategory as any : undefined,
          sortBy: sortBy,
        });

        setArticles(loadedArticles);
        setFilteredArticles(loadedArticles);

        // 통계 데이터 가져오기
        const statistics = await getNewsStatistics(featureId);
        setStats(statistics);
      } catch (error) {
        console.error('뉴스 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, [hasAccess, featureId, selectedCategory, sortBy]);

  // 필터링 및 정렬
  useEffect(() => {
    let filtered = [...articles];

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.refinedCategory === selectedCategory);
    }

    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === 'importance_score') {
        return (b.importanceScore || 0) - (a.importanceScore || 0);
      } else {
        return b.publishedAt.getTime() - a.publishedAt.getTime();
      }
    });

    setFilteredArticles(filtered);
  }, [articles, searchTerm, selectedCategory, sortBy]);

  // 카테고리 목록 (필터링용 - 기사 표시용)
  const categories = ['all', 'IT', '경제', '정치', '사회', '기타'];

  // 검색 초기화
  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  // 키워드 수정 모달 열기
  const handleOpenKeywordModal = () => {
    setEditingKeywords([...scrapingKeywords]);
    setNewKeywordInput('');
    setIsKeywordModalOpen(true);
  };

  // 키워드 추가
  const handleAddKeyword = () => {
    const keyword = newKeywordInput.trim();
    if (keyword && !editingKeywords.includes(keyword)) {
      setEditingKeywords([...editingKeywords, keyword]);
      setNewKeywordInput('');
    }
  };

  // 키워드 제거
  const handleRemoveKeyword = (keyword: string) => {
    setEditingKeywords(editingKeywords.filter(k => k !== keyword));
  };

  // 키워드 저장
  const handleSaveKeywords = async () => {
    if (!user || !feature || !feature.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // Feature 업데이트
      await updateFeature(feature.id, {
        newsKeywords: editingKeywords.length > 0 ? editingKeywords : [],
      });

      // Feature 다시 로드하여 최신 정보 반영
      const updatedFeature = await getFeatureById(feature.id);
      if (updatedFeature) {
        setFeature(updatedFeature);
        // 키워드 업데이트
        if (updatedFeature.newsKeywords && updatedFeature.newsKeywords.length > 0) {
          setScrapingKeywords(updatedFeature.newsKeywords);
        } else {
          setScrapingKeywords([]);
        }
      } else {
        // Feature 로드 실패 시 로컬 상태만 업데이트
        setScrapingKeywords(editingKeywords);
      }

      setIsKeywordModalOpen(false);

      alert('설정이 저장되었습니다.');
    } catch (error: any) {
      console.error('설정 저장 실패:', error);
      alert(`설정 저장 실패: ${error.message}`);
    }
  };

  // 소스 배지 색상
  const getSourceBadgeVariant = (source: string): 'default' | 'success' => {
    switch (source) {
      case 'naver':
        return 'success';
      case 'daum':
      case 'rss':
      default:
        return 'default';
    }
  };

  // 감정 배지 색상
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case '긍정':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case '부정':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case '중립':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  // 시간 포맷
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 단일 기사 분석 함수
  const handleAnalyzeArticle = async (articleId: string) => {
    if (!user || !featureId) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (analyzingArticleId === articleId) return;

    try {
      setAnalyzingArticleId(articleId);

      const response = await fetch('/api/agents/analyze-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      const result = await response.json();

      if (result.success) {
        // 목록 새로고침
        const loadedArticles = await getNewsArticles(featureId, {
          category: selectedCategory !== 'all' ? selectedCategory as any : undefined,
          sortBy: sortBy,
        });
        setArticles(loadedArticles);
        setFilteredArticles(loadedArticles);

        // 통계 새로고침
        const statistics = await getNewsStatistics(featureId);
        setStats(statistics);

        alert('분석 완료!');
      } else {
        alert(`분석 실패: ${result.error}`);
      }
    } catch (error: any) {
      console.error('기사 분석 실패:', error);
      alert(`분석 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setAnalyzingArticleId(null);
    }
  };

  // 전체 분석 함수
  const handleBatchAnalyze = async () => {
    if (!user || !featureId) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isBatchAnalyzing) return;

    if (!confirm('분석이 필요한 기사들을 일괄 분석하시겠습니까? 이 작업은 몇 분이 걸릴 수 있습니다.')) {
      return;
    }

    try {
      setIsBatchAnalyzing(true);

      const response = await fetch('/api/news-scraper/analyze-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureId,
          limit: 20,
          forceReanalyze: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`분석 완료!\n분석됨: ${result.analyzed}개\n총: ${result.total}개\n예상 비용: $${result.totalCost.toFixed(4)}`);

        // 목록 새로고침
        const loadedArticles = await getNewsArticles(featureId, {
          category: selectedCategory !== 'all' ? selectedCategory as any : undefined,
          sortBy: sortBy,
        });
        setArticles(loadedArticles);
        setFilteredArticles(loadedArticles);

        // 통계 새로고침
        const statistics = await getNewsStatistics(featureId);
        setStats(statistics);
      } else {
        alert(`분석 실패: ${result.error}`);
      }
    } catch (error: any) {
      console.error('일괄 분석 실패:', error);
      alert(`분석 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  // 스크래핑 확인 모달 열기
  const handleScrapeClick = () => {
    if (!user || !featureId) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (isScraping) return;
    setIsScrapeConfirmModalOpen(true);
  };

  // 스크래핑 실행 함수
  const handleScrape = async () => {
    if (!user || !featureId) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isScraping) return;

    setIsScrapeConfirmModalOpen(false);

    try {
      setIsScraping(true);

      const response = await fetch('/api/news-scraper/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
          featureId,
          userId: user.uid,
          sources: ['naver', 'daum'],
          keywords: scrapingKeywords.length > 0 ? scrapingKeywords : undefined, // 키워드 필터 (선택사항)
        }),
      });

      const result = await response.json();

      if (result.success) {
        let message = `뉴스 수집 완료!\n발견: ${result.articlesFound}개\n저장: ${result.articlesSaved}개`;
        if (result.warning) {
          message += `\n\n⚠️ ${result.warning}`;
        } else if (result.warnings && result.warnings.length > 0) {
          message += `\n\n⚠️ ${result.warnings.join('\n')}`;
        }
        alert(message);

        // 목록 새로고침
        const loadedArticles = await getNewsArticles(featureId, {
          category: selectedCategory !== 'all' ? selectedCategory as any : undefined,
          sortBy: sortBy,
        });
        setArticles(loadedArticles);
        setFilteredArticles(loadedArticles);

        // 통계 새로고침
        const statistics = await getNewsStatistics(featureId);
        setStats(statistics);
      } else {
        alert(`수집 실패: ${result.error}`);
      }
    } catch (error: any) {
      console.error('스크래핑 실행 실패:', error);
      alert(`수집 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  if (isLoading && hasAccess === null) {
    return (
      <DashboardLayout>
        <PageLayout>
          <LoadingState message="접근 권한을 확인하는 중..." />
        </PageLayout>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <PageLayout>
          <ErrorState message={accessError || '접근 권한이 없습니다.'} />
        </PageLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageLayout>
        <div className="space-y-6">
          {/* 헤더 및 액션 버튼 */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <PageHeader
                title={feature?.name || "뉴스 스크래퍼"}
                description={feature?.description || "AI 기반 뉴스 자동 수집 및 분석"}
              />
              {/* 수집 키워드 태그 */}
              {scrapingKeywords.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">키워드:</span>
                    {scrapingKeywords.map((keyword) => (
                      <Badge key={keyword} variant="default" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                        {keyword}
                      </Badge>
                    ))}
                    {user && feature && (feature.createdBy === user.uid || feature.isPublic) && (
                      <button
                        onClick={handleOpenKeywordModal}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        <FiEdit2 size={14} />
                        수정
                      </button>
                    )}
                  </div>
                </div>
              )}
              {scrapingKeywords.length === 0 && user && feature && (feature.createdBy === user.uid || feature.isPublic) && (
                <div className="mt-3">
                  <button
                    onClick={handleOpenKeywordModal}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    <FiEdit2 size={14} />
                    키워드 설정
                  </button>
                </div>
              )}
            </div>
        {user && feature && (feature.createdBy === user.uid || feature.isPublic) && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleBatchAnalyze}
              disabled={isBatchAnalyzing}
              icon={<FiZap size={18} className={isBatchAnalyzing ? 'animate-pulse' : ''} />}
            >
              {isBatchAnalyzing ? '분석 중...' : 'AI 분석'}
            </Button>
            <Button
              variant="primary"
              onClick={handleScrapeClick}
              disabled={isScraping}
              icon={<FiRefreshCw size={18} className={isScraping ? 'animate-spin' : ''} />}
            >
              {isScraping ? '수집 중...' : '뉴스 수집'}
            </Button>
          </div>
        )}
          </div>

          {/* 키워드 수정 모달 */}
          {isKeywordModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <Card className="w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    수집 키워드 설정
                  </h2>
                  <button
                    onClick={() => setIsKeywordModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="닫기"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 키워드 입력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      수집할 뉴스 키워드
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        placeholder="예: AI, 블록체인, 반도체"
                        value={newKeywordInput}
                        onChange={(e) => setNewKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddKeyword}
                        disabled={!newKeywordInput.trim()}
                      >
                        추가
                      </Button>
                    </div>
                    {editingKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[60px]">
                        {editingKeywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="default"
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center gap-1 pr-1"
                          >
                            {keyword}
                            <button
                              onClick={() => handleRemoveKeyword(keyword)}
                              className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                              aria-label={`${keyword} 제거`}
                            >
                              <FiX size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      키워드를 입력하면 해당 키워드가 포함된 뉴스만 수집합니다.
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsKeywordModalOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleSaveKeywords}
                    >
                      저장
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 스크래핑 확인 모달 */}
          {isScrapeConfirmModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <Card className="w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    뉴스 수집 확인
                  </h2>
                  <button
                    onClick={() => setIsScrapeConfirmModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="닫기"
                    disabled={isScraping}
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 안내 메시지 */}
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      뉴스를 수집하시겠습니까? 이 작업은 몇 분이 걸릴 수 있습니다.
                    </p>
                  </div>

                  {/* 수집 키워드 표시 */}
                  {scrapingKeywords.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        수집 키워드
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        {scrapingKeywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="default"
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsScrapeConfirmModalOpen(false)}
                      disabled={isScraping}
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleScrape}
                      disabled={isScraping}
                    >
                      {isScraping ? '수집 중...' : '수집하기'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 통계 카드 */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">전체 뉴스</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalArticles}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FiFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>
            <Card className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">오늘</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.todayArticles}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FiCalendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>
            <Card className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">평균 중요도</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.avgImportance.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <FiStar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </Card>
            <Card className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">마지막 수집</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.lastScraping ? formatTimeAgo(stats.lastScraping) : '-'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FiClock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* 검색 및 필터 - 네이버 뉴스 스타일 */}
          <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="space-y-4">
              {/* 메인 검색창 */}
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={22} />
                <Input
                  type="text"
                  placeholder="뉴스 제목, 키워드로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-12 py-4 text-lg font-medium border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm"
                />
                {(searchTerm || selectedCategory !== 'all') && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="검색 초기화"
                  >
                    <FiX className="text-gray-500 dark:text-gray-400" size={20} />
                  </button>
                )}
              </div>

              {/* 필터 옵션 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                  <FiFilter className="ml-2 text-gray-400" size={18} />
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 border-0 bg-transparent focus:ring-0"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? '전체 카테고리' : cat}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                  <FiTrendingUp className="ml-2 text-gray-400" size={18} />
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'published_at' | 'importance_score')}
                    className="flex-1 border-0 bg-transparent focus:ring-0"
                  >
                    <option value="published_at">최신순</option>
                    <option value="importance_score">중요도순</option>
                  </Select>
                </div>
              </div>

              {/* 검색 결과 카운트 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {searchTerm || selectedCategory !== 'all'
                    ? `검색 결과 ${filteredArticles.length}개`
                    : `전체 ${filteredArticles.length}개`}
                </span>
                {(searchTerm || selectedCategory !== 'all') && (
                  <button
                    onClick={handleClearSearch}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <FiTrash2 size={14} />
                    초기화
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* 뉴스 목록 - 그리드 레이아웃 */}
          {isLoading ? (
            <LoadingState message="뉴스를 불러오는 중..." />
          ) : filteredArticles.length === 0 ? (
            <Card className="p-12">
              <EmptyState
                message={searchTerm || selectedCategory !== 'all' ? '검색 결과가 없습니다.' : '등록된 뉴스가 없습니다.'}
              />
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <Card key={article.id} hover className="p-6 flex flex-col h-full hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                  {/* 헤더 배지 */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant={getSourceBadgeVariant(article.source)} className="font-semibold">
                      {article.source === 'naver' ? '네이버' : article.source === 'daum' ? '다음' : 'RSS'}
                    </Badge>
                    {article.refinedCategory && (
                      <Badge variant="default" className="font-medium">
                        {article.refinedCategory}
                      </Badge>
                    )}
                    {article.importanceScore != null && (
                      <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
                        <FiStar size={14} fill="currentColor" />
                        {article.importanceScore.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-3 flex-grow">
                    {article.title}
                  </h3>

                  {/* 요약 */}
                  {article.summary && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {article.summary}
                    </p>
                  )}

                  {/* 원라인 */}
                  {article.oneLiner && (
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 line-clamp-2">
                      💡 {article.oneLiner}
                    </p>
                  )}

                  {/* 키워드 */}
                  {article.keywords && article.keywords.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {article.keywords.slice(0, 3).map((keyword, idx) => (
                        <Badge key={idx} variant="default" className="text-xs">
                          #{keyword}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* 하단: 시간 및 액션 */}
                  <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                        <FiClock size={12} />
                        {formatTimeAgo(article.publishedAt)}
                      </span>
                      {article.sentiment && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSentimentColor(article.sentiment)}`}>
                          {article.sentiment}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedArticle(article)}
                        className="flex-1"
                      >
                        상세보기
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(article.url, '_blank')}
                        icon={<FiExternalLink size={16} />}
                        className="px-3"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 상세 보기 모달 */}
          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    뉴스 상세
                  </h2>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="닫기"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 메타 정보 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getSourceBadgeVariant(selectedArticle.source)}>
                      {selectedArticle.source === 'naver' ? '네이버' : selectedArticle.source === 'daum' ? '다음' : 'RSS'}
                    </Badge>
                    {selectedArticle.refinedCategory && (
                      <Badge variant="default">{selectedArticle.refinedCategory}</Badge>
                    )}
                    {selectedArticle.sentiment && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(selectedArticle.sentiment)}`}>
                        {selectedArticle.sentiment}
                      </span>
                    )}
                    {selectedArticle.importanceScore != null && (
                      <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                        <FiStar size={14} fill="currentColor" />
                        <span className="font-semibold">{selectedArticle.importanceScore.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedArticle.title}
                  </h3>

                  {/* 원라인 */}
                  {selectedArticle.oneLiner && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
                        💡 {selectedArticle.oneLiner}
                      </p>
                    </div>
                  )}

                  {/* 요약 */}
                  {selectedArticle.summary && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">요약</h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {selectedArticle.summary}
                      </p>
                    </div>
                  )}

                  {/* 본문 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">본문</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                      {selectedArticle.content}
                    </p>
                  </div>

                  {/* 키워드 */}
                  {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">키워드</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedArticle.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="default">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 엔티티 */}
                  {selectedArticle.entities && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">주요 정보</h4>
                      <div className="space-y-2">
                        {selectedArticle.entities.people && selectedArticle.entities.people.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">인물: </span>
                            {selectedArticle.entities.people.join(', ')}
                          </div>
                        )}
                        {selectedArticle.entities.organizations && selectedArticle.entities.organizations.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">기관: </span>
                            {selectedArticle.entities.organizations.join(', ')}
                          </div>
                        )}
                        {selectedArticle.entities.locations && selectedArticle.entities.locations.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">지역: </span>
                            {selectedArticle.entities.locations.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 메타데이터 */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">발행일: </span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedArticle.publishedAt.toLocaleString('ko-KR')}
                        </span>
                      </div>
                      {selectedArticle.author && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">작성자: </span>
                          <span className="text-gray-900 dark:text-white">{selectedArticle.author}</span>
                        </div>
                      )}
                      {selectedArticle.analyzedAt && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">분석일: </span>
                          <span className="text-gray-900 dark:text-white">
                            {selectedArticle.analyzedAt.toLocaleString('ko-KR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="primary"
                      onClick={() => window.open(selectedArticle.url, '_blank')}
                      icon={<FiExternalLink size={16} />}
                    >
                      원문 보기
                    </Button>
                    {!selectedArticle.importanceScore && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedArticle(null);
                          handleAnalyzeArticle(selectedArticle.id!);
                        }}
                        icon={<FiZap size={14} />}
                      >
                        분석하기
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedArticle(null)}
                    >
                      닫기
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </PageLayout>
    </DashboardLayout>
  );
}
