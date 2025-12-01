'use client';

import { useState } from 'react';
import { FiBell, FiBellOff, FiClock, FiSave, FiX } from 'react-icons/fi';
import { PageHeader } from '../../ui/PageHeader';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Toggle } from '../../ui/Toggle';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

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
    </div>
  );
}

