'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiCalendar, FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX, FiGrid, FiList, FiClock } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardLayout } from '@/components/layout';
import { PageLayout } from '@/components/layout';
import { onAuthChange, getCurrentUser } from '@/lib/firebase';
import { getFeatureById } from '@/lib/firebase/features';
import { getFeatureSubscribers, isSubscribed } from '@/lib/firebase/subscriptions';
import type { User } from 'firebase/auth';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description?: string;
  color?: string;
}

export default function CalendarPage() {
  const searchParams = useSearchParams();
  // featureId 파라미터를 우선 사용, 없으면 id 파라미터 사용 (기존 호환성 유지)
  const featureId = searchParams.get('featureId') || searchParams.get('id') || 'calendar';
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [feature, setFeature] = useState<{ createdBy?: string } | null>(null);
  
  // 캘린더 상태
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'year'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // 현재 월의 첫 날과 마지막 날 계산
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0 (일요일) ~ 6 (토요일)
  const daysInMonth = lastDay.getDate();

  // 접근 권한 체크
  useEffect(() => {
    const checkAccess = async () => {
      if (featureId === 'calendar') {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      try {
        const featureData = await getFeatureById(featureId);
        if (!featureData) {
          setHasAccess(false);
          setAccessError('기능을 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }

        setFeature(featureData);
        
        // 공개 기능이거나 생성자인 경우 접근 허용
        if (featureData.isPublic !== false || (user && featureData.createdBy === user.uid)) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          setAccessError('이 기능에 대한 접근 권한이 없습니다.');
        }
      } catch (error) {
        console.error('접근 권한 확인 실패:', error);
        setHasAccess(false);
        setAccessError('접근 권한을 확인하는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [featureId, user]);

  // 인증 상태 확인
  useEffect(() => {
    const unsubscribe = onAuthChange((user: User | null) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // 샘플 데이터 생성 (개발용)
  useEffect(() => {
    const generateSampleEvents = () => {
      const sampleEvents: CalendarEvent[] = [];
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      
      // 2025년 11월, 12월 / 2026년 1월, 2월
      const months = [
        { year: 2025, month: 10 }, // 11월 (0-based)
        { year: 2025, month: 11 }, // 12월
        { year: 2026, month: 0 },  // 1월
        { year: 2026, month: 1 },   // 2월
      ];

      const 한일목록 = [
        '프로젝트 회의 참석', '코드 리뷰 완료', '문서 작성 완료', '버그 수정 완료',
        '기능 개발 완료', '테스트 통과', '배포 완료', '리팩토링 완료',
        '데이터베이스 설계 완료', 'API 연동 완료', 'UI 디자인 완료', '성능 최적화 완료',
        '보안 검토 완료', '문서화 완료', '코드 정리 완료', '회의록 작성 완료',
        '프로토타입 완성', '사용자 피드백 반영 완료', '모니터링 설정 완료', '백업 완료',
        '인증 시스템 구현 완료', '결제 시스템 연동 완료', '알림 기능 구현 완료', '검색 기능 구현 완료',
        '다국어 지원 완료', '반응형 디자인 완료', '접근성 개선 완료', 'SEO 최적화 완료',
      ];

      const 할일목록 = [
        '프로젝트 회의 준비', '코드 리뷰 작성', '문서 작성하기', '버그 수정하기',
        '기능 개발하기', '테스트 작성하기', '배포 준비하기', '리팩토링하기',
        '데이터베이스 설계하기', 'API 연동하기', 'UI 디자인하기', '성능 최적화하기',
        '보안 검토하기', '문서화하기', '코드 정리하기', '회의록 작성하기',
        '프로토타입 만들기', '사용자 피드백 수집하기', '모니터링 설정하기', '백업하기',
        '인증 시스템 구현하기', '결제 시스템 연동하기', '알림 기능 구현하기', '검색 기능 구현하기',
        '다국어 지원하기', '반응형 디자인하기', '접근성 개선하기', 'SEO 최적화하기',
      ];

      months.forEach(({ year, month }) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // 한일 50개 생성
        for (let i = 0; i < 50; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1;
          const hour = Math.floor(Math.random() * 12) + 9; // 9시~20시
          const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45분
          
          const date = new Date(year, month, day, hour, minute);
          const title = 한일목록[Math.floor(Math.random() * 한일목록.length)];
          
          sampleEvents.push({
            id: `done_${year}_${month}_${i}_${Date.now()}_${Math.random()}`,
            title: `✅ ${title}`,
            date,
            description: `${year}년 ${month + 1}월 ${day}일 완료한 작업`,
            color: colors[2], // 초록색 (완료)
          });
        }

        // 할일 50개 생성
        for (let i = 0; i < 50; i++) {
          const day = Math.floor(Math.random() * daysInMonth) + 1;
          const hour = Math.floor(Math.random() * 12) + 9; // 9시~20시
          const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45분
          
          const date = new Date(year, month, day, hour, minute);
          const title = 할일목록[Math.floor(Math.random() * 할일목록.length)];
          
          sampleEvents.push({
            id: `todo_${year}_${month}_${i}_${Date.now()}_${Math.random()}`,
            title: `📋 ${title}`,
            date,
            description: `${year}년 ${month + 1}월 ${day}일 예정된 작업`,
            color: colors[0], // 파란색 (할일)
          });
        }
      });

      return sampleEvents;
    };

    // 샘플 데이터가 없을 때만 생성
    if (events.length === 0) {
      const sampleEvents = generateSampleEvents();
      setEvents(sampleEvents);
    }
  }, []); // 빈 배열로 한 번만 실행

  // 날짜 이동 함수들
  const handlePrev = () => {
    switch (viewMode) {
      case 'year':
        setCurrentDate(new Date(year - 1, 0, 1));
        break;
      case 'month':
        setCurrentDate(new Date(year, month - 1, 1));
        break;
      case 'week':
        const prevWeek = new Date(currentDate);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setCurrentDate(prevWeek);
        break;
      case 'day':
        const prevDay = new Date(currentDate);
        prevDay.setDate(prevDay.getDate() - 1);
        setCurrentDate(prevDay);
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'year':
        setCurrentDate(new Date(year + 1, 0, 1));
        break;
      case 'month':
        setCurrentDate(new Date(year, month + 1, 1));
        break;
      case 'week':
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setCurrentDate(nextWeek);
        break;
      case 'day':
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCurrentDate(nextDay);
        break;
    }
  };

  // 오늘로 이동
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // 날짜 클릭
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsEventModalOpen(true);
    setEditingEvent(null);
  };

  // 일정 추가
  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setEvents([...events, newEvent]);
    setIsEventModalOpen(false);
    setSelectedDate(null);
  };

  // 일정 수정
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setIsEventModalOpen(true);
  };

  // 일정 삭제
  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  // 특정 날짜의 일정 가져오기
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });
  };

  // 특정 월의 일정 가져오기
  const getEventsForMonth = (year: number, month: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  // 특정 주의 일정 가져오기
  const getEventsForWeek = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  // 특정 연도의 일정 가져오기
  const getEventsForYear = (year: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year;
    });
  };

  // 주의 시작일 계산 (일요일)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // 주의 날짜 배열 생성
  const getWeekDays = (startDate: Date) => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // 연도 뷰를 위한 월별 그리드 생성
  const getYearMonths = () => {
    const months: { month: number; date: Date; events: CalendarEvent[] }[] = [];
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(year, m, 1);
      months.push({
        month: m,
        date: monthDate,
        events: getEventsForMonth(year, m)
      });
    }
    return months;
  };

  // 캘린더 그리드 생성
  const calendarDays: (Date | null)[] = [];
  
  // 빈 칸 추가 (첫 날 전)
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // 날짜 추가
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // 요일 헤더
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
          </div>
        </PageLayout>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <PageLayout>
          <Card className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{accessError || '접근 권한이 없습니다.'}</p>
          </Card>
        </PageLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageLayout>
        <div className="space-y-6">
          <PageHeader
            title="캘린더"
            description="일정을 관리하고 확인하세요"
          />

          {/* 캘린더 컨트롤 */}
          <Card>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              {/* 뷰 모드 선택 */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('year')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'year'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  연도
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'month'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  월
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'week'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  주
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'day'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  일
                </button>
              </div>

              {/* 날짜 네비게이션 */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  icon={<FiChevronLeft size={20} />}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
                  {viewMode === 'year' && `${year}년`}
                  {viewMode === 'month' && `${year}년 ${month + 1}월`}
                  {viewMode === 'week' && (() => {
                    const weekStart = getWeekStart(currentDate);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
                  })()}
                  {viewMode === 'day' && `${year}년 ${month + 1}월 ${currentDate.getDate()}일`}
                </h2>
                <Button
                  variant="ghost"
                  onClick={handleNext}
                  icon={<FiChevronRight size={20} />}
                />
              </div>

              <Button
                variant="secondary"
                onClick={handleToday}
              >
                오늘
              </Button>
            </div>

            {/* 캘린더 뷰 */}
            <div className="overflow-x-auto">
              {viewMode === 'year' && <YearView year={year} events={getEventsForYear(year)} onDateClick={handleDateClick} />}
              {viewMode === 'month' && <MonthView currentDate={currentDate} events={events} onDateClick={handleDateClick} onEventClick={handleEditEvent} />}
              {viewMode === 'week' && <WeekView currentDate={currentDate} events={getEventsForWeek(getWeekStart(currentDate))} onDateClick={handleDateClick} onEventClick={handleEditEvent} />}
              {viewMode === 'day' && <DayView date={currentDate} events={getEventsForDate(currentDate)} onDateClick={handleDateClick} onEventClick={handleEditEvent} />}
            </div>
          </Card>

          {/* 일정 추가/수정 모달 */}
          {isEventModalOpen && selectedDate && (
            <EventModal
              date={selectedDate}
              event={editingEvent}
              onSave={(event) => {
                if (editingEvent) {
                  // 수정
                  setEvents(events.map(e => e.id === editingEvent.id ? { ...event, id: editingEvent.id } : e));
                } else {
                  // 추가
                  handleAddEvent(event);
                }
                setIsEventModalOpen(false);
                setEditingEvent(null);
                setSelectedDate(null);
              }}
              onDelete={() => {
                if (editingEvent) {
                  handleDeleteEvent(editingEvent.id);
                  setIsEventModalOpen(false);
                  setEditingEvent(null);
                  setSelectedDate(null);
                }
              }}
              onClose={() => {
                setIsEventModalOpen(false);
                setEditingEvent(null);
                setSelectedDate(null);
              }}
            />
          )}
        </div>
      </PageLayout>
    </DashboardLayout>
  );
}

// 일정 모달 컴포넌트
interface EventModalProps {
  date: Date;
  event: CalendarEvent | null;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete: () => void;
  onClose: () => void;
}

function EventModal({ date, event, onSave, onDelete, onClose }: EventModalProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [color, setColor] = useState(event?.color || '#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      date,
      color,
    });
  };

  const colors = [
    { name: '파란색', value: '#3b82f6' },
    { name: '빨간색', value: '#ef4444' },
    { name: '초록색', value: '#10b981' },
    { name: '노란색', value: '#f59e0b' },
    { name: '보라색', value: '#8b5cf6' },
    { name: '분홍색', value: '#ec4899' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {event ? '일정 수정' : '일정 추가'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              날짜
            </label>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white">
              {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              제목 *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="일정 설명을 입력하세요"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              색상
            </label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-lg border-2 ${
                    color === c.value ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {event && (
              <Button
                type="button"
                variant="secondary"
                onClick={onDelete}
                className="text-red-600 dark:text-red-400"
                icon={<FiTrash2 size={16} />}
              >
                삭제
              </Button>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!title.trim()}
            >
              {event ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// 연도 뷰 컴포넌트
interface YearViewProps {
  year: number;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
}

function YearView({ year, events, onDateClick }: YearViewProps) {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const today = new Date();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {months.map((monthName, index) => {
        const monthDate = new Date(year, index, 1);
        const monthEvents = events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === index;
        });
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === index;

        return (
          <Card
            key={index}
            className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
              isCurrentMonth ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onDateClick(monthDate)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{monthName}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{monthEvents.length}개</span>
            </div>
            <div className="space-y-1">
              {monthEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="text-xs px-2 py-1 rounded truncate"
                  style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                >
                  {event.title}
                </div>
              ))}
              {monthEvents.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{monthEvents.length - 3}개 더
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// 월 뷰 컴포넌트
interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function MonthView({ currentDate, events, onDateClick, onEventClick }: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });
  };

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {weekDays.map((day, index) => (
            <th
              key={day}
              className={`p-3 text-center font-semibold text-sm border border-gray-200 dark:border-gray-700 ${
                index === 0 ? 'text-red-600 dark:text-red-400' : 
                index === 6 ? 'text-blue-600 dark:text-blue-400' : 
                'text-gray-700 dark:text-gray-300'
              }`}
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
          <tr key={weekIndex}>
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayIndexInArray = weekIndex * 7 + dayIndex;
              const date = calendarDays[dayIndexInArray];
              const isToday = date && 
                date.getFullYear() === new Date().getFullYear() &&
                date.getMonth() === new Date().getMonth() &&
                date.getDate() === new Date().getDate();
              const dayEvents = date ? getEventsForDate(date) : [];

              return (
                <td
                  key={dayIndex}
                  className={`min-w-[120px] h-24 border border-gray-200 dark:border-gray-700 p-2 align-top ${
                    !date ? 'bg-gray-50 dark:bg-gray-900/50' : 
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                  } ${
                    dayIndex === 0 ? 'text-red-600 dark:text-red-400' : 
                    dayIndex === 6 ? 'text-blue-600 dark:text-blue-400' : 
                    'text-gray-900 dark:text-white'
                  }`}
                  onClick={() => date && onDateClick(date)}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className="text-xs px-1 py-0.5 rounded truncate"
                            style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{dayEvents.length - 3}개 더
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 주 뷰 컴포넌트
interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function WeekView({ currentDate, events, onDateClick, onEventClick }: WeekViewProps) {
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekDays.push(day);
  }

  const weekDaysNames = ['일', '월', '화', '수', '목', '금', '토'];
  const today = new Date();

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((date, index) => {
        const isToday = date.getFullYear() === today.getFullYear() &&
                        date.getMonth() === today.getMonth() &&
                        date.getDate() === today.getDate();
        const dayEvents = getEventsForDate(date);

        return (
          <div
            key={index}
            className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-h-[400px] ${
              isToday ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : 
              'bg-white dark:bg-gray-800'
            }`}
          >
            <div
              className={`text-center mb-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 ${
                index === 0 ? 'text-red-600 dark:text-red-400' : 
                index === 6 ? 'text-blue-600 dark:text-blue-400' : 
                'text-gray-900 dark:text-white'
              }`}
              onClick={() => onDateClick(date)}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">{weekDaysNames[index]}</div>
              <div className={`text-lg font-semibold ${isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                {date.getDate()}
              </div>
            </div>
            <div className="space-y-2">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className="text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                  onClick={() => onEventClick(event)}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  {event.description && (
                    <div className="text-xs opacity-90 truncate mt-0.5">{event.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 일 뷰 컴포넌트
interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function DayView({ date, events, onDateClick, onEventClick }: DayViewProps) {
  const today = new Date();
  const isToday = date.getFullYear() === today.getFullYear() &&
                  date.getMonth() === today.getMonth() &&
                  date.getDate() === today.getDate();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getHours() === hour;
    });
  };

  return (
    <div className="space-y-4">
      {/* 날짜 헤더 */}
      <div className={`text-center p-4 rounded-lg ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}요일
        </div>
      </div>

      {/* 시간별 일정 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          return (
            <div
              key={hour}
              className="border-b border-gray-200 dark:border-gray-700 p-3 min-h-[80px] hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
              onClick={() => {
                const newDate = new Date(date);
                newDate.setHours(hour, 0, 0, 0);
                onDateClick(newDate);
              }}
            >
              <div className="flex gap-4">
                <div className="w-16 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 space-y-2">
                  {hourEvents.length > 0 ? (
                    hourEvents.map(event => (
                      <div
                        key={event.id}
                        className="px-3 py-2 rounded cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-sm opacity-90 mt-1">{event.description}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400 dark:text-gray-500">일정 없음</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

