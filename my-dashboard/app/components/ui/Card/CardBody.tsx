'use client';

import { ReactNode } from 'react';
import { BaseComponentProps } from '@/types/ui.types';

interface CardBodyProps extends BaseComponentProps {
  padding?: boolean;
}

export const CardBody = ({ 
  children, 
  padding = true,
  className = '' 
}: CardBodyProps) => {
  return (
    <div className={`${padding ? '' : '-mx-6'} ${className}`}>
      {children}
    </div>
  );
};

