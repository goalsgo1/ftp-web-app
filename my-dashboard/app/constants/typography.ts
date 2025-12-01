/**
 * Typography Constants
 * 텍스트 스타일을 중앙에서 관리
 */

export const typography = {
  // 페이지 제목
  pageTitle: {
    className: 'text-3xl font-bold text-gray-900 dark:text-white mb-2',
    fontSize: '1.875rem', // 30px
    fontWeight: 700,
    lineHeight: 1.2,
  },
  // 페이지 설명
  pageDescription: {
    className: 'text-base text-gray-600 dark:text-gray-400',
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  // 카드 제목
  cardTitle: {
    className: 'text-xl font-semibold text-gray-900 dark:text-white',
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: 1.3,
  },
  // 카드 설명
  cardDescription: {
    className: 'text-sm text-gray-600 dark:text-gray-400',
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  // 본문
  body: {
    className: 'text-base text-gray-700 dark:text-gray-300',
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  // 작은 텍스트
  small: {
    className: 'text-xs text-gray-500 dark:text-gray-400',
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: 1.4,
  },
  // 통계 숫자
  statNumber: {
    className: 'text-3xl font-bold',
    fontSize: '1.875rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
} as const;

export type Typography = typeof typography;

