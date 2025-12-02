'use client';

import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiBell, FiSettings, FiClock, FiExternalLink, FiX } from 'react-icons/fi';

interface Slide {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
}

interface PhonePreviewProps {
  onClose?: () => void;
}

export default function PhonePreview({ onClose }: PhonePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 슬라이드 0: 앱 로그인 화면
  const Slide0 = () => (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PushHub</h1>
          <p className="text-blue-100 text-sm">푸시알림 통합 관리</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                placeholder="user@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="user@example.com"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="••••••••"
                readOnly
              />
            </div>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
              로그인
            </button>
            <div className="flex items-center gap-2 justify-center pt-2">
              <div className="w-8 h-8 border-2 border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs">👆</span>
              </div>
              <span className="text-xs text-gray-500">지문 인증</span>
            </div>
          </div>
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-blue-100 text-xs mt-6">
          앱에 로그인하면 웹에서도<br />간편하게 로그인할 수 있습니다
        </p>
      </div>
    </div>
  );

  // 슬라이드 1: 앱 대시보드 화면 (로그인 후)
  const Slide1 = () => (
    <div className="bg-gray-50 h-full flex flex-col">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">PushHub</h2>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs">👤</span>
          </div>
          <span className="text-xs text-gray-600">로그인됨</span>
        </div>
      </div>
      
      {/* 기능 목록 */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">날씨 알림</h3>
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          </div>
          <p className="text-sm text-gray-600">구독 중</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">주식 모니터링</h3>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          </div>
          <p className="text-sm text-gray-600">알림 OFF</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">할일 관리</h3>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          </div>
          <p className="text-sm text-gray-600">미구독</p>
        </div>
      </div>
      
      {/* 하단 네비게이션 */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex justify-around">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-blue-600 rounded"></div>
          <span className="text-xs text-blue-600 mt-1">홈</span>
        </div>
        <div className="flex flex-col items-center">
          <FiBell className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400 mt-1">알림</span>
        </div>
        <div className="flex flex-col items-center">
          <FiSettings className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400 mt-1">설정</span>
        </div>
      </div>
    </div>
  );

  // 슬라이드 2: 푸시알림 표시
  const Slide2 = () => (
    <div className="bg-gray-50 h-full flex flex-col">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">PushHub</h2>
      </div>
      
      {/* 푸시알림 표시 영역 */}
      <div className="p-4 space-y-3">
        {/* 푸시알림 카드 */}
        <div className="bg-white rounded-lg p-4 shadow-lg border-l-4 border-blue-500 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiBell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">날씨 알림</h3>
                <span className="text-xs text-gray-500">방금 전</span>
              </div>
              <p className="text-sm text-gray-700 font-medium mb-1">비 예보</p>
              <p className="text-xs text-gray-600">오후 3시부터 비가 예상됩니다. 우산을 챙기세요.</p>
            </div>
          </div>
        </div>
        
        {/* 기존 알림들 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 opacity-60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiBell className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">주식 모니터링</h3>
                <span className="text-xs text-gray-500">2시간 전</span>
              </div>
              <p className="text-sm text-gray-700 font-medium mb-1">가격 변동</p>
              <p className="text-xs text-gray-600">삼성전자 주가가 5% 상승했습니다.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 하단 네비게이션 */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex justify-around mt-auto">
        <div className="flex flex-col items-center">
          <div className="w-6 h-6 bg-blue-600 rounded"></div>
          <span className="text-xs text-blue-600 mt-1">홈</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative">
            <FiBell className="w-6 h-6 text-blue-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <span className="text-xs text-blue-600 mt-1">알림</span>
        </div>
        <div className="flex flex-col items-center">
          <FiSettings className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400 mt-1">설정</span>
        </div>
      </div>
    </div>
  );

  // 슬라이드 3: 시간 설정 화면
  const Slide3 = () => (
    <div className="bg-gray-50 h-full flex flex-col">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <button className="text-gray-600">
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 flex-1">알림 설정</h2>
      </div>
      
      {/* 설정 내용 */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">날씨 알림</h3>
              <p className="text-sm text-gray-600">알림 활성화</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">시간대 차단</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">시작 시간</span>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-gray-300">
                  <span className="text-sm font-medium text-gray-900">22:00</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">종료 시간</span>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-gray-300">
                  <span className="text-sm font-medium text-gray-900">08:00</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                이 시간대에는 알림을 받지 않습니다
              </div>
            </div>
            
            <button className="w-full py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
              + 규칙 추가
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">주식 모니터링</h3>
              <p className="text-sm text-gray-600">알림 비활성화</p>
            </div>
            <div className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 저장 버튼 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
          설정 저장
        </button>
      </div>
    </div>
  );

  // 슬라이드 4: 웹에서 로그인 버튼 클릭 → 앱 연동
  const Slide4 = () => (
    <div className="bg-gray-50 h-full flex flex-col overflow-hidden">
      {/* 웹 화면 (상단) */}
      <div className="bg-white border-b-2 border-blue-500 p-3 flex-shrink-0">
        <div className="bg-gray-100 rounded-lg p-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600">
              pushhub.example.com
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <p className="text-xs font-medium text-yellow-900">세션이 만료되었습니다</p>
          </div>
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2">
            <span>📱</span>
            앱으로 로그인하기
          </button>
        </div>
      </div>

      {/* 화살표 애니메이션 */}
      <div className="flex justify-center py-3 flex-shrink-0">
        <div className="animate-bounce">
          <FiChevronDown className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* 앱 화면 (하단) */}
      <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 p-4 overflow-y-auto min-h-0">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">로그인 확인</h3>
            <p className="text-xs text-gray-600">앱에 이미 로그인되어 있습니다</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">user@example.com</p>
                <p className="text-xs text-gray-500">로그인 중</p>
              </div>
              <span className="text-xs text-green-600">✓</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-blue-900 font-medium mb-1">웹으로 인증 토큰 전송 중...</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <span className="text-xs text-blue-600">70%</span>
            </div>
          </div>

          <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-medium">
            웹으로 돌아가기
          </button>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs text-blue-100">
            앱과 웹이 연결되어 있어<br />
            한 번의 로그인으로 모든 기능을 사용할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );

  // 슬라이드 5: 웹으로 이동
  const Slide5 = () => (
    <div className="bg-gray-50 h-full flex flex-col overflow-hidden">
      {/* 푸시알림 클릭 시뮬레이션 */}
      <div className="p-3 flex-shrink-0">
        <div className="bg-white rounded-lg p-3 shadow-lg border-l-4 border-blue-500 mb-2">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiBell className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 text-xs">날씨 알림</h3>
                <span className="text-xs text-gray-500">방금 전</span>
              </div>
              <p className="text-xs text-gray-700 font-medium mb-1">비 예보</p>
              <p className="text-xs text-gray-600 truncate">오후 3시부터 비가 예상됩니다.</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <FiExternalLink className="w-3 h-3" />
              <span>탭하여 웹에서 보기</span>
            </div>
          </div>
        </div>
        
        {/* 화살표 */}
        <div className="flex justify-center py-2">
          <div className="animate-bounce">
            <FiChevronDown className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* 웹 화면 프리뷰 */}
      <div className="flex-1 bg-white rounded-t-lg shadow-lg border-t-4 border-blue-500 p-3 overflow-y-auto min-h-0">
        {/* 브라우저 주소창 */}
        <div className="bg-gray-100 rounded-lg p-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600">
              weather.example.com
            </div>
          </div>
        </div>
        
        {/* 웹 콘텐츠 */}
        <div className="space-y-2">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <h2 className="text-lg font-bold mb-2">오늘의 날씨</h2>
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌧️</div>
              <div>
                <div className="text-2xl font-bold">18°C</div>
                <div className="text-xs opacity-90">비 예보</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">상세 정보</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">강수 확률</span>
                <span className="font-medium text-gray-900">80%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예상 시간</span>
                <span className="font-medium text-gray-900">오후 3시</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">강수량</span>
                <span className="font-medium text-gray-900">5-10mm</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <span className="text-base">☂️</span>
              <div>
                <p className="text-xs font-medium text-yellow-900">우산을 챙기세요!</p>
                <p className="text-xs text-yellow-700 mt-0.5">오후 3시부터 비가 예상됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const slides: Slide[] = [
    { 
      id: 0, 
      title: '앱 로그인', 
      description: 'PushHub 앱에 로그인하여 시작합니다. 이메일/비밀번호 또는 지문 인증을 사용할 수 있습니다.',
      component: <Slide0 /> 
    },
    { 
      id: 1, 
      title: '앱 대시보드', 
      description: '로그인 후 구독 중인 웹 기능들을 확인하고 관리할 수 있는 메인 화면입니다.',
      component: <Slide1 /> 
    },
    { 
      id: 2, 
      title: '푸시알림 수신', 
      description: '구독한 웹 기능에서 발생한 알림을 실시간으로 받아볼 수 있습니다. 알림을 탭하면 상세 내용을 확인할 수 있습니다.',
      component: <Slide2 /> 
    },
    { 
      id: 3, 
      title: '시간 설정', 
      description: '기능별로 알림을 켜고 끌 수 있으며, 특정 시간대에만 알림을 받거나 차단하는 규칙을 설정할 수 있습니다.',
      component: <Slide3 /> 
    },
    { 
      id: 4, 
      title: '앱-웹 인증 연동', 
      description: '웹에서 세션이 만료되어도 앱에 로그인되어 있다면, 앱의 인증 상태를 활용하여 웹에서 자동으로 로그인할 수 있습니다.',
      component: <Slide4 /> 
    },
    { 
      id: 5, 
      title: '웹으로 이동', 
      description: '푸시알림을 탭하면 해당 기능의 웹 페이지로 자동 이동하여 상세 정보를 확인할 수 있습니다.',
      component: <Slide5 /> 
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && ['features', 'subscriptions', 'notifications', 'history'].includes(hash)) {
      // Hash change는 DashboardLayout에서 처리
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['features', 'subscriptions', 'notifications', 'history'].includes(hash)) {
        // Hash change는 DashboardLayout에서 처리
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="w-[384px] mx-auto lg:mx-0 lg:ml-auto lg:sticky lg:top-8 relative group flex-shrink-0 pr-16">
      {/* 닫기 버튼 */}
      {onClose && (
        <button
          onClick={onClose}
          className="hidden xl:flex absolute -right-12 top-4 z-30
                   bg-gray-800 hover:bg-gray-700 text-white 
                   px-1.5 py-3 rounded-lg shadow-xl transition-all
                   items-center justify-center
                   hover:scale-110 border-2 border-white"
          aria-label="프리뷰 닫기"
          title="프리뷰 숨기기"
        >
          <FiChevronRight className="w-6 h-6" />
        </button>
      )}
      <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl w-[384px] flex-shrink-0">
        {/* 스마트폰 프레임 */}
        <div className="bg-white rounded-[2rem] overflow-hidden w-full">
          {/* 노치 */}
          <div className="h-6 bg-gray-900 rounded-b-2xl mx-auto w-32"></div>
          
          {/* 화면 */}
          <div className="bg-white h-[600px] overflow-hidden relative w-full">
            {slides[currentSlide].component}
          </div>
          
          {/* 홈 인디케이터 */}
          <div className="h-1 bg-gray-900 mx-auto w-32 rounded-full mb-2"></div>
        </div>
      </div>
      
      {/* 컨트롤 */}
      <div className="mt-6 space-y-4">
        {/* 슬라이드 제목 */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {slides[currentSlide].title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-4 leading-relaxed">
            {slides[currentSlide].description}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {currentSlide + 1} / {slides.length}
          </p>
        </div>
        
        {/* 네비게이션 버튼 */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="이전 슬라이드"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          {/* 페이지네이션 도트 */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="다음 슬라이드"
          >
            <FiChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

