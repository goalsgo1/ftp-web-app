'use client';

import { SelectHTMLAttributes } from 'react';
import { inputSizes } from '@/styles/variants';
import { InputSize } from '@/types/ui.types';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  size?: InputSize;
  error?: boolean;
}

export const Select = ({ 
  size = 'md',
  error = false,
  className = '',
  children,
  ...props 
}: SelectProps) => {
  return (
    <select
      className={`
        ${inputSizes[size]}
        border rounded-lg
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-white
        ${error 
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
          : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        }
        transition-colors
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
};

