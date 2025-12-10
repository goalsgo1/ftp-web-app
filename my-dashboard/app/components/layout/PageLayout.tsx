'use client';

import { ReactNode, useState, useEffect } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { PhonePreview } from '../preview';

interface PageLayoutProps {
  children: ReactNode;
  withPreview?: boolean;
}

export const PageLayout = ({ 
  children, 
  withPreview = true 
}: PageLayoutProps) => {
  // localStorage에서 저장된 상태를 불러오거나 기본값 false 사용
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mobilePreviewVisible');
      return saved === 'true';
    }
    return false;
  });

  // 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mobilePreviewVisible', String(isPreviewVisible));
    }
  }, [isPreviewVisible]);

  if (!withPreview) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative">
      <div className={`flex gap-8 transition-all duration-300`}>
        <div className={`flex-1 min-w-0 ${isPreviewVisible ? '' : 'w-full'}`}>
          {children}
        </div>
        {isPreviewVisible && (
          <div className="hidden xl:block flex-shrink-0 relative">
            <PhonePreview onClose={() => setIsPreviewVisible(false)} />
          </div>
        )}
      </div>
      {!isPreviewVisible && (
        <button
          onClick={() => setIsPreviewVisible(true)}
          className="hidden xl:flex fixed right-0 top-28 z-[100] 
                   bg-blue-600 hover:bg-blue-700 text-white 
                   px-0.5 py-4 rounded-l-lg shadow-2xl
                   transition-all hover:scale-110 hover:right-2
                   items-center justify-center
                   border-2 border-blue-400"
          aria-label="프리뷰 열기"
          title="프리뷰 보기"
        >
          <FiChevronLeft className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

