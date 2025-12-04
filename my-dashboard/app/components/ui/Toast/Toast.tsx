'use client';

import { useEffect, useState, useRef } from 'react';
import { FiX, FiCheckCircle, FiInfo, FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';
import { useToastDuration, useToastAutoCloseEnabled } from '@/contexts/ToastContext';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms, 0이면 자동 닫기 안 함
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export const ToastItem = ({ toast, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const defaultDuration = useToastDuration(); // 사용자 설정에서 기본 duration 가져오기
  const autoCloseEnabled = useToastAutoCloseEnabled(); // 사용자 설정에서 자동 닫기 활성화 여부 가져오기
  const onCloseRef = useRef(onClose);
  
  // Toast가 처음 마운트될 때의 duration을 저장 (이후 변경되지 않음)
  const durationRef = useRef<number | null>(null);
  if (durationRef.current === null) {
    // toast.duration이 명시적으로 0이면 자동 닫기 비활성화
    // 그 외에는 사용자 설정 사용
    if (toast.duration === 0) {
      durationRef.current = 0; // 자동 닫기 비활성화
    } else {
      durationRef.current = toast.duration ?? (autoCloseEnabled ? defaultDuration : 0);
    }
  }
  
  // onClose를 ref로 저장하여 의존성 문제 해결
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // 애니메이션을 위한 지연
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // 자동 닫기 (초기 duration 사용)
    const duration = durationRef.current;
    
    // 디버깅: duration 확인
    console.log(`[Toast] ID: ${toast.id}, Duration: ${duration}ms, toast.duration: ${toast.duration}, defaultDuration: ${defaultDuration}, autoCloseEnabled: ${autoCloseEnabled}`);
    
    let closeTimer: NodeJS.Timeout | null = null;
    let removeTimer: NodeJS.Timeout | null = null;
    
    // duration이 0보다 크고, 자동 닫기가 활성화되어 있으면 자동 닫기
    if (duration && duration > 0 && autoCloseEnabled) {
      closeTimer = setTimeout(() => {
        console.log(`[Toast] Closing toast ${toast.id} after ${duration}ms`);
        setIsVisible(false);
        removeTimer = setTimeout(() => {
          onCloseRef.current(toast.id);
        }, 300); // 애니메이션 완료 후 제거
      }, duration);
    }

    return () => {
      clearTimeout(showTimer);
      if (closeTimer) clearTimeout(closeTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, [toast.id]); // toast.id만 의존성으로 사용하여 Toast가 변경될 때만 재실행

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  const icons = {
    success: <FiCheckCircle className="w-5 h-5 text-green-500" />,
    error: <FiAlertCircle className="w-5 h-5 text-red-500" />,
    warning: <FiAlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <FiInfo className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const textColors = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200',
  };

  const type = toast.type || 'info';

  return (
    <div
      className={`
        ${bgColors[type]} ${textColors[type]}
        border rounded-lg shadow-lg p-4 mb-3
        flex items-start gap-3
        min-w-[300px] max-w-md
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="닫기"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

