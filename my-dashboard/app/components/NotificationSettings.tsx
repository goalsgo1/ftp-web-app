'use client';

import { useState } from 'react';
import { FiBell, FiBellOff, FiClock, FiSave } from 'react-icons/fi';

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
  const [editingRule, setEditingRule] = useState<string | null>(null);

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
    setEditingRule(ruleId);
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
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          알림 설정
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          기능별 알림을 세밀하게 제어하세요
        </p>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {rule.featureName}
                </h3>
                <button
                  onClick={() => toggleFeature(rule.id)}
                  className={`
                    flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                    transition-colors
                    ${
                      rule.enabled
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {rule.enabled ? <FiBell size={16} /> : <FiBellOff size={16} />}
                  {rule.enabled ? '활성화' : '비활성화'}
                </button>
              </div>
            </div>

            {rule.enabled && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FiClock size={16} />
                    시간대별 규칙
                  </h4>
                  <button
                    onClick={() => addTimeRule(rule.id)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    규칙 추가
                  </button>
                </div>

                <div className="space-y-2">
                  {rule.timeRules.map((timeRule, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <select
                        value={timeRule.type}
                        onChange={(e) => updateTimeRule(rule.id, index, 'type', e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="allow">이 시간대만 받기</option>
                        <option value="block">이 시간대 차단</option>
                      </select>
                      <input
                        type="time"
                        value={timeRule.startTime}
                        onChange={(e) => updateTimeRule(rule.id, index, 'startTime', e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      <span className="text-gray-500 dark:text-gray-400">~</span>
                      <input
                        type="time"
                        value={timeRule.endTime}
                        onChange={(e) => updateTimeRule(rule.id, index, 'endTime', e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={() => removeTimeRule(rule.id, index)}
                        className="px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 transition-colors font-medium">
          <FiSave size={20} />
          설정 저장
        </button>
      </div>
    </div>
  );
}

