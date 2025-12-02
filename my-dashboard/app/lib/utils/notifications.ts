// 브라우저 알림 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// 브라우저 알림 표시
export const showBrowserNotification = (
  title: string,
  options?: NotificationOptions
): Notification | null => {
  if (!('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('알림 권한이 없습니다.');
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    // 알림 클릭 시 포커스
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 자동 닫기 (기본 5초)
    if (options?.requireInteraction !== true) {
      setTimeout(() => {
        notification.close();
      }, options?.timeout || 5000);
    }

    return notification;
  } catch (error) {
    console.error('알림 표시 실패:', error);
    return null;
  }
};

// 시간 문자열을 Date 객체로 변환 (오늘 날짜 기준)
export const parseTimeString = (timeString: string, timezone: string): Date | null => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }

    // 현재 시간 가져오기
    const now = new Date();
    
    // 해당 시간대의 현재 날짜/시간 가져오기
    const timeInTimezone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    
    // 오늘 날짜에 설정한 시간 적용
    const targetTime = new Date(timeInTimezone);
    targetTime.setHours(hours, minutes, 0, 0);
    
    // UTC로 변환하여 반환
    return targetTime;
  } catch (error) {
    console.error('시간 파싱 실패:', error);
    return null;
  }
};

// 알림 시간 체크 (1분마다 체크)
export const checkNotificationTime = (
  alerts: Array<{ timezone: string; time: string; label?: string }>,
  onTrigger: (alert: { timezone: string; time: string; label?: string }) => void
): (() => void) => {
  let lastCheckedMinute = -1;

  const checkInterval = setInterval(() => {
    const now = new Date();
    const currentMinute = now.getMinutes();

    // 같은 분에 여러 번 체크하는 것 방지
    if (currentMinute === lastCheckedMinute) {
      return;
    }

    lastCheckedMinute = currentMinute;

    alerts.forEach(alert => {
      try {
        // 해당 시간대의 현재 시간 가져오기
        const timeInTimezone = now.toLocaleString('en-US', {
          timeZone: alert.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        const [currentHour, currentMinute] = timeInTimezone.split(':').map(Number);
        const [alertHour, alertMinute] = alert.time.split(':').map(Number);

        // 시간과 분이 일치하면 알림 트리거
        if (currentHour === alertHour && currentMinute === alertMinute) {
          onTrigger(alert);
        }
      } catch (error) {
        console.error('알림 시간 체크 실패:', error);
      }
    });
  }, 1000); // 1초마다 체크

  return () => clearInterval(checkInterval);
};

