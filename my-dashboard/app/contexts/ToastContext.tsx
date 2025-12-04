'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthChange, getCurrentUser } from '@/lib/firebase';
import { getUserSettings, subscribeUserSettings } from '@/lib/firebase/userSettings';
import type { User } from 'firebase/auth';

interface ToastContextType {
  toastDuration: number;
  toastAutoCloseEnabled: boolean;
  isLoading: boolean;
}

const ToastContext = createContext<ToastContextType>({
  toastDuration: 5000, // 기본값 5초
  toastAutoCloseEnabled: true, // 기본값: 활성화
  isLoading: true,
});

export const useToastDuration = () => {
  const context = useContext(ToastContext);
  return context.toastDuration;
};

export const useToastAutoCloseEnabled = () => {
  const context = useContext(ToastContext);
  return context.toastAutoCloseEnabled;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toastDuration, setToastDuration] = useState<number>(5000);
  const [toastAutoCloseEnabled, setToastAutoCloseEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let settingsUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthChange(async (user: User | null) => {
      // 이전 설정 구독 정리
      if (settingsUnsubscribe) {
        settingsUnsubscribe();
        settingsUnsubscribe = null;
      }

      if (user) {
        try {
          // 초기 설정 로드
          const settings = await getUserSettings(user.uid);
          if (settings?.toastDuration) {
            setToastDuration(settings.toastDuration);
          }
          if (settings?.toastAutoCloseEnabled !== undefined) {
            setToastAutoCloseEnabled(settings.toastAutoCloseEnabled);
          }
          setIsLoading(false);

          // 실시간 동기화
          settingsUnsubscribe = subscribeUserSettings(user.uid, (settings) => {
            if (settings?.toastDuration) {
              setToastDuration(settings.toastDuration);
            }
            if (settings?.toastAutoCloseEnabled !== undefined) {
              setToastAutoCloseEnabled(settings.toastAutoCloseEnabled);
            }
          });
        } catch (error) {
          console.error('Toast duration 설정 로드 실패:', error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (settingsUnsubscribe) {
        settingsUnsubscribe();
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toastDuration, toastAutoCloseEnabled, isLoading }}>
      {children}
    </ToastContext.Provider>
  );
};

