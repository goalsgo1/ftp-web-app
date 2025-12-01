'use client';

import { ReactNode } from 'react';
import { typography } from '@/constants/typography';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  action,
  className = '' 
}: PageHeaderProps) => {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h2 className={typography.pageTitle.className}>
          {title}
        </h2>
        <p className={typography.pageDescription.className}>
          {description}
        </p>
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

