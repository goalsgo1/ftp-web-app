'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiLogIn, FiSmartphone, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { signIn, onAuthChange } from '../lib/firebase';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      // 로그인 성공 시 대시보드로 이동 (onAuthChange에서 처리되지만 명시적으로도 처리)
      router.push('/');
    } catch (err: any) {
      // Firebase 에러 메시지 처리
      let errorMessage = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = '등록되지 않은 이메일입니다.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = '비밀번호가 올바르지 않습니다.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = '비활성화된 계정입니다.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고/제목 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            PushHub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            푸시알림 통합 관리 플랫폼
          </p>
        </div>

        {/* 로그인 카드 */}
        <Card>
          <PageHeader
            title="로그인"
            description="계정에 로그인하여 시작하세요"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* 비밀번호 찾기 */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
              icon={isLoading ? undefined : <FiLogIn size={18} />}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              계정이 없으신가요?{' '}
              <Link
                href="/signup"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>
        </Card>

        {/* 앱 설치 유도 카드 */}
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <FiSmartphone className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                앱을 설치하시면 더 편리하게 로그인하실 수 있습니다
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                PushHub 앱에 한 번만 로그인해두시면, 웹에서 세션이 만료되어도 
                앱의 로그인 상태를 활용하여 자동으로 로그인됩니다. 
                번거로운 재로그인 없이 바로 시작하세요.
              </p>
              
              {/* 장점 리스트 */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <FiCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>앱에 로그인해두면 웹에서 자동 로그인</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <FiCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>지문 인증으로 더 빠르고 안전하게</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <FiCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>모든 웹 기능의 푸시알림을 한 곳에서 관리</span>
                </div>
              </div>

              {/* 앱 다운로드 버튼 */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    // TODO: 앱스토어 링크 연결
                    window.open('https://apps.apple.com/app/pushhub', '_blank');
                  }}
                  className="flex-1"
                  icon={<FiArrowRight size={16} />}
                >
                  iOS 앱 다운로드
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    // TODO: 플레이스토어 링크 연결
                    window.open('https://play.google.com/store/apps/details?id=com.pushhub', '_blank');
                  }}
                  className="flex-1"
                  icon={<FiArrowRight size={16} />}
                >
                  Android 앱 다운로드
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

