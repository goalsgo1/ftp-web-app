'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiBell, FiSettings, FiClock, FiExternalLink } from 'react-icons/fi';

interface Slide {
  id: number;
  title: string;
  component: React.ReactNode;
}

export default function PhonePreview() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 슬라이드 1: 앱 대시보드 화면
  const Slide1 = () => (
    <div className="bg-gray-50 h-full flex flex-col">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">PushHub</h2>
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

  // 슬라이드 4: 웹으로 이동
  const Slide4 = () => (
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
    { id: 1, title: '앱 대시보드', component: <Slide1 /> },
    { id: 2, title: '푸시알림 수신', component: <Slide2 /> },
    { id: 3, title: '시간 설정', component: <Slide3 /> },
    { id: 4, title: '웹으로 이동', component: <Slide4 /> },
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

  return (
    <div className="w-full max-w-sm mx-auto lg:mx-0 lg:sticky lg:top-8">
      <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
        {/* 스마트폰 프레임 */}
        <div className="bg-white rounded-[2rem] overflow-hidden">
          {/* 노치 */}
          <div className="h-6 bg-gray-900 rounded-b-2xl mx-auto w-32"></div>
          
          {/* 화면 */}
          <div className="bg-white h-[600px] overflow-hidden relative">
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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

