'use client';

import { FiBell, FiCheckCircle, FiClock } from 'react-icons/fi';

export interface NotificationStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

/**
 * 알림 통계를 표시하는 컴포넌트
 * 세계시간 기능의 알림 통계를 시각적으로 표시합니다.
 */
export const NotificationStats = ({ stats }: NotificationStatsProps) => {
  return (
    <div className="flex items-center gap-3 text-xs bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
      <span className="flex items-center gap-1.5 cursor-help" title="전체 알림">
        <FiBell size={14} className="text-blue-500" />
        <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.total}</span>
      </span>
      <span className="flex items-center gap-1.5 cursor-help" title="활성 알림">
        <FiCheckCircle size={14} className="text-green-500" />
        <span className="font-semibold text-green-600 dark:text-green-400">{stats.active}</span>
      </span>
      <span className="flex items-center gap-1.5 cursor-help" title="비활성 알림">
        <FiClock size={14} className="text-gray-500" />
        <span className="font-semibold text-gray-600 dark:text-gray-400">{stats.inactive}</span>
      </span>
    </div>
  );
};

