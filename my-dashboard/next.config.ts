import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Mode 활성화 - 개발 중 잠재적 문제 감지
  reactStrictMode: true,

  // 보안 헤더 설정
  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: '/:path*',
        headers: [
          // HSTS (HTTP Strict Transport Security) - HTTPS 강제
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // XSS 방지 - MIME 타입 스니핑 방지
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // 클릭재킹 방지 - iframe 임베드 차단
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // 브라우저 XSS 필터 활성화
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer 정책 - 외부 사이트로 정보 유출 방지
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // 권한 정책 - 불필요한 브라우저 기능 비활성화
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy (CSP) - XSS 공격 방지
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js 개발 모드에서 필요
              "style-src 'self' 'unsafe-inline'", // Tailwind CSS 및 인라인 스타일
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // 프로덕션 빌드 최적화
  poweredByHeader: false, // X-Powered-By 헤더 제거 (서버 정보 노출 방지)
  
  // 컴파일러 옵션
  compiler: {
    // 프로덕션에서 console.log 제거 (선택사항)
    // removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
