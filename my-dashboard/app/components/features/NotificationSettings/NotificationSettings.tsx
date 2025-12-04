'use client';

import { useState, useEffect } from 'react';
import { FiBell, FiBellOff, FiClock, FiSave, FiX, FiInfo } from 'react-icons/fi';
import { PageHeader } from '../../ui/PageHeader';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Toggle } from '../../ui/Toggle';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { onAuthChange, getCurrentUser } from '@/lib/firebase';
import { getUserSettings, saveUserSettings, subscribeUserSettings } from '@/lib/firebase/userSettings';
import type { User } from 'firebase/auth';
import { ToastContainer, type Toast } from '../../ui/Toast';

interface NotificationRule {
  id: string;
  featureId: string;
  featureName: string;
  enabled: boolean;
  timeRules: {
    type: 'allow' | 'block';
    startTime: string;
    endTime: string;
  }[];
}

const mockRules: NotificationRule[] = [
  {
    id: '1',
    featureId: '1',
    featureName: '날씨 알림',
    enabled: true,
    timeRules: [
      { type: 'block', startTime: '22:00', endTime: '08:00' },
    ],
  },
  {
    id: '2',
    featureId: '2',
    featureName: '주식 모니터링',
    enabled: false,
    timeRules: [
      { type: 'allow', startTime: '09:00', endTime: '18:00' },
    ],
  },
];

export default function NotificationSettings() {
  const [rules, setRules] = useState<NotificationRule[]>(mockRules);
  const [user, setUser] = useState<User | null>(null);
  const [toastDuration, setToastDuration] = useState<number>(5000); // 기본값 5초
  const [toastDurationInput, setToastDurationInput] = useState<string>('5'); // 입력 중인 값 (문자열)
  const [toastAutoCloseEnabled, setToastAutoCloseEnabled] = useState<boolean>(true); // 자동 닫기 활성화 여부
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 로그인 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserSettings(currentUser.uid);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 사용자 설정 로드
  const loadUserSettings = async (userId: string) => {
    try {
      setIsLoading(true);
      const settings = await getUserSettings(userId);
      if (settings?.toastDuration) {
        setToastDuration(settings.toastDuration);
        setToastDurationInput(Math.round(settings.toastDuration / 1000).toString());
      } else {
        setToastDurationInput('5');
      }
      if (settings?.toastAutoCloseEnabled !== undefined) {
        setToastAutoCloseEnabled(settings.toastAutoCloseEnabled);
      } else {
        setToastAutoCloseEnabled(true);
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
      setToastDurationInput('5');
      setToastAutoCloseEnabled(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 실시간 설정 동기화
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeUserSettings(user.uid, (settings) => {
      if (settings?.toastDuration) {
        setToastDuration(settings.toastDuration);
        setToastDurationInput(Math.round(settings.toastDuration / 1000).toString());
      } else {
        setToastDurationInput('5');
      }
      if (settings?.toastAutoCloseEnabled !== undefined) {
        setToastAutoCloseEnabled(settings.toastAutoCloseEnabled);
      } else {
        setToastAutoCloseEnabled(true);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Toast duration 입력값 검증 및 적용
  const validateAndSetToastDuration = () => {
    const inputValue = toastDurationInput.trim();
    if (inputValue === '') {
      // 빈 값이면 기본값 5초로 설정
      setToastDurationInput('5');
      setToastDuration(5000);
      return 5000;
    }
    
    const seconds = parseInt(inputValue);
    if (isNaN(seconds) || seconds < 1) {
      // 유효하지 않은 값이면 기본값 5초로 설정
      setToastDurationInput('5');
      setToastDuration(5000);
      return 5000;
    }
    
    const validSeconds = Math.max(1, Math.min(60, seconds));
    const duration = validSeconds * 1000;
    setToastDuration(duration);
    setToastDurationInput(validSeconds.toString());
    return duration;
  };

  // Toast duration 저장
  const handleSaveToastDuration = async () => {
    if (!user) {
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '로그인이 필요합니다.',
        type: 'error',
        // duration을 지정하지 않으면 사용자 설정 사용
      }]);
      return;
    }

    try {
      const duration = validateAndSetToastDuration();
      await saveUserSettings(user.uid, { 
        toastDuration: duration,
        toastAutoCloseEnabled: toastAutoCloseEnabled
      });
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: toastAutoCloseEnabled 
          ? 'Toast 자동 닫기 시간이 저장되었습니다.'
          : 'Toast 자동 닫기가 비활성화되었습니다. 수동으로만 제거할 수 있습니다.',
        type: 'success',
        // duration을 지정하지 않으면 사용자 설정 사용
      }]);
    } catch (error) {
      console.error('설정 저장 실패:', error);
      setToasts(prev => [...prev, {
        id: Date.now().toString(),
        message: '설정 저장에 실패했습니다.',
        type: 'error',
        // duration을 지정하지 않으면 사용자 설정 사용
      }]);
    }
  };

  const handleCloseToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toggleFeature = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const addTimeRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? { 
            ...rule, 
            timeRules: [...rule.timeRules, { type: 'block', startTime: '00:00', endTime: '23:59' }]
          }
        : rule
    ));
  };

  const updateTimeRule = (ruleId: string, index: number, field: string, value: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? {
            ...rule,
            timeRules: rule.timeRules.map((tr, i) => 
              i === index ? { ...tr, [field]: value } : tr
            )
          }
        : rule
    ));
  };

  const removeTimeRule = (ruleId: string, index: number) => {
    setRules(rules.map(rule => 
      rule.id === ruleId 
        ? {
            ...rule,
            timeRules: rule.timeRules.filter((_, i) => i !== index)
          }
        : rule
    ));
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="알림 설정"
        description="기능별 알림을 세밀하게 제어하세요"
      />

      {/* Toast 자동 닫기 시간 설정 */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiInfo size={18} className="text-blue-500 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Toast 자동 닫기 시간
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                알림 메시지가 자동으로 사라지는 시간 (기본값: 5초)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={toastAutoCloseEnabled}
                onChange={(e) => {
                  setToastAutoCloseEnabled(e.target.checked);
                }}
                disabled={!user || isLoading}
                className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:focus:ring-blue-600 dark:ring-offset-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors checked:bg-blue-600 checked:border-blue-600 dark:checked:bg-blue-600 dark:checked:border-blue-600"
              />
              <Input
                type="text"
                inputMode="numeric"
                value={toastDurationInput}
                onChange={(e) => {
                  // 숫자만 입력 가능하도록 필터링
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setToastDurationInput(value);
                }}
                onBlur={() => {
                  // 포커스가 벗어날 때 검증 및 적용
                  validateAndSetToastDuration();
                }}
                className="w-20"
                disabled={!user || isLoading || !toastAutoCloseEnabled}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">초</span>
            </div>
            <Button
              variant="primary"
              onClick={handleSaveToastDuration}
              disabled={!user || isLoading}
              icon={<FiSave size={18} />}
              size="sm"
            >
              저장
            </Button>
          </div>
        </div>
        {!user && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            로그인하면 설정을 저장할 수 있습니다.
          </p>
        )}
      </Card>

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {rule.featureName}
                </h3>
                <Button
                  variant={rule.enabled ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => toggleFeature(rule.id)}
                  icon={rule.enabled ? <FiBell size={16} /> : <FiBellOff size={16} />}
                >
                  {rule.enabled ? '활성화' : '비활성화'}
                </Button>
              </div>
            </div>

            {rule.enabled && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FiClock size={16} />
                    시간대별 규칙
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addTimeRule(rule.id)}
                  >
                    규칙 추가
                  </Button>
                </div>

                <div className="space-y-2">
                  {rule.timeRules.map((timeRule, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <Select
                        size="sm"
                        value={timeRule.type}
                        onChange={(e) => updateTimeRule(rule.id, index, 'type', e.target.value)}
                      >
                        <option value="allow">이 시간대만 받기</option>
                        <option value="block">이 시간대 차단</option>
                      </Select>
                      <Input
                        type="time"
                        size="sm"
                        value={timeRule.startTime}
                        onChange={(e) => updateTimeRule(rule.id, index, 'startTime', e.target.value)}
                      />
                      <span className="text-gray-500 dark:text-gray-400">~</span>
                      <Input
                        type="time"
                        size="sm"
                        value={timeRule.endTime}
                        onChange={(e) => updateTimeRule(rule.id, index, 'endTime', e.target.value)}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeTimeRule(rule.id, index)}
                        icon={<FiX size={14} />}
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          icon={<FiSave size={20} />}
        >
          설정 저장
        </Button>
      </div>

      {/* 토스트 알림 컨테이너 */}
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
    </div>
  );
}

