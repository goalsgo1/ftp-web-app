/**
 * UI Components 공통 타입 정의
 */

import { ReactNode } from 'react';

// 버튼 variant
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

// 카드 패딩 크기
export type CardPadding = 'sm' | 'md' | 'lg';

// 뱃지 variant
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

// 입력 필드 크기
export type InputSize = 'sm' | 'md' | 'lg';

// 토글 크기
export type ToggleSize = 'sm' | 'md' | 'lg';

// 공통 props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// 아이콘 props
export interface IconProps {
  size?: number;
  className?: string;
}

// 상태 props
export interface StatusProps {
  active?: boolean;
  disabled?: boolean;
}

