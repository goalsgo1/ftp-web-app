'use client';

import { ReactNode, useState } from 'react';
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
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

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

