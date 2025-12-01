'use client';

import { InputHTMLAttributes } from 'react';
import { inputSizes } from '@/styles/variants';
import { InputSize } from '@/types/ui.types';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: InputSize;
  error?: boolean;
}

export const Input = ({ 
  size = 'md',
  error = false,
  className = '',
  ...props 
}: InputProps) => {
  return (
    <input
      className={`
        w-full
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
    />
  );
};

