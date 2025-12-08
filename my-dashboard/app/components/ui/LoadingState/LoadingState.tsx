'use client';

export interface LoadingStateProps {
  message?: string;
}

/**
 * 로딩 상태를 표시하는 컴포넌트
 * 데이터를 불러오는 중일 때 사용합니다.
 */
export const LoadingState = ({ message = '로딩 중...' }: LoadingStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
};

