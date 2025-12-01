'use client';

import { ReactNode } from 'react';
import { Card } from '../Card';
import { typography } from '@/constants/typography';

interface StatCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'text-gray-900 dark:text-white',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
};

export const StatCard = ({ 
  label, 
  value,
  variant = 'default',
  icon,
  className = '' 
}: StatCardProps) => {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {label}
          </div>
          <div className={`${typography.statNumber.className} ${variantStyles[variant]}`}>
            {value}
          </div>
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

