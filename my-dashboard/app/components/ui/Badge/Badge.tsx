'use client';

import { ReactNode } from 'react';
import { badgeVariants } from '@/styles/variants';
import { BadgeVariant } from '@/types/ui.types';
import { BaseComponentProps } from '@/types/ui.types';

interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export const Badge = ({ 
  variant = 'default',
  children,
  className = '' 
}: BadgeProps) => {
  return (
    <span
      className={`
        inline-block px-2 py-1 text-xs font-medium rounded-full
        ${badgeVariants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

