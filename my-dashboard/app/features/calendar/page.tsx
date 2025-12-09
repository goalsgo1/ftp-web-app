'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiCalendar, FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX, FiGrid, FiList, FiClock, FiTag, FiCheckCircle, FiCircle, FiMinus, FiSquare, FiSearch, FiChevronDown, FiChevronUp, FiUpload, FiDownload, FiInfo } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardLayout } from '@/components/layout';
import { PageLayout } from '@/components/layout';
import { onAuthChange, getCurrentUser } from '@/lib/firebase';
import { getFeatureById } from '@/lib/firebase/features';
import { getFeatureSubscribers, isSubscribed } from '@/lib/firebase/subscriptions';
import { 
  getCalendarEvents, 
  addCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent,
  subscribeCalendarEvents,
  getCalendarSettings,
  saveCalendarSettings,
  type CalendarEvent as FirebaseCalendarEvent,
  type EventStatus
} from '@/lib/firebase/calendar';
import { parseMemoToCalendarEvents } from '@/lib/utils/calendarImportParser';
import type { User } from 'firebase/auth';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description?: string;
  color?: string;
  tags?: string[]; // 태그 배열
  status?: EventStatus; // 상태 (해야할일, 하는중, 했던일)
  recurringGroupId?: string; // 반복 일정 그룹 ID
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // 선택된 태그
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'none' | null>(null); // 선택된 상태 ('none'은 상태 없음)
  const [searchQuery, setSearchQuery] = useState<string>(''); // 검색어
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set()); // 일괄 색상/상태/태그 변경을 위해 선택된 일정 ID들
  const [bulkColor, setBulkColor] = useState<string>('#3b82f6'); // 일괄 색상 변경용 색상
  const [bulkStatus, setBulkStatus] = useState<EventStatus | 'none' | null>(null); // 일괄 상태 변경용 상태
  const [bulkTags, setBulkTags] = useState<string[]>([]); // 일괄 태그 추가용 태그 목록
  const [newTagInput, setNewTagInput] = useState<string>(''); // 새 태그 입력 필드
  const [bulkTagsToRemove, setBulkTagsToRemove] = useState<string[]>([]); // 일괄 태그 삭제용 태그 목록
  const [endDateForCopy, setEndDateForCopy] = useState<Date | null>(null); // 일정 복제용 끝 날짜
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false); // 일괄 작업 패널 열림/닫힘 상태
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // 가져오기 모달 열림/닫힘 상태
  const [importText, setImportText] = useState<string>(''); // 가져오기용 텍스트
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // 내보내기 모달 열림/닫힘 상태
  const [exportText, setExportText] = useState<string>(''); // 내보내기용 텍스트
  const [isMealOrderEnabled, setIsMealOrderEnabled] = useState<boolean>(false); // 식단 정렬 옵션 활성화 여부
  const [isMealInfoModalOpen, setIsMealInfoModalOpen] = useState<boolean>(false); // 식단 정보 모달 열림/닫힘 상태

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

  // 파이어베이스에서 캘린더 이벤트 로드
  useEffect(() => {
    if (!user || !hasAccess) return;

    const loadEvents = async () => {
      try {
        const firebaseEvents = await getCalendarEvents(user.uid, featureId);
        // Firebase CalendarEvent를 로컬 CalendarEvent 형식으로 변환
        const convertedEvents: CalendarEvent[] = firebaseEvents.map(event => ({
          id: event.id!,
          title: event.title,
          date: event.date,
          description: event.description,
          color: event.color,
          tags: event.tags || [],
          status: event.status || undefined,
          recurringGroupId: event.recurringGroupId || undefined,
        }));
        setEvents(convertedEvents);
      } catch (error) {
        console.error('캘린더 이벤트 로드 실패:', error);
      }
    };

    loadEvents();

    // 실시간 업데이트 구독
    const unsubscribe = subscribeCalendarEvents(user.uid, featureId, (firebaseEvents) => {
        const convertedEvents: CalendarEvent[] = firebaseEvents.map(event => ({
          id: event.id!,
          title: event.title,
          date: event.date,
          description: event.description,
          color: event.color,
          tags: event.tags || [],
          status: event.status || undefined,
        }));
      setEvents(convertedEvents);
    });

    return () => {
      unsubscribe();
    };
  }, [user, featureId, hasAccess]);

  // Firebase에서 캘린더 설정 로드
  useEffect(() => {
    if (!user || !hasAccess) return;

    const loadSettings = async () => {
      try {
        const settings = await getCalendarSettings(user.uid, featureId);
        if (settings) {
          setIsMealOrderEnabled(settings.mealOrderEnabled || false);
        }
      } catch (error) {
        console.error('캘린더 설정 로드 실패:', error);
      }
    };

    loadSettings();
  }, [user, featureId, hasAccess]);

  // 식단 정렬 옵션 상태를 Firebase에 저장
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (!user || !hasAccess || isInitialLoad) return;

    const saveSettings = async () => {
      try {
        await saveCalendarSettings(user.uid, featureId, {
          mealOrderEnabled: isMealOrderEnabled,
        });
      } catch (error) {
        console.error('캘린더 설정 저장 실패:', error);
      }
    };

    saveSettings();
  }, [isMealOrderEnabled, user, featureId, hasAccess]);

  // 초기 로드 완료 표시
  useEffect(() => {
    if (user && hasAccess) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, hasAccess]);

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
  const handleAddEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    try {
      await addCalendarEvent({
        featureId,
        title: event.title,
        date: event.date,
        description: event.description,
        color: event.color,
        tags: event.tags || [],
        status: event.status || 'todo',
      });
      // 실시간 업데이트로 자동 반영되므로 여기서는 모달만 닫음
      setIsEventModalOpen(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('일정 추가 실패:', error);
      alert('일정 추가에 실패했습니다.');
    }
  };

  // 텍스트 가져오기 처리
  const handleImport = async () => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    if (!importText.trim()) {
      alert('가져올 텍스트를 입력해주세요.');
      return;
    }

    // 텍스트 파싱
    const parseResult = parseMemoToCalendarEvents(importText);

    if (parseResult.events.length === 0) {
      alert('파싱된 일정이 없습니다. 형식을 확인해주세요.');
      if (parseResult.errors.length > 0) {
        console.error('파싱 오류:', parseResult.errors);
      }
      return;
    }

    // 확인 메시지
    const confirmMessage = `총 ${parseResult.events.length}개의 일정을 가져오시겠습니까?${
      parseResult.errors.length > 0 ? `\n\n⚠️ ${parseResult.errors.length}개의 오류가 발생했습니다.` : ''
    }`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // 일정 추가
      const addPromises = parseResult.events.map(event =>
        addCalendarEvent({
          featureId,
          title: event.title,
          date: event.date,
          description: event.description,
          color: event.color,
          tags: event.tags || [],
          status: event.status,
        })
      );

      await Promise.all(addPromises);

      // 성공 메시지
      let successMessage = `${parseResult.events.length}개의 일정이 성공적으로 추가되었습니다.`;
      if (parseResult.errors.length > 0) {
        successMessage += `\n\n일부 일정은 추가되지 않았습니다. (오류: ${parseResult.errors.length}개)`;
      }
      if (parseResult.warnings.length > 0) {
        successMessage += `\n\n경고: ${parseResult.warnings.join(', ')}`;
      }

      alert(successMessage);

      // 모달 닫기 및 텍스트 초기화
      setIsImportModalOpen(false);
      setImportText('');
    } catch (error) {
      console.error('일정 가져오기 실패:', error);
      alert('일정 가져오기에 실패했습니다.');
    }
  };

  // 캘린더 이벤트를 텍스트 형식으로 변환
  const formatEventsToText = (eventsToExport: CalendarEvent[]): string => {
    // 날짜순으로 정렬
    const sortedEvents = [...eventsToExport].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const lines: string[] = [];

    sortedEvents.forEach(event => {
      const date = new Date(event.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // 제목, 태그, 상태 조합
      let line = dateStr;
      
      if (event.title) {
        line += ` ${event.title}`;
      }

      // 태그 추가
      if (event.tags && event.tags.length > 0) {
        event.tags.forEach(tag => {
          line += ` #${tag}`;
        });
      }

      // 상태 추가
      if (event.status) {
        const statusMap: Record<EventStatus, string> = {
          'todo': '[todo]',
          'in_progress': '[in_progress]',
          'done': '[done]'
        };
        line += ` ${statusMap[event.status]}`;
      }

      lines.push(line);

      // 설명 추가 (들여쓰기)
      if (event.description) {
        const descriptionLines = event.description.split('\n');
        descriptionLines.forEach(descLine => {
          if (descLine.trim()) {
            lines.push(`  ${descLine.trim()}`);
          }
        });
      }
    });

    return lines.join('\n');
  };

  // 내보내기 처리
  const handleExport = () => {
    if (events.length === 0) {
      alert('내보낼 일정이 없습니다.');
      return;
    }

    // 전체 캘린더 내역을 텍스트로 변환
    const exportText = formatEventsToText(events);
    setExportText(exportText);
    setIsExportModalOpen(true);
  };

  // 클립보드에 복사
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      alert('클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  // 파일로 다운로드
  const handleDownloadFile = () => {
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 일정 수정
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setIsEventModalOpen(true);
  };

  // 일정 수정 저장
  const handleUpdateEvent = async (eventId: string, event: Omit<CalendarEvent, 'id'>) => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    try {
      const editingEventData = events.find(e => e.id === eventId);
      const hasGroup = editingEventData?.recurringGroupId;
      
      // 그룹 일정인 경우 확인
      let updateGroup = false;
      if (hasGroup) {
        const groupEvents = events.filter(e => e.recurringGroupId === editingEventData.recurringGroupId);
        updateGroup = confirm(
          `이 일정은 ${groupEvents.length}개의 연속 일정 중 하나입니다.\n모든 연속 일정을 함께 수정하시겠습니까?`
        );
      }
      
      await updateCalendarEvent(eventId, {
        title: event.title,
        date: event.date,
        description: event.description,
        color: event.color,
        tags: event.tags || [],
        status: event.status, // undefined일 수 있음 (상태 사용 안 함)
      }, updateGroup);
      
      // 실시간 업데이트로 자동 반영되므로 여기서는 모달만 닫음
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('일정 수정 실패:', error);
      alert('일정 수정에 실패했습니다.');
    }
  };

  // 일정 삭제
  const handleDeleteEvent = async (eventId: string) => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    const eventToDelete = events.find(e => e.id === eventId);
    const hasGroup = eventToDelete?.recurringGroupId;
    
    let deleteGroup = false;
    if (hasGroup) {
      const groupEvents = events.filter(e => e.recurringGroupId === eventToDelete.recurringGroupId);
      deleteGroup = confirm(
        `이 일정은 ${groupEvents.length}개의 연속 일정 중 하나입니다.\n모든 연속 일정을 함께 삭제하시겠습니까?\n\n취소를 선택하면 이 일정만 삭제됩니다.`
      );
    } else {
      if (!confirm('정말 이 일정을 삭제하시겠습니까?')) {
        return;
      }
    }

    try {
      await deleteCalendarEvent(eventId, deleteGroup);
      // 실시간 업데이트로 자동 반영되므로 여기서는 모달만 닫음
      setIsEventModalOpen(false);
      setEditingEvent(null);
      setSelectedDate(null);
      // 선택된 일정 목록에서도 제거
      if (deleteGroup && hasGroup) {
        const groupEventIds = events
          .filter(e => e.recurringGroupId === eventToDelete.recurringGroupId)
          .map(e => e.id!);
        setSelectedEventIds(prev => {
          const newSet = new Set(prev);
          groupEventIds.forEach(id => newSet.delete(id));
          return newSet;
        });
      } else {
        setSelectedEventIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      alert('일정 삭제에 실패했습니다.');
    }
  };

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    if (selectedEventIds.size === 0) {
      alert('삭제할 일정을 선택해주세요.');
      return;
    }

    const deleteCount = selectedEventIds.size;
    if (!confirm(`선택한 ${deleteCount}개의 일정을 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedEventIds).map(eventId => {
        return deleteCalendarEvent(eventId, false); // 개별 삭제 (그룹 삭제는 사용자가 개별적으로 선택)
      });

      await Promise.all(deletePromises);
      setSelectedEventIds(new Set());
      alert(`${deleteCount}개의 일정이 성공적으로 삭제되었습니다.`);
    } catch (error) {
      console.error('일괄 삭제 실패:', error);
      alert('일괄 삭제에 실패했습니다.');
    }
  };

  // 일괄 색상 변경
  const handleBulkColorChange = async () => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    if (selectedEventIds.size === 0) {
      alert('색상을 변경할 일정을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedEventIds.size}개의 일정 색상을 변경하시겠습니까?`)) {
      return;
    }

    try {
      const updatePromises = Array.from(selectedEventIds).map(eventId => {
        const event = events.find(e => e.id === eventId);
        if (!event) return Promise.resolve();
        
        return updateCalendarEvent(eventId, {
          title: event.title,
          date: event.date,
          description: event.description,
          color: bulkColor,
          tags: event.tags || [],
          status: event.status || 'todo',
        });
      });

      await Promise.all(updatePromises);
      setSelectedEventIds(new Set());
      alert('색상이 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('일괄 색상 변경 실패:', error);
      alert('일괄 색상 변경에 실패했습니다.');
    }
  };

  // 일괄 상태 변경
  const handleBulkStatusChange = async () => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    if (selectedEventIds.size === 0) {
      alert('상태를 변경할 일정을 선택해주세요.');
      return;
    }

    if (bulkStatus === null) {
      alert('변경할 상태를 선택해주세요.');
      return;
    }

    const statusText = bulkStatus === 'none' ? '상태 없음' : 
                      bulkStatus === 'todo' ? '해야할일' : 
                      bulkStatus === 'in_progress' ? '하는중' : '했던일';

    if (!confirm(`선택한 ${selectedEventIds.size}개의 일정 상태를 "${statusText}"로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const updatePromises = Array.from(selectedEventIds).map(eventId => {
        const event = events.find(e => e.id === eventId);
        if (!event) return Promise.resolve();
        
        // 상태에 따른 기본 색상 가져오기
        let newColor = event.color;
        if (bulkStatus !== 'none') {
          // 상태별 기본 색상 적용
          if (bulkStatus === 'todo') newColor = '#ef4444'; // 빨간색
          else if (bulkStatus === 'in_progress') newColor = '#f59e0b'; // 노란색
          else if (bulkStatus === 'done') newColor = '#10b981'; // 초록색
        }
        
        return updateCalendarEvent(eventId, {
          title: event.title,
          date: event.date,
          description: event.description,
          color: newColor,
          tags: event.tags || [],
          status: bulkStatus === 'none' ? undefined : bulkStatus,
        });
      });

      await Promise.all(updatePromises);
      setSelectedEventIds(new Set());
      setBulkStatus(null);
      alert('상태가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('일괄 상태 변경 실패:', error);
      alert('일괄 상태 변경에 실패했습니다.');
    }
  };

  // 일괄 태그 추가
  const handleBulkTagAdd = async () => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    if (selectedEventIds.size === 0) {
      alert('태그를 추가할 일정을 선택해주세요.');
      return;
    }

    if (bulkTags.length === 0) {
      alert('추가할 태그를 선택하거나 입력해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedEventIds.size}개의 일정에 태그 "${bulkTags.join(', ')}"를 추가하시겠습니까?`)) {
      return;
    }

    try {
      const updatePromises = Array.from(selectedEventIds).map(eventId => {
        const event = events.find(e => e.id === eventId);
        if (!event) return Promise.resolve();
        
        // 기존 태그와 새 태그를 합치고 중복 제거
        const existingTags = event.tags || [];
        const mergedTags = [...new Set([...existingTags, ...bulkTags])];
        
        return updateCalendarEvent(eventId, {
          title: event.title,
          date: event.date,
          description: event.description,
          color: event.color,
          tags: mergedTags,
          status: event.status || 'todo',
        });
      });

      await Promise.all(updatePromises);
      setSelectedEventIds(new Set());
      setBulkTags([]);
      setNewTagInput('');
      alert('태그가 성공적으로 추가되었습니다.');
    } catch (error) {
      console.error('일괄 태그 추가 실패:', error);
      alert('일괄 태그 추가에 실패했습니다.');
    }
  };

  // 태그 추가 함수
  const addBulkTag = (tag: string) => {
    if (tag.trim() && !bulkTags.includes(tag.trim())) {
      setBulkTags([...bulkTags, tag.trim()]);
      setNewTagInput('');
    }
  };

  // 태그 제거 함수 (추가용)
  const removeBulkTag = (tagToRemove: string) => {
    setBulkTags(bulkTags.filter(tag => tag !== tagToRemove));
  };

  // 일괄 태그 삭제
  const handleBulkTagRemove = async () => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    if (selectedEventIds.size === 0) {
      alert('태그를 삭제할 일정을 선택해주세요.');
      return;
    }

    if (bulkTagsToRemove.length === 0) {
      alert('삭제할 태그를 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedEventIds.size}개의 일정에서 태그 "${bulkTagsToRemove.join(', ')}"를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const updatePromises = Array.from(selectedEventIds).map(eventId => {
        const event = events.find(e => e.id === eventId);
        if (!event) return Promise.resolve();
        
        // 기존 태그에서 삭제할 태그들을 제거
        const existingTags = event.tags || [];
        const filteredTags = existingTags.filter(tag => !bulkTagsToRemove.includes(tag));
        
        return updateCalendarEvent(eventId, {
          title: event.title,
          date: event.date,
          description: event.description,
          color: event.color,
          tags: filteredTags,
          status: event.status || 'todo',
        });
      });

      await Promise.all(updatePromises);
      setSelectedEventIds(new Set());
      setBulkTagsToRemove([]);
      alert('태그가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('일괄 태그 삭제 실패:', error);
      alert('일괄 태그 삭제에 실패했습니다.');
    }
  };

  // 태그 삭제용 추가 함수
  const addBulkTagToRemove = (tag: string) => {
    if (tag.trim() && !bulkTagsToRemove.includes(tag.trim())) {
      setBulkTagsToRemove([...bulkTagsToRemove, tag.trim()]);
    }
  };

  // 태그 삭제용 제거 함수
  const removeBulkTagToRemove = (tagToRemove: string) => {
    setBulkTagsToRemove(bulkTagsToRemove.filter(tag => tag !== tagToRemove));
  };

  // 일정 연속 복제 (시작 날짜부터 끝 날짜까지)
  const handleBulkEventCopy = async () => {
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    if (selectedEventIds.size === 0) {
      alert('복제할 일정을 선택해주세요.');
      return;
    }

    if (!endDateForCopy) {
      alert('끝 날짜를 선택해주세요.');
      return;
    }

    const selectedEvents = events.filter(e => selectedEventIds.has(e.id));
    const totalDays = selectedEvents.reduce((sum, event) => {
      const startDate = new Date(event.date);
      const endDate = new Date(endDateForCopy);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, daysDiff + 1);
    }, 0);

    if (!confirm(`선택한 ${selectedEventIds.size}개의 일정을 선택한 날짜까지 연속 복제하시겠습니까?\n총 ${totalDays}개의 일정이 생성됩니다.`)) {
      return;
    }

    try {
      const createPromises: Promise<void>[] = [];

      selectedEvents.forEach(event => {
        const startDate = new Date(event.date);
        const endDate = new Date(endDateForCopy);
        
        // 시작 날짜가 끝 날짜보다 늦으면 스킵
        if (startDate > endDate) {
          return;
        }

        // 그룹 ID 생성 (각 원본 일정마다 고유한 그룹 ID)
        const groupId = `${event.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 시작 날짜부터 끝 날짜까지 각 날짜에 일정 생성
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateToCreate = new Date(currentDate);
          
          // 같은 날짜에 같은 제목의 일정이 이미 있는지 확인
          const existingEvent = events.find(e => {
            const eDate = new Date(e.date);
            return eDate.getFullYear() === dateToCreate.getFullYear() &&
                   eDate.getMonth() === dateToCreate.getMonth() &&
                   eDate.getDate() === dateToCreate.getDate() &&
                   e.title === event.title;
          });

          // 같은 날짜에 같은 제목의 일정이 없으면 생성
          if (!existingEvent) {
            createPromises.push(
              addCalendarEvent({
                featureId,
                title: event.title,
                date: dateToCreate,
                description: event.description,
                color: event.color,
                tags: event.tags || [],
                status: event.status || 'todo',
                recurringGroupId: groupId, // 같은 그룹 ID로 연결
              }).then(() => {})
            );
          }

          // 다음 날로 이동
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      await Promise.all(createPromises);
      setSelectedEventIds(new Set());
      setEndDateForCopy(null);
      alert('일정이 성공적으로 복제되었습니다.');
    } catch (error) {
      console.error('일정 복제 실패:', error);
      alert('일정 복제에 실패했습니다.');
    }
  };

  // 특정 날짜의 일정 가져오기
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const isSameDate = eventDate.getFullYear() === date.getFullYear() &&
                        eventDate.getMonth() === date.getMonth() &&
                        eventDate.getDate() === date.getDate();
      
      if (!isSameDate) return false;
      
      // 태그 필터링
      if (selectedTag && !(event.tags && event.tags.includes(selectedTag))) {
        return false;
      }
      
      // 상태 필터링
      if (selectedStatus !== null) {
        if (selectedStatus === 'none') {
          if (event.status) return false;
        } else {
          if (event.status !== selectedStatus) return false;
        }
      }
      
      // 검색어 필터링 (제목과 설명)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = event.title.toLowerCase().includes(query);
        const descriptionMatch = event.description?.toLowerCase().includes(query) || false;
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 특정 월의 일정 가져오기
  const getEventsForMonth = (year: number, month: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const isInMonth = eventDate.getFullYear() === year && eventDate.getMonth() === month;
      
      if (!isInMonth) return false;
      
      // 태그 필터링
      if (selectedTag && !(event.tags && event.tags.includes(selectedTag))) {
        return false;
      }
      
      // 상태 필터링
      if (selectedStatus !== null) {
        if (selectedStatus === 'none') {
          // 상태 없음 필터링
          if (event.status) return false;
        } else {
          // 특정 상태 필터링
          if (event.status !== selectedStatus) return false;
        }
      }
      
      // 검색어 필터링 (제목과 설명)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = event.title.toLowerCase().includes(query);
        const descriptionMatch = event.description?.toLowerCase().includes(query) || false;
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 특정 월의 모든 태그 추출 (태그와 개수 함께 반환)
  const getTagsForMonth = (year: number, month: number): Array<{ tag: string; count: number }> => {
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
    
    const tagCountMap = new Map<string, number>();
    monthEvents.forEach(event => {
      if (event.tags && event.tags.length > 0) {
        event.tags.forEach(tag => {
          tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
        });
      }
    });
    
    return Array.from(tagCountMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        // 개수 내림차순, 같으면 태그명 오름차순
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.tag.localeCompare(b.tag);
      });
  };

  // 특정 월의 상태별 통계
  const getStatusStatsForMonth = (year: number, month: number) => {
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
    
    let todo = 0;
    let inProgress = 0;
    let done = 0;
    let noStatus = 0;
    
    monthEvents.forEach(event => {
      if (!event.status) {
        noStatus++;
      } else if (event.status === 'todo') {
        todo++;
      } else if (event.status === 'in_progress') {
        inProgress++;
      } else if (event.status === 'done') {
        done++;
      }
    });
    
    return { todo, inProgress, done, noStatus };
  };

  // 특정 날짜의 상태별 통계
  const getStatusStatsForDate = (date: Date) => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });
    
    let todo = 0;
    let inProgress = 0;
    let done = 0;
    let noStatus = 0;
    
    dayEvents.forEach(event => {
      if (!event.status) {
        noStatus++;
      } else if (event.status === 'todo') {
        todo++;
      } else if (event.status === 'in_progress') {
        inProgress++;
      } else if (event.status === 'done') {
        done++;
      }
    });
    
    return { todo, inProgress, done, noStatus };
  };

  // 특정 주의 일정 가져오기
  const getEventsForWeek = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const isInWeek = eventDate >= startDate && eventDate <= endDate;
      
      if (!isInWeek) return false;
      
      // 태그 필터링
      if (selectedTag && !(event.tags && event.tags.includes(selectedTag))) {
        return false;
      }
      
      // 상태 필터링
      if (selectedStatus !== null) {
        if (selectedStatus === 'none') {
          if (event.status) return false;
        } else {
          if (event.status !== selectedStatus) return false;
        }
      }
      
      // 검색어 필터링 (제목과 설명)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = event.title.toLowerCase().includes(query);
        const descriptionMatch = event.description?.toLowerCase().includes(query) || false;
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 특정 연도의 일정 가져오기
  const getEventsForYear = (year: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const isInYear = eventDate.getFullYear() === year;
      
      if (!isInYear) return false;
      
      // 태그 필터링
      if (selectedTag && !(event.tags && event.tags.includes(selectedTag))) {
        return false;
      }
      
      // 상태 필터링
      if (selectedStatus !== null) {
        if (selectedStatus === 'none') {
          if (event.status) return false;
        } else {
          if (event.status !== selectedStatus) return false;
        }
      }
      
      // 검색어 필터링 (제목과 설명)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = event.title.toLowerCase().includes(query);
        const descriptionMatch = event.description?.toLowerCase().includes(query) || false;
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }
      
      return true;
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
          <Card className="shadow-sm">
            {/* 상단 헤더 - 뷰 모드와 날짜 네비게이션 */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* 뷰 모드 선택 */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
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
                <div className="flex items-center gap-3 min-w-[200px]">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
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
                  {viewMode === 'month' && (() => {
                    const stats = getStatusStatsForMonth(year, month);
                    const total = stats.todo + stats.inProgress + stats.done + stats.noStatus;
                    if (total > 0) {
                      return (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-0.5">
                            <FiSquare size={10} className="text-red-600 dark:text-red-400" />
                            <span className="font-medium">{stats.todo}</span>
                          </span>
                          <span>/</span>
                          <span className="flex items-center gap-0.5">
                            <FiCircle size={10} className="text-yellow-600 dark:text-yellow-400" />
                            <span className="font-medium">{stats.inProgress}</span>
                          </span>
                          <span>/</span>
                          <span className="flex items-center gap-0.5">
                            <FiCheckCircle size={10} className="text-green-600 dark:text-green-400" />
                            <span className="font-medium">{stats.done}</span>
                          </span>
                          <span>/</span>
                          <span className="flex items-center gap-0.5">
                            <FiMinus size={10} className="text-gray-400 dark:text-gray-500 opacity-60" />
                            <span className="font-medium">{stats.noStatus}</span>
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                <Button
                  variant="ghost"
                  onClick={handleNext}
                  icon={<FiChevronRight size={20} />}
                />
              </div>

              <div className="flex items-center gap-2">
                {/* 식단 정렬 옵션 체크박스 */}
                <div className="flex items-center gap-1">
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={isMealOrderEnabled}
                      onChange={(e) => setIsMealOrderEnabled(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">식단</span>
                  </label>
                  <button
                    onClick={() => setIsMealInfoModalOpen(true)}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="식단 정렬 정보"
                  >
                    <FiInfo size={18} />
                  </button>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleToday}
                >
                  오늘
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsImportModalOpen(true)}
                  icon={<FiUpload size={18} />}
                >
                  가져오기
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleExport}
                  icon={<FiDownload size={18} />}
                >
                  내보내기
                </Button>
              </div>
              </div>
            </div>

            {/* 검색 및 필터 영역 - 한 줄에 배치 */}
            <div className="mb-4 space-y-3">
              {/* 검색창과 필터를 한 줄에 */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* 검색창 */}
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                      type="text"
                      placeholder="제목 또는 설명으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                        title="검색 초기화"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 상태 필터 - 컴팩트하게 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">상태:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedStatus(selectedStatus === 'todo' ? null : 'todo')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedStatus === 'todo'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <FiSquare size={11} />
                      <span>해야할일</span>
                    </button>
                    <button
                      onClick={() => setSelectedStatus(selectedStatus === 'in_progress' ? null : 'in_progress')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedStatus === 'in_progress'
                          ? 'bg-yellow-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <FiCircle size={11} />
                      <span>하는중</span>
                    </button>
                    <button
                      onClick={() => setSelectedStatus(selectedStatus === 'done' ? null : 'done')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedStatus === 'done'
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <FiCheckCircle size={11} />
                      <span>했던일</span>
                    </button>
                    <button
                      onClick={() => setSelectedStatus(selectedStatus === 'none' ? null : 'none')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border border-dashed ${
                        selectedStatus === 'none'
                          ? 'bg-gray-600 text-white shadow-sm border-gray-600'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <FiMinus size={11} className={selectedStatus === 'none' ? '' : 'opacity-60'} />
                      <span>없음</span>
                    </button>
                    {selectedStatus && (
                      <button
                        onClick={() => setSelectedStatus(null)}
                        className="px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 태그 필터 (월 뷰일 때만 표시) */}
              {viewMode === 'month' && (() => {
                const monthTags = getTagsForMonth(year, month);
                return monthTags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-200 dark:border-gray-700">
                    <FiTag size={14} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">태그:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {monthTags.map(({ tag, count }) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                            selectedTag === tag
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <FiTag size={10} />
                          <span>{tag}</span>
                          <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${
                            selectedTag === tag
                              ? 'bg-white/25 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}>
                            {count}
                          </span>
                        </button>
                      ))}
                      {selectedTag && (
                        <button
                          onClick={() => setSelectedTag(null)}
                          className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          초기화
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 일괄 작업 패널 (월별 뷰에서만 표시) - 접을 수 있는 아코디언 */}
            {viewMode === 'month' && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">일괄 작업</span>
                    {selectedEventIds.size > 0 && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                        {selectedEventIds.size}개 선택
                      </span>
                    )}
                  </div>
                  {isBulkActionsOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                
                {isBulkActionsOpen && (
                  <div className="mt-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 space-y-4">
                    {/* 선택 영역 */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEventIds.size > 0 && selectedEventIds.size === getEventsForMonth(year, month).length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const filteredEvents = getEventsForMonth(year, month);
                              setSelectedEventIds(new Set(filteredEvents.map(e => e.id)));
                            } else {
                              setSelectedEventIds(new Set());
                            }
                          }}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          전체 선택 ({getEventsForMonth(year, month).length}개)
                        </span>
                      </label>
                      {selectedEventIds.size > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {selectedEventIds.size}개 선택됨
                          </span>
                          <Button
                            onClick={handleBulkDelete}
                            variant="primary"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 shadow-sm"
                          >
                            삭제
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* 일괄 작업 옵션들 - 그리드 레이아웃 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 색상 변경 섹션 */}
                      <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">색상 변경</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {[
                            { name: '파란색', value: '#3b82f6' },
                            { name: '빨간색', value: '#ef4444' },
                            { name: '초록색', value: '#10b981' },
                            { name: '노란색', value: '#f59e0b' },
                            { name: '보라색', value: '#8b5cf6' },
                            { name: '분홍색', value: '#ec4899' },
                          ].map(color => (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => setBulkColor(color.value)}
                              className={`w-7 h-7 rounded-full border-2 transition-all ${
                                bulkColor === color.value
                                  ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-blue-500'
                                  : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <Button
                          onClick={handleBulkColorChange}
                          variant="primary"
                          size="sm"
                          disabled={selectedEventIds.size === 0}
                          className={`w-full ${selectedEventIds.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          색상 변경
                        </Button>
                      </div>

                      {/* 상태 변경 섹션 */}
                      <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">상태 변경</span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap mb-2">
                          <button
                            type="button"
                            onClick={() => setBulkStatus(bulkStatus === 'todo' ? null : 'todo')}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                              bulkStatus === 'todo'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <FiSquare size={11} />
                            <span>해야할일</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBulkStatus(bulkStatus === 'in_progress' ? null : 'in_progress')}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                              bulkStatus === 'in_progress'
                                ? 'bg-yellow-500 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <FiCircle size={11} />
                            <span>하는중</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBulkStatus(bulkStatus === 'done' ? null : 'done')}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                              bulkStatus === 'done'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <FiCheckCircle size={11} />
                            <span>했던일</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBulkStatus(bulkStatus === 'none' ? null : 'none')}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all border border-dashed ${
                              bulkStatus === 'none'
                                ? 'bg-gray-600 text-white shadow-sm border-gray-600'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <FiMinus size={11} className={bulkStatus === 'none' ? '' : 'opacity-60'} />
                            <span>없음</span>
                          </button>
                        </div>
                        <Button
                          onClick={handleBulkStatusChange}
                          variant="primary"
                          size="sm"
                          disabled={selectedEventIds.size === 0 || bulkStatus === null}
                          className={`w-full ${selectedEventIds.size === 0 || bulkStatus === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          상태 변경
                        </Button>
                      </div>
                    </div>

                    {/* 태그 추가 섹션 */}
                    <div className="flex flex-col gap-2 border-t border-blue-200 dark:border-blue-700 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">태그 추가:</span>
                        <div className="flex-1 flex items-center gap-2 flex-wrap">
                          {/* 기존 태그 목록에서 선택 */}
                          {getTagsForMonth(year, month).length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {getTagsForMonth(year, month).map(({ tag }) => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => addBulkTag(tag)}
                                  disabled={bulkTags.includes(tag)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                                    bulkTags.includes(tag)
                                      ? 'bg-blue-600 text-white cursor-not-allowed'
                                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                  }`}
                                >
                                  <FiTag size={10} />
                                  {tag}
                                </button>
                              ))}
                            </div>
                          )}
                          {/* 새 태그 입력 */}
                          <div className="flex items-center gap-1">
                            <Input
                              type="text"
                              value={newTagInput}
                              onChange={(e) => setNewTagInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (newTagInput.trim()) {
                                    addBulkTag(newTagInput.trim());
                                  }
                                }
                              }}
                              placeholder="새 태그 입력"
                              size="sm"
                              className="w-32"
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                if (newTagInput.trim()) {
                                  addBulkTag(newTagInput.trim());
                                }
                              }}
                              variant="ghost"
                              size="sm"
                              className="px-2"
                            >
                              <FiPlus size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* 선택된 태그 표시 */}
                      {bulkTags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-600 dark:text-gray-400">선택된 태그:</span>
                          {bulkTags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                            >
                              <FiTag size={10} />
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeBulkTag(tag)}
                                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                              >
                                <FiX size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <Button
                        onClick={handleBulkTagAdd}
                        variant="primary"
                        size="sm"
                        disabled={selectedEventIds.size === 0 || bulkTags.length === 0}
                        className={selectedEventIds.size === 0 || bulkTags.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        {selectedEventIds.size > 0 && bulkTags.length > 0 
                          ? `${selectedEventIds.size}개에 태그 추가` 
                          : '일정과 태그를 선택하세요'}
                      </Button>
                    </div>

                    {/* 태그 삭제 섹션 */}
                    <div className="flex flex-col gap-2 border-t border-blue-200 dark:border-blue-700 pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">태그 삭제:</span>
                        <div className="flex-1 flex items-center gap-2 flex-wrap">
                          {/* 선택된 일정들에 있는 태그 목록 표시 */}
                          {selectedEventIds.size > 0 && (() => {
                            const selectedEvents = events.filter(e => selectedEventIds.has(e.id));
                            const allTags = new Set<string>();
                            selectedEvents.forEach(event => {
                              if (event.tags && event.tags.length > 0) {
                                event.tags.forEach(tag => allTags.add(tag));
                              }
                            });
                            const availableTags = Array.from(allTags).sort();
                            
                            return availableTags.length > 0 ? (
                              <div className="flex gap-1 flex-wrap">
                                {availableTags.map(tag => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => addBulkTagToRemove(tag)}
                                    disabled={bulkTagsToRemove.includes(tag)}
                                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                                      bulkTagsToRemove.includes(tag)
                                        ? 'bg-red-600 text-white cursor-not-allowed'
                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                    }`}
                                  >
                                    <FiTag size={10} />
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">선택된 일정에 태그가 없습니다.</span>
                            );
                          })()}
                        </div>
                      </div>
                      {/* 선택된 삭제 태그 표시 */}
                      {bulkTagsToRemove.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-600 dark:text-gray-400">삭제할 태그:</span>
                          {bulkTagsToRemove.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs"
                            >
                              <FiTag size={10} />
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeBulkTagToRemove(tag)}
                                className="ml-1 hover:text-red-900 dark:hover:text-red-100"
                              >
                                <FiX size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <Button
                        onClick={handleBulkTagRemove}
                        variant="primary"
                        size="sm"
                        disabled={selectedEventIds.size === 0 || bulkTagsToRemove.length === 0}
                        className={`${selectedEventIds.size === 0 || bulkTagsToRemove.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} bg-red-600 hover:bg-red-700`}
                      >
                        {selectedEventIds.size > 0 && bulkTagsToRemove.length > 0 
                          ? `${selectedEventIds.size}개에서 태그 삭제` 
                          : '일정과 태그를 선택하세요'}
                      </Button>
                    </div>

                    {/* 일정 연속 복제 섹션 */}
                    <div className="flex flex-col gap-2 border-t border-blue-200 dark:border-blue-700 pt-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">끝 날짜 선택:</span>
                          <Input
                            type="date"
                            value={endDateForCopy ? endDateForCopy.toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                setEndDateForCopy(new Date(e.target.value));
                              } else {
                                setEndDateForCopy(null);
                              }
                            }}
                            size="sm"
                            className="w-40"
                          />
                        </div>
                        {endDateForCopy && selectedEventIds.size > 0 && (() => {
                          const selectedEvents = events.filter(e => selectedEventIds.has(e.id));
                          const dateRanges = selectedEvents.map(event => {
                            const startDate = new Date(event.date);
                            const endDate = new Date(endDateForCopy);
                            if (startDate > endDate) return null;
                            const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                            return {
                              title: event.title,
                              start: startDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                              end: endDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                              days: daysDiff + 1
                            };
                          }).filter(Boolean);
                          
                          return (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {dateRanges.length > 0 && (
                                <span>
                                  {dateRanges.map((range, idx) => (
                                    <span key={idx}>
                                      {range?.title}: {range?.start} ~ {range?.end} ({range?.days}일)
                                      {idx < dateRanges.length - 1 && ', '}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        <Button
                          onClick={handleBulkEventCopy}
                          variant="primary"
                          size="sm"
                          disabled={selectedEventIds.size === 0 || !endDateForCopy}
                          className={`${selectedEventIds.size === 0 || !endDateForCopy ? 'opacity-50 cursor-not-allowed' : ''} bg-green-600 hover:bg-green-700`}
                        >
                          {selectedEventIds.size > 0 && endDateForCopy 
                            ? `${selectedEventIds.size}개 일정 복제` 
                            : '일정과 날짜를 선택하세요'}
                        </Button>
                      </div>
                      {selectedEventIds.size > 0 && !endDateForCopy && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          💡 선택한 일정들이 각각의 시작 날짜부터 선택한 끝 날짜까지 연속적으로 복제됩니다.
                        </div>
                      )}
                    </div>
                    {selectedEventIds.size === 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                        💡 일정을 선택한 후 색상, 상태, 태그를 변경하거나 날짜까지 연속 복제할 수 있습니다.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 캘린더 뷰 */}
            <div className="overflow-x-auto">
              {viewMode === 'year' && <YearView year={year} events={getEventsForYear(year)} onDateClick={handleDateClick} onEventDelete={handleDeleteEvent} />}
              {viewMode === 'month' && <MonthView currentDate={currentDate} events={getEventsForMonth(year, month)} onDateClick={handleDateClick} onEventClick={handleEditEvent} onEventDelete={handleDeleteEvent} selectedEventIds={selectedEventIds} onToggleEventSelect={(eventId) => {
                setSelectedEventIds(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(eventId)) {
                    newSet.delete(eventId);
                  } else {
                    newSet.add(eventId);
                  }
                  return newSet;
                });
              }} isMealOrderEnabled={isMealOrderEnabled} />}
              {viewMode === 'week' && <WeekView currentDate={currentDate} events={getEventsForWeek(getWeekStart(currentDate))} onDateClick={handleDateClick} onEventClick={handleEditEvent} onEventDelete={handleDeleteEvent} isMealOrderEnabled={isMealOrderEnabled} />}
              {viewMode === 'day' && <DayView date={currentDate} events={getEventsForDate(currentDate)} onDateClick={handleDateClick} onEventClick={handleEditEvent} onEventDelete={handleDeleteEvent} isMealOrderEnabled={isMealOrderEnabled} />}
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
                  handleUpdateEvent(editingEvent.id, event);
                } else {
                  // 추가
                  handleAddEvent(event);
                }
              }}
              onDelete={() => {
                if (editingEvent) {
                  handleDeleteEvent(editingEvent.id);
                }
              }}
              onClose={() => {
                setIsEventModalOpen(false);
                setEditingEvent(null);
                setSelectedDate(null);
              }}
            />
          )}

          {/* 가져오기 모달 */}
          {isImportModalOpen && (
            <ImportModal
              importText={importText}
              onImportTextChange={setImportText}
              onImport={handleImport}
              onClose={() => {
                setIsImportModalOpen(false);
                setImportText('');
              }}
            />
          )}

          {/* 내보내기 모달 */}
          {isExportModalOpen && (
            <ExportModal
              exportText={exportText}
              onCopy={handleCopyToClipboard}
              onDownload={handleDownloadFile}
              onClose={() => {
                setIsExportModalOpen(false);
                setExportText('');
              }}
            />
          )}

          {isMealInfoModalOpen && (
            <MealInfoModal
              onClose={() => setIsMealInfoModalOpen(false)}
            />
          )}
        </div>
      </PageLayout>
    </DashboardLayout>
  );
}

// 가져오기 모달 컴포넌트
interface ImportModalProps {
  importText: string;
  onImportTextChange: (text: string) => void;
  onImport: () => void;
  onClose: () => void;
}

function ImportModal({ importText, onImportTextChange, onImport, onClose }: ImportModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">일정 가져오기</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                텍스트 붙여넣기
              </label>
              <textarea
                value={importText}
                onChange={(e) => onImportTextChange(e.target.value)}
                placeholder={`예시:
2025-12-10 회의 #업무 [todo]
2025-12-11 프로젝트 발표 #프로젝트 [in_progress]
2025-12-12 점심: 김치찌개 #점심
2025-12-12 저녁: 부대찌개 #저녁`}
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">사용 형식:</h4>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>날짜 형식: YYYY-MM-DD 또는 MM-DD</li>
                <li>태그: #태그명 (예: #점심, #저녁, #회식)</li>
                <li>상태: [todo], [in_progress], [done]</li>
                <li>설명: 날짜 줄 다음에 들여쓰기로 작성</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={onImport}
            disabled={!importText.trim()}
            className={!importText.trim() ? 'opacity-50 cursor-not-allowed' : ''}
          >
            가져오기
          </Button>
        </div>
      </Card>
    </div>
  );
}

// 내보내기 모달 컴포넌트
interface ExportModalProps {
  exportText: string;
  onCopy: () => void;
  onDownload: () => void;
  onClose: () => void;
}

function ExportModal({ exportText, onCopy, onDownload, onClose }: ExportModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">일정 내보내기</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                내보낼 일정 텍스트 (전체 캘린더 내역)
              </label>
              <textarea
                value={exportText}
                readOnly
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-none"
              />
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">내보내기 옵션:</h4>
              <ul className="text-xs text-green-800 dark:text-green-400 space-y-1 list-disc list-inside">
                <li>클립보드 복사: 텍스트를 클립보드에 복사합니다</li>
                <li>파일 다운로드: 텍스트 파일로 다운로드합니다</li>
                <li>이 형식은 가져오기 기능과 호환됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            닫기
          </Button>
          <Button
            variant="secondary"
            onClick={onCopy}
            icon={<FiUpload size={18} />}
          >
            클립보드 복사
          </Button>
          <Button
            variant="primary"
            onClick={onDownload}
            icon={<FiDownload size={18} />}
          >
            파일 다운로드
          </Button>
        </div>
      </Card>
    </div>
  );
}

// 식단 정보 모달 컴포넌트
interface MealInfoModalProps {
  onClose: () => void;
}

function MealInfoModal({ onClose }: MealInfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">식단 정렬 기능 안내</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* 식단 정렬 기능 설명 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiInfo size={20} className="text-blue-600 dark:text-blue-400" />
              식단 정렬 기능이란?
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              '식단' 체크박스를 활성화하면, 각 날짜의 일정이 식사 시간 순서대로 자동 정렬됩니다.
              아침 → 점심 → 저녁 → 회식 → 기타 순서로 표시되며, 저녁이 없으면 회식이 점심 다음에 오게 됩니다.
            </p>
          </div>

          {/* 가져오기 방법 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiUpload size={20} className="text-blue-600 dark:text-blue-400" />
              가져오기 방법
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">1. 캘린더 상단의 "가져오기" 버튼 클릭</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">2. 텍스트 입력창에 일정 정보를 붙여넣기</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">3. "가져오기" 버튼을 눌러 일정 추가</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
{`예시:
2025-12-10 점심: 김치찌개 #점심
2025-12-10 저녁: 부대찌개 #저녁
2025-12-11 아침: 콩나물국밥 #아침
2025-12-11 점심: 순두부찌개 #점심`}
                </p>
              </div>
            </div>
          </div>

          {/* 메모 방법 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiEdit2 size={20} className="text-blue-600 dark:text-blue-400" />
              메모 작성 방법
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                일정을 추가하거나 수정할 때 제목에 식사 시간을 포함하거나, 태그를 사용하여 식단을 구분할 수 있습니다.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside ml-2">
                <li>제목에 "아침", "점심", "저녁", "회식", "기타" 포함</li>
                <li>태그로 #아침, #점심, #저녁, #회식, #기타 추가</li>
                <li>두 방법 모두 사용 가능하며, 태그가 우선 적용됩니다</li>
              </ul>
            </div>
          </div>

          {/* 식단 구분 방법 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiTag size={20} className="text-blue-600 dark:text-blue-400" />
              식단 구분 방법
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f97316' }}></div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">아침</h5>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">태그: #아침</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">제목에 "아침" 포함</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">점심</h5>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">태그: #점심</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">제목에 "점심" 포함</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">저녁</h5>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">태그: #저녁</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">제목에 "저녁" 포함</p>
              </div>

              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#ec4899' }}></div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">회식</h5>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">태그: #회식</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">제목에 "회식" 포함</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#6b7280' }}></div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">기타</h5>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">태그: #기타</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">제목에 "기타" 포함</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">애매한 시간에 먹는 식사</p>
              </div>
            </div>
          </div>

          {/* 정렬 순서 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiList size={20} className="text-blue-600 dark:text-blue-400" />
              정렬 순서
            </h4>
            <div className="bg-gradient-to-r from-orange-50 via-blue-50 via-purple-50 via-pink-50 to-gray-50 dark:from-orange-900/20 dark:via-blue-900/20 dark:via-purple-900/20 dark:via-pink-900/20 dark:to-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm font-medium text-gray-900 dark:text-white flex-wrap gap-2">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
                  아침
                </span>
                <span>→</span>
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                  점심
                </span>
                <span>→</span>
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
                  저녁
                </span>
                <span>→</span>
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ec4899' }}></div>
                  회식
                </span>
                <span>→</span>
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
                  기타
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                * 저녁이 없으면 회식이 점심 다음에 오게 됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            onClick={onClose}
          >
            확인
          </Button>
        </div>
      </Card>
    </div>
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
  const [tags, setTags] = useState<string[]>(event?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [useStatus, setUseStatus] = useState<boolean>(!!event?.status); // 상태 사용 여부
  const [status, setStatus] = useState<EventStatus>(event?.status || 'todo');

  // 상태에 따른 기본 색상
  const getStatusColor = (status: EventStatus): string => {
    if (status === 'todo') return '#ef4444'; // 빨간색
    if (status === 'in_progress') return '#f59e0b'; // 노란색
    if (status === 'done') return '#10b981'; // 초록색
    return '#3b82f6'; // 기본 파란색
  };

  // event가 변경될 때 상태 업데이트
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setUseStatus(!!event.status);
      setStatus(event.status || 'todo');
      // 상태가 있으면 상태 색상, 없으면 저장된 색상 또는 기본 색상
      setColor(event.color || (event.status ? getStatusColor(event.status) : '#3b82f6'));
      setTags(event.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setColor('#3b82f6');
      setTags([]);
      setUseStatus(false);
      setStatus('todo');
    }
    setTagInput('');
  }, [event]);

  // 상태 사용 여부 토글
  const handleUseStatusToggle = (checked: boolean) => {
    setUseStatus(checked);
    if (checked) {
      // 상태 사용 활성화 시 기본 상태 색상 적용
      const statusColor = getStatusColor(status);
      if (!event?.color || color === getStatusColor(event.status || 'todo')) {
        setColor(statusColor);
      }
    } else {
      // 상태 사용 비활성화 시 기본 파란색으로 변경 (사용자가 색상을 직접 지정한 경우 유지)
      if (!event?.color || color === getStatusColor(event.status || 'todo')) {
        setColor('#3b82f6');
      }
    }
  };

  // 상태 변경 시 색상 자동 업데이트
  const handleStatusChange = (newStatus: EventStatus) => {
    setStatus(newStatus);
    // 상태 사용 중이면 색상 자동 변경
    if (useStatus) {
      const statusColor = getStatusColor(newStatus);
      if (!event?.color || color === getStatusColor(event.status || 'todo')) {
        setColor(statusColor);
      }
    }
  };

  // 태그 추가
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  // 태그 삭제
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Enter 키로 태그 추가
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // 입력 중인 태그가 있으면 추가
    if (tagInput.trim()) {
      handleAddTag();
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      date,
      color,
      tags,
      status: useStatus ? status : undefined, // 상태 사용 안 하면 undefined
    });
  };

  const colors = [
    { name: '파란색', value: '#3b82f6' },
    { name: '빨간색', value: '#ef4444' },
    { name: '초록색', value: '#10b981' },
    { name: '노란색', value: '#f59e0b' },
    { name: '보라색', value: '#8b5cf6' },
    { name: '분홍색', value: '#ec4899' },
    { name: '회색', value: '#6b7280' },
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                상태 관리
              </label>
              <Toggle
                checked={useStatus}
                onChange={handleUseStatusToggle}
                label={useStatus ? '상태 사용 중' : '상태 사용 안 함'}
                size="sm"
              />
            </div>
            {useStatus && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('todo')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === 'todo'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  해야할일
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('in_progress')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === 'in_progress'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  하는중
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('done')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === 'done'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  했던일
                </button>
              </div>
            )}
            {!useStatus && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                상태를 사용하지 않으면 기본 색상으로 표시됩니다.
              </p>
            )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              태그
            </label>
            <div className="space-y-2">
              {/* 태그 입력 */}
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="태그 입력 후 Enter 또는 쉼표(,)로 추가"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  추가
                </Button>
              </div>
              {/* 태그 목록 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      <FiTag size={12} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                        aria-label={`${tag} 태그 제거`}
                      >
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {tags.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  태그를 추가하면 일정을 더 쉽게 분류하고 검색할 수 있습니다.
                </p>
              )}
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
  onEventDelete: (eventId: string) => void;
}

function YearView({ year, events, onDateClick, onEventDelete }: YearViewProps) {
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
              {monthEvents.slice(0, 3).map(event => {
                const hasStatus = !!event.status;
                const getStatusIcon = () => {
                  if (!hasStatus) return <FiMinus size={10} className="opacity-60" />;
                  if (event.status === 'done') return <FiCheckCircle size={10} />;
                  if (event.status === 'todo') return <FiSquare size={10} />;
                  return <FiCircle size={10} />; // in_progress
                };
                return (
                  <div
                    key={event.id}
                    className={`text-xs px-2 py-1 rounded truncate flex items-center gap-1 group ${
                      hasStatus ? '' : 'border border-dashed border-white/30'
                    }`}
                    style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                    title={hasStatus ? `상태: ${event.status === 'todo' ? '해야할일' : event.status === 'in_progress' ? '하는중' : '했던일'}` : '상태 없음'}
                  >
                    {getStatusIcon()}
                    <span className="truncate flex-1">{event.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('정말 이 일정을 삭제하시겠습니까?')) {
                          onEventDelete(event.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-white/20 rounded p-0.5"
                      title="삭제"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                );
              })}
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
  onEventDelete: (eventId: string) => void;
  selectedEventIds?: Set<string>;
  onToggleEventSelect?: (eventId: string) => void;
  isMealOrderEnabled?: boolean;
}

function MonthView({ currentDate, events, onDateClick, onEventClick, onEventDelete, selectedEventIds = new Set(), onToggleEventSelect, isMealOrderEnabled = false }: MonthViewProps) {
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

  // 일정 정렬 함수 (식단 정렬 옵션에 따라 다르게 정렬)
  const sortEvents = (events: CalendarEvent[]): CalendarEvent[] => {
    return [...events].sort((a, b) => {
      // 식단 정렬 옵션이 활성화된 경우: 아침 → 점심 → 저녁 → 회식 → 기타 순서
      if (isMealOrderEnabled) {
        // 먼저 같은 날짜에 저녁 이벤트가 있는지 확인
        const hasDinnerEvent = events.some(event => {
          const hasDinnerTag = event.tags?.includes('저녁') || false;
          const titleLower = event.title.toLowerCase();
          const hasDinnerInTitle = titleLower.includes('저녁');
          return hasDinnerTag || hasDinnerInTitle;
        });
        
        // 이벤트의 타입 우선순위 계산 함수
        const getEventTypePriority = (event: CalendarEvent): number => {
          const hasBreakfastTag = event.tags?.includes('아침') || false;
          const hasLunchTag = event.tags?.includes('점심') || false;
          const hasDinnerTag = event.tags?.includes('저녁') || false;
          const hasCompanyDinnerTag = event.tags?.includes('회식') || false;
          const hasOtherTag = event.tags?.includes('기타') || false;
          const titleLower = event.title.toLowerCase();
          const hasBreakfastInTitle = titleLower.includes('아침');
          const hasLunchInTitle = titleLower.includes('점심');
          const hasDinnerInTitle = titleLower.includes('저녁');
          const hasCompanyDinnerInTitle = titleLower.includes('회식');
          const hasOtherInTitle = titleLower.includes('기타');
          
          // 아침이 있으면 (태그 또는 제목에) 우선순위 1
          if (hasBreakfastTag || hasBreakfastInTitle) {
            return 1;
          }
          
          // 점심이 있으면 (태그 또는 제목에) 우선순위 2
          if (hasLunchTag || hasLunchInTitle) {
            return 2;
          }
          
          // 저녁이 있으면 (태그 또는 제목에) 우선순위 3
          if (hasDinnerTag || hasDinnerInTitle) {
            return 3;
          }
          
          // 회식이 있으면 (태그 또는 제목에)
          if (hasCompanyDinnerTag || hasCompanyDinnerInTitle) {
            // 저녁 이벤트가 있으면 우선순위 4, 없으면 우선순위 3
            return hasDinnerEvent ? 4 : 3;
          }
          
          // 기타가 있으면 (태그 또는 제목에) 우선순위 5
          if (hasOtherTag || hasOtherInTitle) {
            return 5;
          }
          
          // 그 외는 우선순위 0
          return 0;
        };
        
        const priorityA = getEventTypePriority(a);
        const priorityB = getEventTypePriority(b);
        
        // 1. 타입 우선순위 (아침=1, 점심=2, 저녁=3, 회식=3 또는 4, 기타=5, 기타=0)
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
      }
      
      // 식단 정렬 옵션이 비활성화된 경우 또는 같은 타입 내에서: 기존 정렬 방식
      // 1. 제목 순서
      if (a.title !== b.title) {
        return a.title.localeCompare(b.title);
      }
      
      // 2. 색상 순서
      if (a.color !== b.color) {
        return (a.color || '').localeCompare(b.color || '');
      }
      
      // 3. ID 순서 (최종 정렬 기준)
      return (a.id || '').localeCompare(b.id || '');
    });
  };

  // 특정 날짜에서 일정의 행 인덱스 계산
  const getEventRowIndex = (event: CalendarEvent, date: Date): number => {
    const dayEvents = getEventsForDate(date);
    const sortedEvents = sortEvents(dayEvents);
    return sortedEvents.findIndex(e => e.id === event.id);
  };

  // 필터링 없이 특정 날짜의 모든 일정 가져오기 (연속성 확인용)
  const getAllEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });
  };

  // 같은 일정이 연속된 날짜에 있는지 확인하고 위치 반환 (행 인덱스 고려)
  const getEventContinuity = (event: CalendarEvent, currentDate: Date, rowIndex: number) => {
    const eventDate = new Date(event.date);
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // 같은 일정 판단 기준: recurringGroupId가 같거나, 같은 제목과 색상
    const isSameEvent = (e: CalendarEvent) => {
      if (event.recurringGroupId && e.recurringGroupId) {
        return event.recurringGroupId === e.recurringGroupId;
      }
      return e.title === event.title && e.color === event.color;
    };

    // recurringGroupId가 있으면 행 위치와 관계없이 같은 그룹의 일정 찾기 (필터링 없이)
    if (event.recurringGroupId) {
      // 이전 날짜에 같은 그룹의 일정이 있는지 확인
      const prevDayEvents = getAllEventsForDate(prevDate);
      const hasPrev = prevDayEvents.some(e => e.recurringGroupId === event.recurringGroupId);
      
      // 다음 날짜에 같은 그룹의 일정이 있는지 확인
      const nextDayEvents = getAllEventsForDate(nextDate);
      const hasNext = nextDayEvents.some(e => e.recurringGroupId === event.recurringGroupId);
      
      if (hasPrev && hasNext) {
        return 'middle'; // 중간
      } else if (hasPrev) {
        return 'end'; // 끝
      } else if (hasNext) {
        return 'start'; // 시작
      } else {
        return 'single'; // 단일
      }
    }

    // recurringGroupId가 없으면 같은 행 인덱스에 있는지 확인
    const prevDayEvents = getEventsForDate(prevDate);
    const prevSortedEvents = sortEvents(prevDayEvents);
    const prevEventAtSameRow = prevSortedEvents[rowIndex];
    const hasPrev = prevEventAtSameRow && isSameEvent(prevEventAtSameRow);

    const nextDayEvents = getEventsForDate(nextDate);
    const nextSortedEvents = sortEvents(nextDayEvents);
    const nextEventAtSameRow = nextSortedEvents[rowIndex];
    const hasNext = nextEventAtSameRow && isSameEvent(nextEventAtSameRow);

    if (hasPrev && hasNext) {
      return 'middle'; // 중간
    } else if (hasPrev) {
      return 'end'; // 끝
    } else if (hasNext) {
      return 'start'; // 시작
    } else {
      return 'single'; // 단일
    }
  };

  // 특정 날짜의 상태별 통계
  const getStatusStatsForDate = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    
    let todo = 0;
    let inProgress = 0;
    let done = 0;
    let noStatus = 0;
    
    dayEvents.forEach(event => {
      if (!event.status) {
        noStatus++;
      } else if (event.status === 'todo') {
        todo++;
      } else if (event.status === 'in_progress') {
        inProgress++;
      } else if (event.status === 'done') {
        done++;
      }
    });
    
    return { todo, inProgress, done, noStatus };
  };

  return (
    <table className="w-full border-collapse table-fixed">
      <thead>
        <tr>
          {weekDays.map((day, index) => (
            <th
              key={day}
              className={`w-[14.28%] p-3 text-center font-semibold text-sm border border-gray-200 dark:border-gray-700 ${
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
                  className={`w-[14.28%] h-24 border border-gray-200 dark:border-gray-700 p-0 align-top relative ${
                    !date ? 'bg-gray-50 dark:bg-gray-900/50' : 
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                  } ${
                    dayIndex === 0 ? 'text-red-600 dark:text-red-400' : 
                    dayIndex === 6 ? 'text-blue-600 dark:text-blue-400' : 
                    'text-gray-900 dark:text-white'
                  }`}
                  onClick={() => date && onDateClick(date)}
                >
                  {date && (() => {
                    const dateStats = getStatusStatsForDate(date);
                    const dateTotal = dateStats.todo + dateStats.inProgress + dateStats.done + dateStats.noStatus;
                    return (
                      <div className="h-full flex flex-col p-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`text-sm font-medium relative ${
                            isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                          }`}>
                            {date.getDate()}
                            {isToday && (
                              <span className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                            )}
                          </div>
                          {dateTotal > 0 && (
                            <div className="flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                              <span className={dateStats.todo > 0 ? 'text-red-600 dark:text-red-400 font-medium' : ''}>{dateStats.todo}</span>
                              <span>/</span>
                              <span className={dateStats.inProgress > 0 ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''}>{dateStats.inProgress}</span>
                              <span>/</span>
                              <span className={dateStats.done > 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>{dateStats.done}</span>
                              <span>/</span>
                              <span className={dateStats.noStatus > 0 ? 'text-gray-600 dark:text-gray-400 font-medium' : ''}>{dateStats.noStatus}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                          {(() => {
                            // 일정을 정렬하여 일관된 순서 유지
                            let sortedEvents = sortEvents(dayEvents);
                            
                            // recurringGroupId가 있는 일정들을 시작일의 행 인덱스에 맞춰 재정렬
                            const groupStartRowMap = new Map<string, number>();
                            
                            // 각 그룹의 시작일과 행 인덱스 찾기
                            sortedEvents.forEach((event) => {
                              if (event.recurringGroupId && !groupStartRowMap.has(event.recurringGroupId)) {
                                // 같은 그룹의 모든 일정 찾기
                                const groupEvents = events.filter(e => e.recurringGroupId === event.recurringGroupId);
                                // 가장 이른 날짜 찾기
                                const startEvent = groupEvents.reduce((earliest, e) => {
                                  const eDate = new Date(e.date);
                                  const earliestDate = new Date(earliest.date);
                                  return eDate < earliestDate ? e : earliest;
                                }, groupEvents[0]);
                                
                                // 시작일의 행 인덱스 찾기 (필터링 없이)
                                const startDayEvents = getAllEventsForDate(new Date(startEvent.date));
                                const startDaySorted = sortEvents(startDayEvents);
                                const startRowIndex = startDaySorted.findIndex(e => e.id === startEvent.id);
                                
                                groupStartRowMap.set(event.recurringGroupId, startRowIndex >= 0 ? startRowIndex : 999);
                              }
                            });
                            
                            // 그룹 일정들을 시작일의 행 인덱스에 맞춰 재정렬
                            // 그룹 일정이 아닌 일정들을 먼저 정렬하고, 그룹 일정을 시작일의 행 인덱스 위치에 정확히 배치
                            const nonGroupEvents = sortedEvents.filter(e => !e.recurringGroupId);
                            const groupEvents = sortedEvents.filter(e => e.recurringGroupId);
                            
                            // 그룹 일정들을 시작일의 행 인덱스 순서로 정렬
                            const sortedGroupEvents = groupEvents.sort((a, b) => {
                              const aRow = groupStartRowMap.get(a.recurringGroupId!) ?? 999;
                              const bRow = groupStartRowMap.get(b.recurringGroupId!) ?? 999;
                              return aRow - bRow;
                            });
                            
                            // 최종 정렬: 그룹 일정을 시작일의 행 인덱스 위치에 정확히 배치
                            // 예: 시작일의 행 인덱스가 2면, 3번째 줄(인덱스 2)에 정확히 배치
                            const finalSorted: CalendarEvent[] = [];
                            const usedRows = new Set<number>();
                            
                            // 먼저 그룹 일정을 시작일의 행 인덱스 위치에 배치
                            sortedGroupEvents.forEach(groupEvent => {
                              const targetRow = groupStartRowMap.get(groupEvent.recurringGroupId!) ?? 999;
                              // 해당 행 인덱스에 배치 (다른 일정이 있어도 그룹 일정이 우선)
                              while (finalSorted.length < targetRow) {
                                finalSorted.push(null as any); // 빈 슬롯
                              }
                              finalSorted[targetRow] = groupEvent;
                              usedRows.add(targetRow);
                            });
                            
                            // 그룹 일정이 아닌 일정들을 빈 자리에 배치
                            let nonGroupIndex = 0;
                            for (let i = 0; i < Math.max(finalSorted.length, nonGroupEvents.length); i++) {
                              if (i < finalSorted.length && finalSorted[i] === null) {
                                // 빈 자리에 일반 일정 배치
                                if (nonGroupIndex < nonGroupEvents.length) {
                                  finalSorted[i] = nonGroupEvents[nonGroupIndex];
                                  nonGroupIndex++;
                                }
                              } else if (i >= finalSorted.length) {
                                // 추가 자리에 일반 일정 배치
                                if (nonGroupIndex < nonGroupEvents.length) {
                                  finalSorted.push(nonGroupEvents[nonGroupIndex]);
                                  nonGroupIndex++;
                                }
                              }
                            }
                            
                            // null 값 제거
                            sortedEvents = finalSorted.filter(e => e !== null);
                            
                            return sortedEvents.slice(0, 3).map((event, index) => {
                              const hasStatus = !!event.status;
                              const getStatusIcon = () => {
                                if (!hasStatus) return <FiMinus size={10} className="opacity-60" />;
                                if (event.status === 'done') return <FiCheckCircle size={10} />;
                                if (event.status === 'todo') return <FiSquare size={10} />;
                                return <FiCircle size={10} />; // in_progress
                              };
                              const titleParts: string[] = [];
                              if (hasStatus) {
                                titleParts.push(`상태: ${event.status === 'todo' ? '해야할일' : event.status === 'in_progress' ? '하는중' : '했던일'}`);
                              } else {
                                titleParts.push('상태 없음');
                              }
                              if (event.tags && event.tags.length > 0) {
                                titleParts.push(`태그: ${event.tags.join(', ')}`);
                              }
                              const isSelected = selectedEventIds.has(event.id);
                              const showCheckbox = onToggleEventSelect !== undefined;
                              // 같은 행 인덱스를 사용하여 연속성 확인
                              const continuity = getEventContinuity(event, date, index);
                            
                            // 연속성에 따른 스타일
                            const roundedClass = 
                              continuity === 'start' ? 'rounded-l' :
                              continuity === 'end' ? 'rounded-r' :
                              continuity === 'middle' ? '' :
                              'rounded'; // single
                            
                            // 연속성에 따른 마진 조정
                            const marginClass = 
                              continuity === 'start' ? '' :
                              continuity === 'end' ? '' :
                              continuity === 'middle' ? '' :
                              ''; // single도 마진 없음
                            
                            // 연속된 일정의 경우 셀 경계까지 확장
                            // 내부 div의 p-2 (8px) 패딩을 고려하여 마진 조정
                            // 시작일과 끝일 모두 양쪽 경계까지 확장
                            // 단일 일정도 양쪽 경계까지 확장
                            const positionClass = 
                              continuity === 'start' ? '-mx-2' : // 시작일: 양쪽 패딩 제거 (왼쪽 경계까지 확장)
                              continuity === 'end' ? '-mx-2' : // 끝일: 양쪽 패딩 제거 (오른쪽 경계까지 확장)
                              continuity === 'middle' ? '-mx-2' : // 중간: 양쪽 패딩 제거로 연결
                              '-mx-2'; // single: 양쪽 패딩 제거로 셀 경계까지 확장
                            
                            return (
                              <div
                                key={event.id}
                                className={`text-xs px-1 py-0.5 ${roundedClass} ${positionClass} truncate flex items-center gap-1 group ${
                                  hasStatus ? '' : 'border border-dashed border-white/30'
                                } ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}
                                style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (showCheckbox && (e.target as HTMLElement).closest('.event-checkbox')) {
                                    return; // 체크박스 클릭은 별도 처리
                                  }
                                  onEventClick(event);
                                }}
                                title={titleParts.join(' | ')}
                              >
                                {showCheckbox && (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      if (onToggleEventSelect) {
                                        onToggleEventSelect(event.id);
                                      }
                                    }}
                                    className="event-checkbox w-5 h-5 rounded border-2 border-white bg-white/20 checked:bg-white text-blue-600 focus:ring-2 focus:ring-white cursor-pointer flex-shrink-0"
                                    style={{ minWidth: '20px', minHeight: '20px' }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                )}
                                {getStatusIcon()}
                                {event.tags && event.tags.length > 0 && (
                                  <FiTag size={10} className="flex-shrink-0" />
                                )}
                                <span className="truncate flex-1">{event.title}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('정말 이 일정을 삭제하시겠습니까?')) {
                                      onEventDelete(event.id);
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-white/20 rounded p-0.5"
                                  title="삭제"
                                >
                                  <FiX size={10} />
                                </button>
                              </div>
                            );
                            });
                          })()}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{dayEvents.length - 3}개 더
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
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
  onEventDelete: (eventId: string) => void;
  isMealOrderEnabled?: boolean;
}

function WeekView({ currentDate, events, onDateClick, onEventClick, onEventDelete, isMealOrderEnabled = false }: WeekViewProps) {
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

  // 일정 정렬 함수 (식단 정렬 옵션에 따라 다르게 정렬)
  const sortEvents = (events: CalendarEvent[]): CalendarEvent[] => {
    return [...events].sort((a, b) => {
      // 식단 정렬 옵션이 활성화된 경우: 아침 → 점심 → 저녁 → 회식 → 기타 순서
      if (isMealOrderEnabled) {
        // 먼저 같은 날짜에 저녁 이벤트가 있는지 확인
        const hasDinnerEvent = events.some(event => {
          const hasDinnerTag = event.tags?.includes('저녁') || false;
          const titleLower = event.title.toLowerCase();
          const hasDinnerInTitle = titleLower.includes('저녁');
          return hasDinnerTag || hasDinnerInTitle;
        });
        
        // 이벤트의 타입 우선순위 계산 함수
        const getEventTypePriority = (event: CalendarEvent): number => {
          const hasBreakfastTag = event.tags?.includes('아침') || false;
          const hasLunchTag = event.tags?.includes('점심') || false;
          const hasDinnerTag = event.tags?.includes('저녁') || false;
          const hasCompanyDinnerTag = event.tags?.includes('회식') || false;
          const hasOtherTag = event.tags?.includes('기타') || false;
          const titleLower = event.title.toLowerCase();
          const hasBreakfastInTitle = titleLower.includes('아침');
          const hasLunchInTitle = titleLower.includes('점심');
          const hasDinnerInTitle = titleLower.includes('저녁');
          const hasCompanyDinnerInTitle = titleLower.includes('회식');
          const hasOtherInTitle = titleLower.includes('기타');
          
          // 아침이 있으면 (태그 또는 제목에) 우선순위 1
          if (hasBreakfastTag || hasBreakfastInTitle) {
            return 1;
          }
          
          // 점심이 있으면 (태그 또는 제목에) 우선순위 2
          if (hasLunchTag || hasLunchInTitle) {
            return 2;
          }
          
          // 저녁이 있으면 (태그 또는 제목에) 우선순위 3
          if (hasDinnerTag || hasDinnerInTitle) {
            return 3;
          }
          
          // 회식이 있으면 (태그 또는 제목에)
          if (hasCompanyDinnerTag || hasCompanyDinnerInTitle) {
            // 저녁 이벤트가 있으면 우선순위 4, 없으면 우선순위 3
            return hasDinnerEvent ? 4 : 3;
          }
          
          // 기타가 있으면 (태그 또는 제목에) 우선순위 5
          if (hasOtherTag || hasOtherInTitle) {
            return 5;
          }
          
          // 그 외는 우선순위 0
          return 0;
        };
        
        const priorityA = getEventTypePriority(a);
        const priorityB = getEventTypePriority(b);
        
        // 1. 타입 우선순위 (아침=1, 점심=2, 저녁=3, 회식=3 또는 4, 기타=5, 기타=0)
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
      }
      
      // 식단 정렬 옵션이 비활성화된 경우 또는 같은 타입 내에서: 기존 정렬 방식
      // 1. 제목 순서
      if (a.title !== b.title) {
        return a.title.localeCompare(b.title);
      }
      
      // 2. 색상 순서
      if (a.color !== b.color) {
        return (a.color || '').localeCompare(b.color || '');
      }
      
      // 3. ID 순서 (최종 정렬 기준)
      return (a.id || '').localeCompare(b.id || '');
    });
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((date, index) => {
        const isToday = date.getFullYear() === today.getFullYear() &&
                        date.getMonth() === today.getMonth() &&
                        date.getDate() === today.getDate();
        const dayEvents = sortEvents(getEventsForDate(date));

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
              {dayEvents.map(event => {
                const hasStatus = !!event.status;
                const getStatusIcon = () => {
                  if (!hasStatus) return <FiMinus size={12} className="opacity-60" />;
                  if (event.status === 'done') return <FiCheckCircle size={12} />;
                  if (event.status === 'todo') return <FiSquare size={12} />;
                  return <FiCircle size={12} />; // in_progress
                };
                return (
                  <div
                    key={event.id}
                    className={`text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 flex items-start gap-1.5 ${
                      hasStatus ? '' : 'border border-dashed border-white/30'
                    }`}
                    style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                    onClick={() => onEventClick(event)}
                    title={hasStatus ? `상태: ${event.status === 'todo' ? '해야할일' : event.status === 'in_progress' ? '하는중' : '했던일'}` : '상태 없음'}
                  >
                    <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{event.title}</div>
                      {event.description && (
                        <div className="text-xs opacity-90 truncate mt-0.5">{event.description}</div>
                      )}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('정말 이 일정을 삭제하시겠습니까?')) {
                          onEventDelete(event.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:bg-white/20 rounded p-0.5 flex-shrink-0"
                      title="삭제"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                );
              })}
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
  onEventDelete: (eventId: string) => void;
  isMealOrderEnabled?: boolean;
}

function DayView({ date, events, onDateClick, onEventClick, onEventDelete, isMealOrderEnabled = false }: DayViewProps) {
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

  // 일정 정렬 함수 (식단 정렬 옵션에 따라 다르게 정렬)
  const sortEvents = (events: CalendarEvent[]): CalendarEvent[] => {
    return [...events].sort((a, b) => {
      // 식단 정렬 옵션이 활성화된 경우: 아침 → 점심 → 저녁 → 회식 → 기타 순서
      if (isMealOrderEnabled) {
        // 먼저 같은 날짜에 저녁 이벤트가 있는지 확인
        const hasDinnerEvent = events.some(event => {
          const hasDinnerTag = event.tags?.includes('저녁') || false;
          const titleLower = event.title.toLowerCase();
          const hasDinnerInTitle = titleLower.includes('저녁');
          return hasDinnerTag || hasDinnerInTitle;
        });
        
        // 이벤트의 타입 우선순위 계산 함수
        const getEventTypePriority = (event: CalendarEvent): number => {
          const hasBreakfastTag = event.tags?.includes('아침') || false;
          const hasLunchTag = event.tags?.includes('점심') || false;
          const hasDinnerTag = event.tags?.includes('저녁') || false;
          const hasCompanyDinnerTag = event.tags?.includes('회식') || false;
          const hasOtherTag = event.tags?.includes('기타') || false;
          const titleLower = event.title.toLowerCase();
          const hasBreakfastInTitle = titleLower.includes('아침');
          const hasLunchInTitle = titleLower.includes('점심');
          const hasDinnerInTitle = titleLower.includes('저녁');
          const hasCompanyDinnerInTitle = titleLower.includes('회식');
          const hasOtherInTitle = titleLower.includes('기타');
          
          // 아침이 있으면 (태그 또는 제목에) 우선순위 1
          if (hasBreakfastTag || hasBreakfastInTitle) {
            return 1;
          }
          
          // 점심이 있으면 (태그 또는 제목에) 우선순위 2
          if (hasLunchTag || hasLunchInTitle) {
            return 2;
          }
          
          // 저녁이 있으면 (태그 또는 제목에) 우선순위 3
          if (hasDinnerTag || hasDinnerInTitle) {
            return 3;
          }
          
          // 회식이 있으면 (태그 또는 제목에)
          if (hasCompanyDinnerTag || hasCompanyDinnerInTitle) {
            // 저녁 이벤트가 있으면 우선순위 4, 없으면 우선순위 3
            return hasDinnerEvent ? 4 : 3;
          }
          
          // 기타가 있으면 (태그 또는 제목에) 우선순위 5
          if (hasOtherTag || hasOtherInTitle) {
            return 5;
          }
          
          // 그 외는 우선순위 0
          return 0;
        };
        
        const priorityA = getEventTypePriority(a);
        const priorityB = getEventTypePriority(b);
        
        // 1. 타입 우선순위 (아침=1, 점심=2, 저녁=3, 회식=3 또는 4, 기타=5, 기타=0)
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
      }
      
      // 식단 정렬 옵션이 비활성화된 경우 또는 같은 타입 내에서: 기존 정렬 방식
      // 1. 제목 순서
      if (a.title !== b.title) {
        return a.title.localeCompare(b.title);
      }
      
      // 2. 색상 순서
      if (a.color !== b.color) {
        return (a.color || '').localeCompare(b.color || '');
      }
      
      // 3. ID 순서 (최종 정렬 기준)
      return (a.id || '').localeCompare(b.id || '');
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
          const hourEvents = sortEvents(getEventsForHour(hour));
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
                    hourEvents.map(event => {
                      const hasStatus = !!event.status;
                      const getStatusIcon = () => {
                        if (!hasStatus) return <FiMinus size={14} className="opacity-60" />;
                        if (event.status === 'done') return <FiCheckCircle size={14} />;
                        if (event.status === 'todo') return <FiSquare size={14} />;
                        return <FiCircle size={14} />; // in_progress
                      };
                      return (
                        <div
                          key={event.id}
                          className={`px-3 py-2 rounded cursor-pointer hover:opacity-80 flex items-start gap-2 ${
                            hasStatus ? '' : 'border border-dashed border-white/30'
                          }`}
                          style={{ backgroundColor: event.color || '#3b82f6', color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          title={hasStatus ? `상태: ${event.status === 'todo' ? '해야할일' : event.status === 'in_progress' ? '하는중' : '했던일'}` : '상태 없음'}
                        >
                          <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{event.title}</div>
                            {event.description && (
                              <div className="text-sm opacity-90 mt-1">{event.description}</div>
                            )}
                            {event.tags && event.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {event.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-1.5 py-0.5 bg-white/20 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
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

