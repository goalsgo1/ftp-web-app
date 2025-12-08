'use client';

import { Button } from '../Button';

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

/**
 * 빈 목록 상태를 표시하는 컴포넌트
 * 데이터가 없을 때 사용자에게 안내 메시지를 표시합니다.
 */
export const EmptyState = ({ message, actionLabel, onAction, icon }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

