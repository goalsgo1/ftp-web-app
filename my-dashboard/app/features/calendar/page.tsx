'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiCalendar, FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
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

  // 이전 달로 이동
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handlePrevMonth}
                  icon={<FiChevronLeft size={20} />}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
                  {year}년 {month + 1}월
                </h2>
                <Button
                  variant="ghost"
                  onClick={handleNextMonth}
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

            {/* 캘린더 그리드 */}
            <div className="overflow-x-auto">
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
                            onClick={() => date && handleDateClick(date)}
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
                                        handleEditEvent(event);
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

