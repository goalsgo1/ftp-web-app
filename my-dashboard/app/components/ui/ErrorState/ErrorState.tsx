'use client';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * 에러 상태를 표시하는 컴포넌트
 * 에러가 발생했을 때 사용자에게 에러 메시지를 표시합니다.
 */
export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
      <div className="flex items-center justify-between">
        <p>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 text-sm font-medium underline hover:no-underline"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
};

