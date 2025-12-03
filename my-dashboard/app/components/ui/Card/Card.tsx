'use client';

import { ReactNode, forwardRef } from 'react';
import { cardPadding } from '@/styles/variants';
import { CardPadding } from '@/types/ui.types';
import { BaseComponentProps } from '@/types/ui.types';

interface CardProps extends BaseComponentProps {
  hover?: boolean;
  padding?: CardPadding;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  hover = false,
  padding = 'md',
  className = '' 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        bg-white dark:bg-gray-800
        rounded-lg shadow-sm
        border border-gray-200 dark:border-gray-700
        ${cardPadding[padding]}
        ${hover ? 'hover:shadow-md transition-shadow duration-150' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

