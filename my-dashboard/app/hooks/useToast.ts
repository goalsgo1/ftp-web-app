import { useState } from 'react';
import type { Toast } from '@/components/ui/Toast';

/**
 * Toast 알림을 관리하는 커스텀 훅
 * 
 * @returns { toasts, showToast, closeToast }
 * 
 * @example
 * ```tsx
 * const { toasts, showToast, closeToast } = useToast();
 * 
 * // 성공 메시지 표시
 * showToast('저장되었습니다.', 'success');
 * 
 * // 에러 메시지 표시
 * showToast('오류가 발생했습니다.', 'error', 4000);
 * ```
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Toast 메시지를 표시합니다.
   * 
   * @param message 표시할 메시지
   * @param type Toast 타입 ('success' | 'error' | 'info')
   * @param duration 표시 시간 (밀리초, 기본값: 2000)
   */
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration = 2000
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  /**
   * Toast 메시지를 닫습니다.
   * 
   * @param id 닫을 Toast의 ID
   */
  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, showToast, closeToast };
};

