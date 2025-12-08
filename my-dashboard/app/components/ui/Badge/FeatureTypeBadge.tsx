'use client';

import { Badge } from './Badge';
import type { Feature } from '@/lib/firebase/features';

export interface FeatureTypeBadgeProps {
  feature: Feature;
}

/**
 * 기능 타입을 표시하는 Badge 컴포넌트
 * 내부 기능인지 외부 URL인지 구분하여 표시합니다.
 */
export const FeatureTypeBadge = ({ feature }: FeatureTypeBadgeProps) => {
  if (feature.url?.startsWith('/features/')) {
    return (
      <Badge 
        variant="default" 
        className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
      >
        내부 기능
      </Badge>
    );
  }
  
  if (feature.url) {
    return (
      <Badge 
        variant="default" 
        className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700"
      >
        외부 URL
      </Badge>
    );
  }
  
  return null;
};

