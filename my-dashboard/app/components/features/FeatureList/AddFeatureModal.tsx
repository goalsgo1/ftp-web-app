'use client';

import { useState, FormEvent } from 'react';
import { FiX, FiGlobe, FiFileText, FiTag, FiLink, FiLock, FiUnlock, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { addFeature } from '@/lib/firebase/features';
import { getCurrentUser } from '@/lib/firebase';

interface AddFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function AddFeatureModal({ isOpen, onClose, onSuccess }: AddFeatureModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '기타',
    url: '__custom__', // 기본값을 '직접 입력'으로 설정
    customUrl: '', // 직접 입력한 URL
    isPublic: true, // 공개/비공개
    status: 'completed' as 'completed' | 'coming_soon', // 완료/준비중
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
      const user = getCurrentUser();
      const finalUrl = formData.url === '__custom__' ? formData.customUrl : formData.url;
      
      await addFeature({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        url: finalUrl.trim(),
        isPublic: formData.isPublic,
        status: formData.status,
      }, user?.uid);
      
      // 폼 초기화
      setFormData({
        name: '',
        description: '',
        category: '기타',
        url: '__custom__',
        customUrl: '',
        isPublic: true,
        status: 'completed',
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError('기능 등록에 실패했습니다. 다시 시도해주세요.');
      console.error('기능 등록 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        description: '',
        category: '기타',
        url: '__custom__',
        customUrl: '',
        isPublic: true,
        status: 'completed',
      });
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            새 웹 기능 등록
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              id="name"
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              id="description"
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
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiTag className="inline w-4 h-4 mr-1" />
              카테고리 *
            </label>
            <Select
              id="category"
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
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FiLink className="inline w-4 h-4 mr-1" />
              웹사이트 URL 또는 내부 기능 *
            </label>
            <Select
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              disabled={isLoading}
            >
              <option value="__custom__">직접 입력</option>
              <option value="/features/world-clock?id=world-clock">세계시간</option>
              <option value="/features/calendar?id=calendar">캘린더</option>
            </Select>
            {formData.url === '__custom__' && (
              <Input
                type="url"
                placeholder="https://example.com"
                value={formData.customUrl || ''}
                onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                className="mt-2"
                disabled={isLoading}
              />
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              내부 기능을 선택하거나 외부 웹사이트 URL을 직접 입력할 수 있습니다.
            </p>
          </div>

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
            <div className="flex items-center gap-3">
              {formData.status === 'completed' ? (
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <FiClock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              )}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  상태
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.status === 'completed' 
                    ? '완료: 사용자가 바로 사용할 수 있습니다' 
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
              {isLoading ? '등록 중...' : '등록하기'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

