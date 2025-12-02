// 주요 국가/도시의 시간대 정보
export interface TimezoneInfo {
  timezone: string; // IANA 시간대 (예: 'Asia/Seoul')
  label: string; // 표시 이름 (예: '서울, 한국')
  country: string; // 국가 코드
  flag: string; // 이모지 플래그
}

export const TIMEZONES: TimezoneInfo[] = [
  // 아시아
  { timezone: 'Asia/Seoul', label: '서울, 한국', country: 'KR', flag: '🇰🇷' },
  { timezone: 'Asia/Tokyo', label: '도쿄, 일본', country: 'JP', flag: '🇯🇵' },
  { timezone: 'Asia/Shanghai', label: '베이징, 중국', country: 'CN', flag: '🇨🇳' },
  { timezone: 'Asia/Hong_Kong', label: '홍콩', country: 'HK', flag: '🇭🇰' },
  { timezone: 'Asia/Singapore', label: '싱가포르', country: 'SG', flag: '🇸🇬' },
  { timezone: 'Asia/Bangkok', label: '방콕, 태국', country: 'TH', flag: '🇹🇭' },
  { timezone: 'Asia/Manila', label: '마닐라, 필리핀', country: 'PH', flag: '🇵🇭' },
  { timezone: 'Asia/Jakarta', label: '자카르타, 인도네시아', country: 'ID', flag: '🇮🇩' },
  { timezone: 'Asia/Kolkata', label: '뭄바이, 인도', country: 'IN', flag: '🇮🇳' },
  { timezone: 'Asia/Dubai', label: '두바이, UAE', country: 'AE', flag: '🇦🇪' },
  
  // 유럽
  { timezone: 'Europe/London', label: '런던, 영국', country: 'GB', flag: '🇬🇧' },
  { timezone: 'Europe/Paris', label: '파리, 프랑스', country: 'FR', flag: '🇫🇷' },
  { timezone: 'Europe/Berlin', label: '베를린, 독일', country: 'DE', flag: '🇩🇪' },
  { timezone: 'Europe/Rome', label: '로마, 이탈리아', country: 'IT', flag: '🇮🇹' },
  { timezone: 'Europe/Madrid', label: '마드리드, 스페인', country: 'ES', flag: '🇪🇸' },
  { timezone: 'Europe/Amsterdam', label: '암스테르담, 네덜란드', country: 'NL', flag: '🇳🇱' },
  { timezone: 'Europe/Moscow', label: '모스크바, 러시아', country: 'RU', flag: '🇷🇺' },
  
  // 아메리카
  { timezone: 'America/New_York', label: '뉴욕, 미국', country: 'US', flag: '🇺🇸' },
  { timezone: 'America/Chicago', label: '시카고, 미국', country: 'US', flag: '🇺🇸' },
  { timezone: 'America/Denver', label: '덴버, 미국', country: 'US', flag: '🇺🇸' },
  { timezone: 'America/Los_Angeles', label: '로스앤젤레스, 미국', country: 'US', flag: '🇺🇸' },
  { timezone: 'America/Toronto', label: '토론토, 캐나다', country: 'CA', flag: '🇨🇦' },
  { timezone: 'America/Mexico_City', label: '멕시코시티, 멕시코', country: 'MX', flag: '🇲🇽' },
  { timezone: 'America/Sao_Paulo', label: '상파울루, 브라질', country: 'BR', flag: '🇧🇷' },
  { timezone: 'America/Buenos_Aires', label: '부에노스아이레스, 아르헨티나', country: 'AR', flag: '🇦🇷' },
  
  // 오세아니아
  { timezone: 'Australia/Sydney', label: '시드니, 호주', country: 'AU', flag: '🇦🇺' },
  { timezone: 'Australia/Melbourne', label: '멜버른, 호주', country: 'AU', flag: '🇦🇺' },
  { timezone: 'Pacific/Auckland', label: '오클랜드, 뉴질랜드', country: 'NZ', flag: '🇳🇿' },
];

// 시간대별로 그룹화
export const TIMEZONES_BY_REGION = {
  asia: TIMEZONES.filter(tz => tz.timezone.startsWith('Asia')),
  europe: TIMEZONES.filter(tz => tz.timezone.startsWith('Europe')),
  america: TIMEZONES.filter(tz => tz.timezone.startsWith('America')),
  oceania: TIMEZONES.filter(tz => tz.timezone.startsWith('Australia') || tz.timezone.startsWith('Pacific')),
};

// 시간대 정보 가져오기
export const getTimezoneInfo = (timezone: string): TimezoneInfo | undefined => {
  return TIMEZONES.find(tz => tz.timezone === timezone);
};

// 특정 시간대의 현재 시간 가져오기
// Date 객체는 시간대 정보를 저장하지 않으므로, 현재 시간을 반환하고
// 표시할 때 formatTime, formatDate 함수에서 시간대를 적용
export const getCurrentTime = (timezone: string): Date => {
  return new Date(); // 현재 시간 반환 (표시 시 시간대 적용)
};

// 시간 포맷팅 (정확한 시간대 사용)
export const formatTime = (date: Date, timezone: string): string => {
  return date.toLocaleString('ko-KR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

// 날짜 포맷팅 (정확한 시간대 사용)
export const formatDate = (date: Date, timezone: string): string => {
  return date.toLocaleString('ko-KR', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

