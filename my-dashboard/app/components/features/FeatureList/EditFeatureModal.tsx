'use client';

import { useState, FormEvent, useEffect } from 'react';
import { getActiveFeatureTemplates, initializeFeatureTemplates } from '@/lib/firebase/featureTemplates';
import type { FeatureTemplate } from '@/lib/firebase/featureTemplates';
import { FiX, FiGlobe, FiFileText, FiTag, FiLink, FiLock, FiUnlock, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { updateFeature, type Feature } from '@/lib/firebase/features';

interface EditFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  feature: Feature | null;
}

const categories = [
  '생활',
  '생산성',
  '엔터테인먼트',
  '뉴스',
  '쇼핑',
  '금융',
  '건강',
  '교육',
  '기타',
];

const newsCategories = ['IT', '경제', '정치', '사회', '기타'] as const;
const newsSources = ['naver', 'daum', 'rss'] as const;

export default function EditFeatureModal({ isOpen, onClose, onSuccess, feature }: EditFeatureModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '기타',
    url: '',
    customUrl: '', // 직접 입력한 URL
    isPublic: true,
    status: 'completed' as 'completed' | 'coming_soon',
    newsKeywords: [] as string[], // 뉴스 스크래퍼 키워드
    newsSources: ['naver', 'daum'] as string[], // 뉴스 스크래퍼 소스
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [featureTemplates, setFeatureTemplates] = useState<FeatureTemplate[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  
  // 뉴스 스크래퍼인지 확인
  const isNewsScraper = formData.url.includes('news-scraper');
  
  // 기본 템플릿 (에러 시 fallback용)
  const DEFAULT_FALLBACK_TEMPLATES: FeatureTemplate[] = [
    {
      id: 'world-clock',
      name: '세계시간',
      url: '/features/world-clock?id=world-clock',
      description: '전 세계 도시의 현재 시간을 확인할 수 있습니다',
      category: '생산성',
      isActive: true,
      order: 1,
    },
    {
      id: 'calendar',
      name: '캘린더',
      url: '/features/calendar?id=calendar',
      description: '일정 관리 및 캘린더 기능',
      category: '생산성',
      isActive: true,
      order: 2,
    },
    {
      id: 'news-scraper',
      name: '뉴스 스크래퍼',
      url: '/features/news-scraper?id=news-scraper',
      description: 'AI 기반 뉴스 자동 수집 및 분석',
      category: '뉴스',
      isActive: true,
      order: 3,
    },
  ];
  
  // 기능 템플릿 로드
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        // 템플릿 초기화 (없으면 기본 템플릿 생성)
        await initializeFeatureTemplates();
        // 활성화된 템플릿 가져오기
        const templates = await getActiveFeatureTemplates();
        setFeatureTemplates(templates);
      } catch (error) {
        console.error('기능 템플릿 로드 실패:', error);
        // 에러가 나도 기본 템플릿 사용 (하드코딩된 목록)
        setFeatureTemplates(DEFAULT_FALLBACK_TEMPLATES);
      }
    };
    
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  // feature가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (feature) {
      // 내부 기능 URL인지 확인
      const isInternalFeature = feature.url?.startsWith('/features/');
      setFormData({
        name: feature.name || '',
        description: feature.description || '',
        category: feature.category || '기타',
        url: isInternalFeature ? feature.url || '' : '__custom__',
        customUrl: isInternalFeature ? '' : (feature.url || ''),
        isPublic: feature.isPublic ?? true,
        status: feature.status || 'completed',
        newsKeywords: feature.newsKeywords || [],
        newsSources: feature.newsSources || ['naver', 'daum'],
      });
      setNewKeywordInput('');
    }
  }, [feature]);
  
  // 키워드 추가
  const handleAddKeyword = () => {
    const keyword = newKeywordInput.trim();
    if (keyword && !formData.newsKeywords.includes(keyword)) {
      setFormData({
        ...formData,
        newsKeywords: [...formData.newsKeywords, keyword],
      });
      setNewKeywordInput('');
    }
  };
  
  // 키워드 제거
  const handleRemoveKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      newsKeywords: formData.newsKeywords.filter(k => k !== keyword),
    });
  };

  if (!isOpen || !feature || !feature.id) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 유효성 검사
    if (!formData.name.trim()) {
      setError('기능 이름을 입력해주세요.');
      setIsLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('기능 설명을 입력해주세요.');
      setIsLoading(false);
      return;
    }
    // URL 또는 내부 기능 선택 확인
    const finalUrl = formData.url === '__custom__' ? formData.customUrl : formData.url;
    
    if (!finalUrl.trim()) {
      setError('웹사이트 URL 또는 내부 기능을 선택해주세요.');
      setIsLoading(false);
      return;
    }
    
    // 외부 URL인 경우 형식 검사
    if (formData.url === '__custom__') {
      try {
        new URL(finalUrl);
      } catch {
        setError('올바른 URL 형식을 입력해주세요. (예: https://example.com)');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (!feature.id) {
        setError('기능 ID가 없습니다.');
        setIsLoading(false);
        return;
      }
      
      // 뉴스 스크래퍼인 경우 newsCategories, newsKeywords, newsSources 포함
      const updateData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        url: (formData.url === '__custom__' ? formData.customUrl : formData.url).trim(),
        isPublic: formData.isPublic,
        status: formData.status,
      };
      
      // 뉴스 스크래퍼인 경우에만 뉴스 관련 설정 추가
      if (isNewsScraper) {
        // 키워드 저장 (없으면 빈 배열)
        updateData.newsKeywords = formData.newsKeywords.length > 0 ? formData.newsKeywords : [];
        updateData.newsSources = formData.newsSources;
      }
      
      await updateFeature(feature.id, updateData);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      // 권한 오류인 경우 명확한 메시지 표시
      const errorMessage = err?.message || '기능 수정에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
      console.error('기능 수정 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            웹 기능 수정
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-50"
            aria-label="닫기"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 기능 이름 */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiFileText className="inline w-4 h-4 mr-1" />
              기능 이름 *
              <span className={`ml-2 text-xs ${
                formData.name.length >= 90 
                  ? 'text-red-600 dark:text-red-400 font-semibold' 
                  : formData.name.length >= 80 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                ({formData.name.length}/100)
              </span>
            </label>
            <Input
              id="edit-name"
              type="text"
              placeholder="예: 세계시간, 할일 관리"
              value={formData.name}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setFormData({ ...formData, name: e.target.value });
                }
              }}
              maxLength={100}
              required
              disabled={isLoading}
            />
            {formData.name.length >= 90 && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                제목이 너무 깁니다. 카드에서 잘릴 수 있습니다.
              </p>
            )}
          </div>

          {/* 기능 설명 */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiFileText className="inline w-4 h-4 mr-1" />
              기능 설명 *
              <span className={`ml-2 text-xs ${
                formData.description.length >= 450 
                  ? 'text-red-600 dark:text-red-400 font-semibold' 
                  : formData.description.length >= 400 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                ({formData.description.length}/500)
              </span>
            </label>
            <textarea
              id="edit-description"
              rows={4}
              placeholder="이 기능에 대한 상세한 설명을 입력해주세요"
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setFormData({ ...formData, description: e.target.value });
                }
              }}
              maxLength={500}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            {formData.description.length >= 450 && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                설명이 너무 깁니다. 카드에서 잘릴 수 있습니다.
              </p>
            )}
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiTag className="inline w-4 h-4 mr-1" />
              카테고리 *
            </label>
            <Select
              id="edit-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isLoading}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          {/* 웹사이트 URL 또는 내부 기능 선택 */}
          <div>
            <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiLink className="inline w-4 h-4 mr-1" />
              웹사이트 URL 또는 내부 기능 *
            </label>
            <Select
              id="edit-url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              disabled={true}
            >
              <option value="__custom__">직접 입력</option>
              {featureTemplates.map((template) => (
                <option key={template.id} value={template.url}>
                  {template.name}
                </option>
              ))}
            </Select>
            {formData.url === '__custom__' && (
              <Input
                type="url"
                placeholder="https://example.com"
                value={formData.customUrl || ''}
                onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                className="mt-2"
                disabled={true}
              />
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              기능 생성 후 URL은 변경할 수 없습니다.
            </p>
          </div>

          {/* 뉴스 스크래퍼 설정 (뉴스 스크래퍼 선택 시만 표시) */}
          {isNewsScraper && (
            <>
              {/* 뉴스 키워드 입력 */}
              <div>
                <label htmlFor="edit-newsKeywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiTag className="inline w-4 h-4 mr-1" />
                  수집할 뉴스 키워드 (선택사항)
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
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddKeyword}
                    disabled={!newKeywordInput.trim() || isLoading}
                  >
                    추가
                  </Button>
                </div>
                {formData.newsKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[60px]">
                    {formData.newsKeywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="default"
                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center gap-1 pr-1"
                      >
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-1 hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
                          aria-label={`${keyword} 제거`}
                          type="button"
                        >
                          <FiX size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  키워드를 입력하면 제목이나 내용에 해당 키워드가 포함된 뉴스만 수집됩니다. (선택사항)
                </p>
              </div>

              {/* 뉴스 소스 선택 */}
              <div>
                <label htmlFor="edit-newsSources" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiGlobe className="inline w-4 h-4 mr-1" />
                  뉴스 소스
                </label>
                <div className="flex flex-wrap gap-2">
                  {newsSources.map((source) => (
                    <label
                      key={source}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.newsSources.includes(source)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              newsSources: [...formData.newsSources, source],
                            });
                          } else {
                            if (formData.newsSources.length > 1) {
                              setFormData({
                                ...formData,
                                newsSources: formData.newsSources.filter(s => s !== source),
                              });
                            }
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading || (formData.newsSources.length === 1 && formData.newsSources.includes(source))}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {source === 'naver' ? '네이버' : source === 'daum' ? '다음' : 'RSS'}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  최소 1개 이상 선택해야 합니다.
                </p>
              </div>
            </>
          )}

          {/* 공개/비공개 토글 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {formData.isPublic ? (
                <FiGlobe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <FiLock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  공개 설정
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.isPublic 
                    ? '모든 사용자가 이 기능을 볼 수 있습니다' 
                    : '관리자만 이 기능을 볼 수 있습니다'}
                </p>
              </div>
            </div>
            <Toggle
              checked={formData.isPublic}
              onChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              disabled={isLoading}
            />
          </div>

          {/* 완료/준비중 토글 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {formData.status === 'completed' ? (
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <FiClock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  상태
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.status === 'completed' 
                    ? '완료: 사용자가 바로 사용할 수 있습니다' 
                    : formData.status === 'coming_soon'
                    ? '준비중: 곧 출시될 기능입니다'
                    : '준비중: 곧 출시될 기능입니다'}
                </p>
              </div>
            </div>
            <Toggle
              checked={formData.status === 'completed'}
              onChange={(checked) => setFormData({ 
                ...formData, 
                status: checked ? 'completed' : 'coming_soon' 
              })}
              disabled={isLoading}
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? '수정 중...' : '수정하기'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

