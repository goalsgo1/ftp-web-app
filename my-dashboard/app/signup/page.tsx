'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUserPlus, FiCheckCircle, FiArrowRight, FiHome } from 'react-icons/fi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { signUp, onAuthChange } from '../lib/firebase';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // 비밀번호 강도 체크
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(null);
      return;
    }

    if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (password.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [password]);

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'strong':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return '약함';
      case 'medium':
        return '보통';
      case 'strong':
        return '강함';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인 검증
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 최소 길이 검증
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, displayName || undefined);
      // 회원가입 성공 시 대시보드로 이동
      router.push('/');
    } catch (err: any) {
      // Firebase 에러 메시지 처리
      let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = '이메일/비밀번호 로그인이 활성화되지 않았습니다.';
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            푸시알림 통합 관리 플랫폼
          </p>
          <Button
            variant="secondary"
            onClick={() => router.push('/')}
            icon={<FiHome size={16} />}
            size="sm"
          >
            홈으로 이동
          </Button>
        </div>

        {/* 회원가입 카드 */}
        <Card>
          <PageHeader
            title="회원가입"
            description="새 계정을 만들어 시작하세요"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 이름 입력 (선택사항) */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                이름 (선택사항)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUserPlus className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="홍길동"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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
                  minLength={6}
                  className="pl-10"
                />
              </div>
              {password && (
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-xs ${getPasswordStrengthColor()}`}>
                    비밀번호 강도: {getPasswordStrengthText()}
                  </span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                최소 6자 이상 입력해주세요
              </p>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                비밀번호 확인
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  비밀번호가 일치하지 않습니다
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <FiCheckCircle size={12} />
                  비밀번호가 일치합니다
                </p>
              )}
            </div>

            {/* 회원가입 버튼 */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading || password !== confirmPassword || password.length < 6}
              icon={isLoading ? undefined : <FiUserPlus size={18} />}
            >
              {isLoading ? '회원가입 중...' : '회원가입'}
            </Button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

