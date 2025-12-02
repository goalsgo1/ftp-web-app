'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiClock, FiBell, FiSettings, FiPlus, FiTrash2, FiCheckCircle, FiSave, FiRefreshCw } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { ToastContainer, type Toast } from '@/components/ui/Toast';
import { StatCard } from '@/components/ui/StatCard';
import { DashboardLayout } from '@/components/layout';
import { PageLayout } from '@/components/layout';
import { onAuthChange, getCurrentUser } from '@/lib/firebase';
import { getUserWorldClockSettings, saveUserWorldClockSettings, subscribeUserWorldClockSettings, getCreatorSettings, type WorldClockSettings } from '@/lib/firebase/worldClock';
import { getFeatureById } from '@/lib/firebase/features';
import { TIMEZONES, getTimezoneInfo, getCurrentTime, formatTime, formatDate, type TimezoneInfo } from '@/lib/utils/timezones';
import { requestNotificationPermission, showBrowserNotification, checkNotificationTime } from '@/lib/utils/notifications';
import type { User } from 'firebase/auth';

export default function WorldClockPage() {
  const searchParams = useSearchParams();
  // featureId 파라미터를 우선 사용, 없으면 id 파라미터 사용 (기존 호환성 유지)
  const featureId = searchParams.get('featureId') || searchParams.get('id') || 'world-clock';
  
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<WorldClockSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // 접근 권한 (null: 체크 중, true: 접근 가능, false: 접근 불가)
  const [accessError, setAccessError] = useState<string | null>(null);
  const [feature, setFeature] = useState<{ createdBy?: string } | null>(null); // 기능 정보 (생성자 확인용)
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(['Asia/Seoul']);
  const [currentTimes, setCurrentTimes] = useState<Record<string, Date>>({});
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationAlerts, setNotificationAlerts] = useState<Array<{ timezone: string; time: string; label?: string; active?: boolean; isModified?: boolean }>>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const notificationCheckRef = useRef<(() => void) | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  // 최신 상태를 참조하기 위한 ref
  const selectedTimezonesRef = useRef<string[]>(['Asia/Seoul']);
  const notificationAlertsRef = useRef<Array<{
    timezone: string;
    time: string;
    label?: string;
    active?: boolean;
    isModified?: boolean;
  }>>([]);

  // 브라우저 알림 권한 확인
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // 생성자인지 확인하는 함수
  const isFeatureCreator = (): boolean => {
    // featureId가 'world-clock'인 경우는 기본 기능이므로 모든 사용자에게 권한 부여
    if (featureId === 'world-clock') return true;
    
    // feature 정보가 없으면 권한 없음
    if (!feature || !feature.createdBy) return false;
    
    // 현재 사용자가 생성자인지 확인
    if (!user) return false;
    
    return feature.createdBy === user.uid;
  };

  // 접근 권한 체크 (featureId로 feature 정보 확인)
  useEffect(() => {
    const checkAccess = async () => {
      // featureId가 'world-clock'인 경우는 기본 기능이므로 접근 허용
      if (featureId === 'world-clock') {
        setHasAccess(true);
        return;
      }

      try {
        const featureData = await getFeatureById(featureId);
        
        if (!featureData) {
          // 기능이 존재하지 않음
          setHasAccess(false);
          setAccessError('존재하지 않는 기능입니다.');
          setIsLoading(false);
          return;
        }

        // 기능 정보 저장 (생성자 확인용)
        setFeature(featureData);

        // 공개 기능이면 누구나 접근 가능
        if (featureData.isPublic) {
          setHasAccess(true);
          return;
        }

        // 비공개 기능인 경우, 현재 사용자가 생성자인지 확인
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setHasAccess(false);
          setAccessError('비공개 기능입니다. 로그인이 필요합니다.');
          setIsLoading(false);
          return;
        }

        if (featureData.createdBy === currentUser.uid) {
          // 생성자이면 접근 가능
          setHasAccess(true);
        } else {
          // 생성자가 아니면 접근 불가
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

  // 로그인 상태 확인 및 실시간 설정 감지
  useEffect(() => {
    let settingsUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      
      // 이전 실시간 리스너 정리
      if (settingsUnsubscribe) {
        settingsUnsubscribe();
        settingsUnsubscribe = null;
      }
      
      if (hasAccess === true) {
        if (currentUser) {
          // 로그인한 사용자: 본인 설정 로드
          loadUserSettings(currentUser.uid);
        } else if (feature && feature.createdBy) {
          // 로그인하지 않은 사용자: 공개 기능이면 생성자 설정 로드
          try {
            setIsLoading(true);
            const creatorSettings = await getCreatorSettings(featureId, feature.createdBy);
            
            if (creatorSettings) {
              const timezones = creatorSettings.selectedTimezones || ['Asia/Seoul'];
              const alerts = (creatorSettings.notifications?.alerts || []).map(alert => ({
                ...alert,
                active: alert.active !== undefined ? alert.active : true,
                isModified: false,
              }));
              
              setSelectedTimezones(timezones);
              setNotificationAlerts(alerts);
              selectedTimezonesRef.current = timezones;
              notificationAlertsRef.current = alerts;
            } else {
              // 기본 설정
              const defaultTimezones = ['Asia/Seoul'];
              const defaultAlerts: Array<{
                timezone: string;
                time: string;
                label?: string;
                active?: boolean;
              }> = [];
              
              setSelectedTimezones(defaultTimezones);
              setNotificationAlerts(defaultAlerts);
              selectedTimezonesRef.current = defaultTimezones;
              notificationAlertsRef.current = defaultAlerts;
            }
          } catch (error) {
            console.error('생성자 설정 로드 실패:', error);
            // 기본 설정
            const defaultTimezones = ['Asia/Seoul'];
            setSelectedTimezones(defaultTimezones);
            selectedTimezonesRef.current = defaultTimezones;
          } finally {
            setIsLoading(false);
          }
        }
        
        if (currentUser) {
          // 로그인한 사용자만 실시간 업데이트 구독
          // 실시간 설정 감지 (다른 탭/브라우저에서 변경 시 자동 업데이트)
          let lastSettingsHash = ''; // 마지막 설정의 해시값 (중복 업데이트 방지)
          
          settingsUnsubscribe = subscribeUserWorldClockSettings(
            currentUser.uid,
            featureId,
            (settings) => {
            // 저장 중이면 무시 (로컬 변경)
            if (isSavingRef.current) {
              return;
            }

            if (settings) {
              // 설정 해시 생성 (중복 업데이트 방지)
              const settingsHash = JSON.stringify({
                timezones: settings.selectedTimezones,
                alerts: settings.notifications?.alerts,
              });
              
              // 같은 설정이면 무시
              if (settingsHash === lastSettingsHash) {
                return;
              }
              
              // 현재 로컬 상태와 비교하여 실제로 변경되었는지 확인 (ref 사용)
              const currentAlertsHash = JSON.stringify({
                timezones: selectedTimezonesRef.current,
                alerts: notificationAlertsRef.current,
              });
              
              // 다른 탭에서 변경된 경우만 업데이트
              if (settingsHash !== currentAlertsHash) {
                const updatedTimezones = settings.selectedTimezones || ['Asia/Seoul'];
                const updatedAlerts = (settings.notifications?.alerts || []).map(alert => ({
                  ...alert,
                  active: alert.active !== undefined ? alert.active : true,
                  isModified: false, // 실시간 업데이트 시 수정 플래그 제거
                }));
                
                // 상태 업데이트
                setSettings(settings);
                setSelectedTimezones(updatedTimezones);
                setNotificationAlerts(updatedAlerts);
                
                // ref도 업데이트
                selectedTimezonesRef.current = updatedTimezones;
                notificationAlertsRef.current = updatedAlerts;
                
                lastSettingsHash = settingsHash;
                
                // 다른 탭에서 변경된 경우 토스트 알림
                setToasts((prev: Toast[]) => {
                  // 중복 방지: 이미 같은 메시지가 있으면 추가하지 않음
                  const hasUpdateToast = prev.some(t => t.message.includes('다른 탭에서'));
                  if (!hasUpdateToast) {
                    return [...prev, {
                      id: Date.now().toString(),
                      message: '다른 탭에서 설정이 변경되어 자동으로 업데이트되었습니다.',
                      type: 'info',
                      duration: 3000,
                    }];
                  }
                  return prev;
                });
              } else {
                // 해시가 같아도 lastSettingsHash 업데이트 (초기 로드 시)
                lastSettingsHash = settingsHash;
              }
            } else {
              // 설정이 없으면 기본값
              const defaultTimezones = ['Asia/Seoul'];
              const defaultAlerts: Array<{
                timezone: string;
                time: string;
                label: string;
                active?: boolean;
              }> = [];
              
              setSelectedTimezones(defaultTimezones);
              setNotificationAlerts(defaultAlerts);
              selectedTimezonesRef.current = defaultTimezones;
              notificationAlertsRef.current = defaultAlerts;
              lastSettingsHash = '';
            }
            setIsLoading(false);
          }
          );
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
  }, [featureId, hasAccess]);

  // 알림 시간 체크
  useEffect(() => {
    // 이전 체크 인터벌 정리
    if (notificationCheckRef.current) {
      notificationCheckRef.current();
    }

    // 활성화된 알림만 필터링
    const activeAlerts = notificationAlerts.filter(alert => alert.active !== false);
    
    if (activeAlerts.length === 0) {
      return;
    }

    // 알림 트리거 함수
    const handleNotificationTrigger = (alert: { timezone: string; time: string; label?: string }) => {
      const tzInfo = getTimezoneInfo(alert.timezone);
      const message = alert.label 
        ? `${tzInfo?.flag} ${tzInfo?.label}: ${alert.label} (${alert.time})`
        : `${tzInfo?.flag} ${tzInfo?.label} 시간: ${alert.time}`;

      // 웹 내부 토스트 알림
      const toastId = Date.now().toString();
      setToasts(prev => [...prev, {
        id: toastId,
        message,
        type: 'info',
        duration: 5000,
      }]);

      // 브라우저 알림 (권한이 있는 경우)
      if (notificationPermission === 'granted') {
        showBrowserNotification('세계시간 알림', {
          body: message,
          tag: `world-clock-${alert.timezone}-${alert.time}`, // 중복 방지
          requireInteraction: false,
        });
      }
    };

    // 활성화된 알림만 체크
    notificationCheckRef.current = checkNotificationTime(activeAlerts, handleNotificationTrigger);

    return () => {
      if (notificationCheckRef.current) {
        notificationCheckRef.current();
      }
    };
  }, [notificationAlerts, notificationPermission]);

  // 사용자 설정 로드
  const loadUserSettings = async (userId: string): Promise<any> => {
    try {
      setIsLoading(true);
      const userSettings = await getUserWorldClockSettings(userId, featureId);
      
      if (userSettings) {
        const timezones = userSettings.selectedTimezones || ['Asia/Seoul'];
        const alerts = (userSettings.notifications?.alerts || []).map(alert => ({
          ...alert,
          active: alert.active !== undefined ? alert.active : true,
          isModified: false, // 초기 로드 시 수정 플래그 없음
        }));
        
        setSettings(userSettings);
        setSelectedTimezones(timezones);
        setNotificationAlerts(alerts);
        
        // ref도 업데이트
        selectedTimezonesRef.current = timezones;
        notificationAlertsRef.current = alerts;
        
        return userSettings;
      } else {
        // 기본 설정
        const defaultTimezones = ['Asia/Seoul'];
        const defaultAlerts: Array<{
          timezone: string;
          time: string;
          label?: string;
          active?: boolean;
        }> = [];
        
        setSelectedTimezones(defaultTimezones);
        setNotificationAlerts(defaultAlerts);
        selectedTimezonesRef.current = defaultTimezones;
        notificationAlertsRef.current = defaultAlerts;
        
        return null;
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 시간 업데이트 (1초마다)
  useEffect(() => {
    const updateTimes = () => {
      const times: Record<string, Date> = {};
      const now = new Date();
      
      selectedTimezones.forEach(tz => {
        // 정확한 시간대 시간을 가져오기 위해 현재 시간 사용
        // Date 객체는 시간대 정보를 저장하지 않으므로, 
        // 표시할 때만 시간대를 적용
        times[tz] = now;
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [selectedTimezones]);

  // 시간대 추가 (즉시 저장하여 다른 탭에 반영)
  const handleAddTimezone = async (timezone: string) => {
    // 생성자 권한 체크
    if (!isFeatureCreator()) {
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '시간대 추가 권한이 없습니다. 생성자만 시간대를 추가할 수 있습니다.',
        type: 'error',
        duration: 3000,
      }]);
      return;
    }

    if (!user) {
      // 로그인하지 않은 경우 로컬 상태만 업데이트
      if (!selectedTimezones.includes(timezone)) {
        const updated = [...selectedTimezones, timezone];
        setSelectedTimezones(updated);
        selectedTimezonesRef.current = updated;
      }
      return;
    }

    if (!selectedTimezones.includes(timezone)) {
      const updated = [...selectedTimezones, timezone];
      
      // 로컬 상태 먼저 업데이트
      setSelectedTimezones(updated);
      selectedTimezonesRef.current = updated;
      
      // 즉시 저장하여 다른 탭에 반영
      try {
        isSavingRef.current = true;
        
        await saveUserWorldClockSettings(user.uid, featureId, {
          selectedTimezones: updated,
          notifications: {
            enabled: notificationAlerts.filter(a => a.active !== false).length > 0,
            alerts: notificationAlerts,
          },
        });
        
        // 저장 완료 후 약간의 지연을 두고 플래그 해제
        setTimeout(() => {
          isSavingRef.current = false;
        }, 500);
        
        const tzInfo = getTimezoneInfo(timezone);
        setToasts(prev => [...prev, {
          id: Date.now().toString(),
          message: `${tzInfo?.flag} ${tzInfo?.label} 시간대가 추가되었습니다.`,
          type: 'success',
          duration: 2000,
        }]);
      } catch (error) {
        console.error('시간대 추가 실패:', error);
        // 저장 실패 시 이전 상태로 복구
        setSelectedTimezones(selectedTimezonesRef.current);
        isSavingRef.current = false;
        
        setToasts(prev => [...prev, {
          id: Date.now().toString(),
          message: '시간대 추가에 실패했습니다.',
          type: 'error',
          duration: 3000,
        }]);
      }
    }
  };

  // 시간대 제거 (즉시 저장하여 다른 탭에 반영)
  const handleRemoveTimezone = async (timezone: string) => {
    // 생성자 권한 체크
    if (!isFeatureCreator()) {
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '시간대 삭제 권한이 없습니다. 생성자만 시간대를 삭제할 수 있습니다.',
        type: 'error',
        duration: 3000,
      }]);
      return;
    }

    if (!user) {
      // 로그인하지 않은 경우 로컬 상태만 업데이트
      const updatedTimezones = selectedTimezones.filter(tz => tz !== timezone);
      const updatedAlerts = notificationAlerts.filter(alert => alert.timezone !== timezone);
      setSelectedTimezones(updatedTimezones);
      setNotificationAlerts(updatedAlerts);
      selectedTimezonesRef.current = updatedTimezones;
      notificationAlertsRef.current = updatedAlerts;
      return;
    }

    const updatedTimezones = selectedTimezones.filter(tz => tz !== timezone);
    const updatedAlerts = notificationAlerts.filter(alert => alert.timezone !== timezone);
    
    // 로컬 상태 먼저 업데이트
    setSelectedTimezones(updatedTimezones);
    setNotificationAlerts(updatedAlerts);
    selectedTimezonesRef.current = updatedTimezones;
    notificationAlertsRef.current = updatedAlerts;
    
    // 즉시 저장하여 다른 탭에 반영
    try {
      isSavingRef.current = true;
      
      await saveUserWorldClockSettings(user.uid, featureId, {
        selectedTimezones: updatedTimezones,
        notifications: {
          enabled: updatedAlerts.filter(a => a.active !== false).length > 0,
          alerts: updatedAlerts,
        },
      });
      
      // 저장 완료 후 약간의 지연을 두고 플래그 해제
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
      
      const tzInfo = getTimezoneInfo(timezone);
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: `${tzInfo?.flag} ${tzInfo?.label} 시간대가 제거되었습니다.`,
        type: 'success',
        duration: 2000,
      }]);
    } catch (error) {
      console.error('시간대 제거 실패:', error);
      // 저장 실패 시 이전 상태로 복구
      setSelectedTimezones(selectedTimezonesRef.current);
      setNotificationAlerts(notificationAlertsRef.current);
      isSavingRef.current = false;
      
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '시간대 제거에 실패했습니다.',
        type: 'error',
        duration: 3000,
      }]);
    }
  };

  // 알림 추가
  const handleAddNotification = () => {
    // 생성자 권한 체크
    if (!isFeatureCreator()) {
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '알림 추가 권한이 없습니다. 생성자만 알림을 추가할 수 있습니다.',
        type: 'error',
        duration: 3000,
      }]);
      return;
    }

    if (selectedTimezones.length === 0) return;
    
    const updated = [
      ...notificationAlerts,
      {
        timezone: selectedTimezones[0],
        time: '09:00',
        label: '',
        active: false, // 새로 추가된 알림은 비활성화 (사용자가 활성화해야 함)
        isModified: false, // 새로 추가된 알림은 수정 플래그 없음
      },
    ];
    setNotificationAlerts(updated);
    notificationAlertsRef.current = updated;
  };

  // 알림 제거 (즉시 저장하여 다른 탭에 반영)
  const handleRemoveNotification = async (index: number) => {
    // 생성자 권한 체크
    if (!isFeatureCreator()) {
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '알림 삭제 권한이 없습니다. 생성자만 알림을 삭제할 수 있습니다.',
        type: 'error',
        duration: 3000,
      }]);
      return;
    }

    if (!user) {
      // 로그인하지 않은 경우 로컬 상태만 업데이트
      const updated = notificationAlerts.filter((_, i) => i !== index);
      setNotificationAlerts(updated);
      notificationAlertsRef.current = updated;
      return;
    }

    const updated = notificationAlerts.filter((_, i) => i !== index);
    
    // 로컬 상태 먼저 업데이트
    setNotificationAlerts(updated);
    notificationAlertsRef.current = updated;
    
    // 즉시 저장하여 다른 탭에 반영
    try {
      isSavingRef.current = true;
      
      await saveUserWorldClockSettings(user.uid, featureId, {
        selectedTimezones: selectedTimezonesRef.current,
        notifications: {
          enabled: updated.filter(a => a.active !== false).length > 0,
          alerts: updated,
        },
      });
      
      // 저장 완료 후 약간의 지연을 두고 플래그 해제
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
      
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '알림이 삭제되었습니다.',
        type: 'success',
        duration: 2000,
      }]);
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      // 저장 실패 시 이전 상태로 복구
      setNotificationAlerts(notificationAlertsRef.current);
      isSavingRef.current = false;
      
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '알림 삭제에 실패했습니다.',
        type: 'error',
        duration: 3000,
      }]);
    }
  };

  // 자동 저장 함수 (debounce 적용)
  const autoSaveSettings = async (skipToast = false) => {
    if (!user || isSavingRef.current) return;

    // 이전 타이머 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 500ms 후 저장 (debounce)
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        isSavingRef.current = true;
        
        await saveUserWorldClockSettings(user.uid, featureId, {
          selectedTimezones,
          notifications: {
            enabled: notificationAlerts.length > 0,
            alerts: notificationAlerts,
          },
        });
        
        // 저장 후 설정 업데이트 (실시간 리스너에서 무시하도록)
        setSettings((prev: WorldClockSettings | null) => prev ? {
          ...prev,
          updatedAt: new Date(),
        } : null);
        
        if (!skipToast) {
          setToasts(prev => [...prev, {
            id: Date.now().toString(),
            message: '설정이 자동으로 저장되었습니다.',
            type: 'success',
            duration: 2000,
          }]);
        }
      } catch (error) {
        console.error('자동 저장 실패:', error);
        setToasts(prev => [...prev, {
          id: Date.now().toString(),
          message: '설정 저장에 실패했습니다.',
          type: 'error',
          duration: 3000,
        }]);
      } finally {
        isSavingRef.current = false;
      }
    }, 500);
  };

  // 알림 업데이트 (수정 시 비활성화하고 Firestore에 저장하여 다른 탭에 반영)
  const handleUpdateNotification = async (index: number, field: string, value: string | boolean) => {
    // 생성자 권한 체크
    if (!isFeatureCreator()) {
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '알림 수정 권한이 없습니다. 생성자만 알림을 수정할 수 있습니다.',
        type: 'error',
        duration: 3000,
      }]);
      return;
    }

    if (!user) {
      // 로그인하지 않은 경우 로컬 상태만 업데이트
      const updated = [...notificationAlerts];
      const previousValue = updated[index][field as keyof typeof updated[number]];
      
      if (previousValue === value) return;

      if (field === 'timezone' || field === 'time' || field === 'label') {
        updated[index] = { 
          ...updated[index], 
          [field]: value,
          active: false,
          isModified: true,
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      
      setNotificationAlerts(updated);
      notificationAlertsRef.current = updated;
      return;
    }

    const updated = [...notificationAlerts];
    const previousValue = updated[index][field as keyof typeof updated[number]];
    
    // 값이 실제로 변경되었는지 확인
    if (previousValue === value) return;

    // 필드가 timezone, time, label이면 해당 알림을 비활성화하고 수정 플래그 설정
    if (field === 'timezone' || field === 'time' || field === 'label') {
      updated[index] = { 
        ...updated[index], 
        [field]: value,
        active: false, // 수정 중이면 비활성화
        isModified: true, // 수정 플래그 설정
      };
      
      // 로컬 상태 먼저 업데이트
      setNotificationAlerts(updated);
      notificationAlertsRef.current = updated;
      
      // Firestore에 저장하여 다른 탭에 반영 (active: false 상태 포함)
      try {
        isSavingRef.current = true;
        
        await saveUserWorldClockSettings(user.uid, featureId, {
          selectedTimezones: selectedTimezonesRef.current,
          notifications: {
            enabled: updated.filter(a => a.active !== false).length > 0,
            alerts: updated.map(({ isModified, ...alert }) => alert), // isModified 제거 후 저장
          },
        });
        
        // 저장 완료 후 약간의 지연을 두고 플래그 해제
        setTimeout(() => {
          isSavingRef.current = false;
        }, 500);
      } catch (error) {
        console.error('알림 수정 저장 실패:', error);
        isSavingRef.current = false;
        
        setToasts(prev => [...prev, {
          id: Date.now().toString(),
          message: '알림 수정 저장에 실패했습니다.',
          type: 'error',
          duration: 3000,
        }]);
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
      setNotificationAlerts(updated);
      notificationAlertsRef.current = updated;
    }
  };

  // 특정 알림 임시저장 (비활성화 상태에서도 저장 가능)
  const handleSaveNotification = async (index: number) => {
    // 생성자 권한 체크
    if (!isFeatureCreator()) {
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '알림 저장 권한이 없습니다. 생성자만 알림을 저장할 수 있습니다.',
        type: 'error',
        duration: 3000,
      }]);
      return;
    }

    if (!user) return;

    const alertToSave = notificationAlerts[index];
    if (!alertToSave) return;

    // 현재 알림 배열 복사
    const updated = [...notificationAlerts];
    // 저장 후 수정 플래그 제거
    updated[index] = { ...updated[index], isModified: false };
    
    // 즉시 저장
    try {
      isSavingRef.current = true;
      
      await saveUserWorldClockSettings(user.uid, featureId, {
        selectedTimezones: selectedTimezonesRef.current,
        notifications: {
          enabled: updated.filter(a => a.active !== false).length > 0,
          alerts: updated.map(({ isModified, ...alert }) => alert), // isModified 제거 후 저장
        },
      });
      
      // 상태 업데이트 (수정 플래그 제거)
      setNotificationAlerts(updated);
      notificationAlertsRef.current = updated;
      
      // 저장 완료 후 약간의 지연을 두고 플래그 해제
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
      
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '알림 설정이 저장되었습니다.',
        type: 'success',
        duration: 2000,
      }]);
    } catch (error) {
      console.error('설정 저장 실패:', error);
      isSavingRef.current = false;
      
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '설정 저장에 실패했습니다.',
        type: 'error',
        duration: 3000,
      }]);
    }
  };

  // 알림 활성/비활성 토글 (켜기/끄기 모두 즉시 저장)
  const handleToggleNotification = async (index: number) => {
    // 생성자 권한 체크
    if (!isFeatureCreator()) {
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '알림 토글 권한이 없습니다. 생성자만 알림을 활성/비활성할 수 있습니다.',
        type: 'error',
        duration: 3000,
      }]);
      return;
    }

    if (!user) return;

    const updated = [...notificationAlerts];
    const newActiveState = !(updated[index].active !== false);
    
    updated[index] = { 
      ...updated[index], 
      active: newActiveState,
    };
    
    // 로컬 상태 먼저 업데이트
    setNotificationAlerts(updated);
    notificationAlertsRef.current = updated;
    
    // 즉시 저장 (켜기/끄기 모두)
    try {
      isSavingRef.current = true;
      
      await saveUserWorldClockSettings(user.uid, featureId, {
        selectedTimezones: selectedTimezonesRef.current,
        notifications: {
          enabled: updated.filter(a => a.active !== false).length > 0,
          alerts: updated,
        },
      });
      
      // 저장 완료 후 약간의 지연을 두고 플래그 해제 (실시간 리스너가 무시하도록)
      setTimeout(() => {
        isSavingRef.current = false;
      }, 500);
      
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: newActiveState 
          ? '알림이 활성화되어 저장되었습니다.' 
          : '알림이 비활성화되어 저장되었습니다.',
        type: 'success',
        duration: 2000,
      }]);
    } catch (error) {
      console.error('설정 저장 실패:', error);
      // 저장 실패 시 이전 상태로 복구
      setNotificationAlerts(notificationAlertsRef.current);
      isSavingRef.current = false;
      
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '설정 저장에 실패했습니다.',
        type: 'error',
        duration: 3000,
      }]);
    }
  };

  // 브라우저 알림 권한 요청
  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '브라우저 알림이 활성화되었습니다.',
        type: 'success',
        duration: 3000,
      }]);
    } else {
      setNotificationPermission(Notification.permission);
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '브라우저 알림 권한이 거부되었습니다.',
        type: 'warning',
        duration: 3000,
      }]);
    }
  };

  // 토스트 닫기
  const handleCloseToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <DashboardLayout>
      <PageLayout>
        <div className="space-y-6">
          <PageHeader
            title="세계시간"
            description="전 세계 주요 도시의 현재 시간을 실시간으로 확인하세요"
          />

      {/* 시간대 선택 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            시간대 선택
          </h3>
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleAddTimezone(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-64"
            disabled={!isFeatureCreator()}
          >
            <option value="">{isFeatureCreator() ? '시간대 추가...' : '생성자만 시간대를 추가할 수 있습니다'}</option>
            {TIMEZONES.filter(tz => !selectedTimezones.includes(tz.timezone)).map(tz => (
              <option key={tz.timezone} value={tz.timezone}>
                {tz.flag} {tz.label}
              </option>
            ))}
          </Select>
        </div>

        {/* 선택된 시간대 목록 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {selectedTimezones.map(timezone => {
            const tzInfo = getTimezoneInfo(timezone);
            const currentTime = currentTimes[timezone];
            
            if (!tzInfo || !currentTime) return null;

            return (
              <Card key={timezone} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{tzInfo.flag}</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {tzInfo.label}
                      </h4>
                    </div>
                  </div>
                  {selectedTimezones.length > 1 && (
                    <button
                      onClick={() => handleRemoveTimezone(timezone)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      aria-label="시간대 제거"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {currentTime ? formatTime(currentTime, timezone) : '--:--:--'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currentTime ? formatDate(currentTime, timezone) : ''}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {selectedTimezones.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            시간대를 추가해주세요
          </div>
        )}
      </Card>

      {/* 알림 설정 */}
      {user && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  알림 설정
                </h3>
                {notificationPermission === 'granted' && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full flex items-center gap-1">
                    <FiCheckCircle size={12} />
                    브라우저 알림 활성화
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                특정 시간대의 특정 시간에 알림을 받을 수 있습니다
              </p>
              {notificationPermission !== 'granted' && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  브라우저 알림 권한을 허용하면 더 편리하게 알림을 받을 수 있습니다.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {notificationPermission !== 'granted' && (
                <Button
                  variant="secondary"
                  onClick={handleRequestNotificationPermission}
                  icon={<FiBell size={18} />}
                >
                  알림 권한 요청
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                icon={<FiBell size={18} />}
              >
                {showNotificationSettings ? '숨기기' : '알림 설정'}
              </Button>
            </div>
          </div>

          {/* 알림 통계 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <StatCard
              label="전체 알림"
              value={notificationAlerts.length}
              icon={<FiBell className="w-8 h-8 text-blue-500 dark:text-blue-400 opacity-50" />}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
            />
            <StatCard
              label="활성 알림"
              value={notificationAlerts.filter(a => a.active !== false).length}
              variant="success"
              icon={<FiCheckCircle className="w-8 h-8 text-green-500 dark:text-green-400 opacity-50" />}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
            />
            <StatCard
              label="비활성 알림"
              value={notificationAlerts.filter(a => a.active === false).length}
              icon={<FiClock className="w-8 h-8 text-gray-500 dark:text-gray-400 opacity-50" />}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-gray-200 dark:border-gray-700"
            />
          </div>

          {showNotificationSettings && (
            <div className="space-y-4">
              {notificationAlerts.map((alert, index) => {
                const tzInfo = getTimezoneInfo(alert.timezone);
                const [hours, minutes] = alert.time.split(':');
                const hour24 = parseInt(hours);
                const timeDisplay = hour24 < 12 
                  ? `오전 ${hour24.toString().padStart(2, '0')}:${minutes}`
                  : `오후 ${(hour24 === 12 ? 12 : hour24 - 12).toString().padStart(2, '0')}:${minutes}`;
                
                const isActive = alert.active !== false; // undefined나 true면 활성화
                
                return (
                  <Card key={index} className={`p-4 border-2 ${isActive ? 'border-blue-200 dark:border-blue-800' : 'border-gray-300 dark:border-gray-700 opacity-60'}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        {/* 설정된 알림 정보 표시 */}
                        <div className={`flex items-center justify-between gap-2 p-2 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                          <div className="flex items-center gap-2">
                            {isActive ? (
                              <FiCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            ) : (
                              <FiClock className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            )}
                            <span className={`text-sm font-medium ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                              {isActive ? '활성' : '비활성'}: {tzInfo?.flag} {tzInfo?.label} {timeDisplay}
                              {alert.label && ` - ${alert.label}`}
                            </span>
                          </div>
                          <Toggle
                            checked={isActive}
                            onChange={() => handleToggleNotification(index)}
                            size="sm"
                            disabled={!isFeatureCreator()}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            시간대
                          </label>
                          <Select
                            value={alert.timezone}
                            onChange={(e) => handleUpdateNotification(index, 'timezone', e.target.value)}
                            disabled={!isFeatureCreator()}
                          >
                            {selectedTimezones.map(tz => {
                              const tzInfo = getTimezoneInfo(tz);
                              return (
                                <option key={tz} value={tz}>
                                  {tzInfo?.flag} {tzInfo?.label}
                                </option>
                              );
                            })}
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            알림 시간
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="time"
                              value={alert.time}
                              onChange={(e) => handleUpdateNotification(index, 'time', e.target.value)}
                              className="flex-1"
                              disabled={!isFeatureCreator()}
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                // 해당 시간대의 현재 시간 가져오기
                                const tzInfo = getTimezoneInfo(alert.timezone);
                                const now = new Date();
                                const currentTime = now.toLocaleTimeString('ko-KR', {
                                  timeZone: alert.timezone,
                                  hour12: false,
                                  hour: '2-digit',
                                  minute: '2-digit',
                                });
                                
                                // 설정한 알림 시간과 현재 시간 비교
                                const [alertHour, alertMinute] = alert.time.split(':');
                                const [currentHour, currentMinute] = currentTime.split(':');
                                
                                const alertTime = parseInt(alertHour) * 60 + parseInt(alertMinute);
                                const currentTimeMinutes = parseInt(currentHour) * 60 + parseInt(currentMinute);
                                
                                const diffMinutes = alertTime - currentTimeMinutes;
                                const diffHours = Math.floor(Math.abs(diffMinutes) / 60);
                                const diffMins = Math.abs(diffMinutes) % 60;
                                
                                let message = '';
                                if (diffMinutes === 0) {
                                  message = `현재 시간과 정확히 일치합니다! (${currentTime})`;
                                } else if (diffMinutes > 0) {
                                  message = `알림까지 ${diffHours > 0 ? `${diffHours}시간 ` : ''}${diffMins}분 남았습니다. (현재: ${currentTime})`;
                                } else {
                                  message = `알림 시간이 이미 지났습니다. (현재: ${currentTime})`;
                                }
                                
                                setToasts(prev => [...prev, {
                                  id: Date.now().toString(),
                                  message: `${tzInfo?.flag} ${tzInfo?.label}: ${message}`,
                                  type: diffMinutes === 0 ? 'success' : diffMinutes > 0 ? 'info' : 'warning',
                                  duration: 4000,
                                }]);
                              }}
                              icon={<FiRefreshCw size={16} />}
                              title="실시간 시간 체크"
                              disabled={!isFeatureCreator()}
                            >
                              체크
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                // 해당 시간대의 현재 시간 가져오기
                                const now = new Date();
                                const currentTime = now.toLocaleTimeString('ko-KR', {
                                  timeZone: alert.timezone,
                                  hour12: false,
                                  hour: '2-digit',
                                  minute: '2-digit',
                                });
                                
                                // 현재 시간으로 설정
                                handleUpdateNotification(index, 'time', currentTime);
                                
                                const tzInfo = getTimezoneInfo(alert.timezone);
                                setToasts(prev => [...prev, {
                                  id: Date.now().toString(),
                                  message: `${tzInfo?.flag} ${tzInfo?.label}의 현재 시간(${currentTime})으로 설정되었습니다.`,
                                  type: 'success',
                                  duration: 2000,
                                }]);
                              }}
                              icon={<FiClock size={16} />}
                              title="현재 시간으로 설정"
                              disabled={!isFeatureCreator()}
                            >
                              현재
                            </Button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            선택한 시간대의 이 시간에 알림이 옵니다
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            알림 라벨 (선택사항)
                          </label>
                          <Input
                            type="text"
                            placeholder="예: 미국 업무 시작"
                            value={alert.label || ''}
                            onChange={(e) => handleUpdateNotification(index, 'label', e.target.value)}
                            disabled={!isFeatureCreator()}
                          />
                        </div>
                        
                        {/* 임시저장 버튼 */}
                        <div className="pt-2">
                          <Button
                            variant={alert.isModified ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => handleSaveNotification(index)}
                            icon={<FiSave size={16} />}
                            className={`w-full ${alert.isModified ? 'animate-pulse' : ''}`}
                            disabled={!isFeatureCreator()}
                          >
                            {alert.isModified ? '임시저장 (수정됨)' : '임시저장'}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {isFeatureCreator() && (
                          <button
                            onClick={() => handleRemoveNotification(index)}
                            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-400"
                            aria-label="알림 제거"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}

              {notificationAlerts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  알림이 없습니다. 알림을 추가해보세요.
                </div>
              )}

              <Button
                variant="secondary"
                onClick={handleAddNotification}
                icon={<FiPlus size={18} />}
                disabled={selectedTimezones.length === 0 || !isFeatureCreator()}
              >
                알림 추가
              </Button>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  시간대, 알림시간, 알림라벨을 수정한 후 "임시저장" 버튼을 눌러 저장하세요. 알림을 활성화하면 자동으로 저장됩니다.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {!user && (
        <Card className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            알림 설정을 사용하려면 로그인이 필요합니다.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/login'}
          >
            로그인하기
          </Button>
        </Card>
      )}

      {/* 토스트 알림 컨테이너 */}
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
        </div>
      </PageLayout>
    </DashboardLayout>
  );
}

