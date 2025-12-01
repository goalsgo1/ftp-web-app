'use client';

import { ReactNode } from 'react';
import { BaseComponentProps } from '@/types/ui.types';

interface CardHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({ 
  title, 
  subtitle,
  action,
  children,
  className = '' 
}: CardHeaderProps) => {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      {title || subtitle || children ? (
        <div className="flex-1">
          {title && (
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      ) : null}
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
};

