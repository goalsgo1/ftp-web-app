/**
 * Design Tokens
 * 실제 사용되는 디자인 토큰 값들
 */

import { theme } from './theme';

// 색상 토큰
export const colors = {
  // Primary
  primary: theme.colors.primary[600],
  primaryHover: theme.colors.primary[700],
  primaryLight: theme.colors.primary[100],
  primaryDark: theme.colors.primary[800],
  
  // Background
  bgPrimary: 'bg-white dark:bg-gray-800',
  bgSecondary: 'bg-gray-50 dark:bg-gray-900',
  bgTertiary: 'bg-gray-100 dark:bg-gray-700',
  
  // Text
  textPrimary: 'text-gray-900 dark:text-white',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textTertiary: 'text-gray-500 dark:text-gray-500',
  
  // Border
  borderPrimary: 'border-gray-200 dark:border-gray-700',
  borderSecondary: 'border-gray-300 dark:border-gray-600',
  
  // Status
  success: theme.colors.green[600],
  successLight: theme.colors.green[100],
  warning: theme.colors.yellow[600],
  warningLight: theme.colors.yellow[100],
  error: theme.colors.red[600],
  errorLight: theme.colors.red[100],
  info: theme.colors.primary[600],
  infoLight: theme.colors.primary[100],
} as const;

// 간격 토큰
export const spacing = {
  xs: theme.spacing.xs,
  sm: theme.spacing.sm,
  md: theme.spacing.md,
  lg: theme.spacing.lg,
  xl: theme.spacing.xl,
} as const;

// 그림자 토큰
export const shadows = {
  sm: theme.shadows.sm,
  md: theme.shadows.md,
  lg: theme.shadows.lg,
} as const;

// Border radius 토큰
export const borderRadius = {
  sm: theme.borderRadius.sm,
  md: theme.borderRadius.md,
  lg: theme.borderRadius.lg,
  full: theme.borderRadius.full,
} as const;

