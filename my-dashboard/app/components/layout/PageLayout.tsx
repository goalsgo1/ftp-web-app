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
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300`}>
        <div className={`${isPreviewVisible ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {children}
        </div>
        {isPreviewVisible && (
          <div className="hidden lg:block lg:col-span-1 relative">
            <PhonePreview onClose={() => setIsPreviewVisible(false)} />
          </div>
        )}
      </div>
      {!isPreviewVisible && (
        <button
          onClick={() => setIsPreviewVisible(true)}
          className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-[100] 
                   bg-blue-600 hover:bg-blue-700 text-white 
                   p-4 rounded-l-lg shadow-2xl
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

