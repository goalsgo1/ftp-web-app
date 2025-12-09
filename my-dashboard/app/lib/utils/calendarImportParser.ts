/**
 * 메모장에서 캘린더로 가져오기 위한 파서
 * 다양한 형식의 텍스트를 파싱하여 CalendarEvent 배열로 변환
 */

export interface ParsedCalendarEvent {
  title: string;
  date: Date;
  description?: string;
  tags?: string[];
  status?: 'todo' | 'in_progress' | 'done';
  color?: string;
}

export interface ParseResult {
  events: ParsedCalendarEvent[];
  errors: string[];
  warnings: string[];
}

/**
 * 메모 텍스트를 파싱하여 일정 배열로 변환
 */
export function parseMemoToCalendarEvents(text: string): ParseResult {
  const events: ParsedCalendarEvent[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const lines = text.split('\n').map(line => line.trim());
  const currentYear = new Date().getFullYear();

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 빈 줄 건너뛰기
    if (!line) {
      i++;
      continue;
    }

    // 날짜 줄 찾기
    const dateMatch = line.match(/^(\d{4}[-./]?\d{1,2}[-./]?\d{1,2}|\d{1,2}[-./]\d{1,2})(\s*[~-]\s*(\d{4}[-./]?\d{1,2}[-./]?\d{1,2}|\d{1,2}[-./]\d{1,2}))?/);
    
    if (dateMatch) {
      try {
        // 날짜 범위 처리
        if (dateMatch[2]) {
          // 날짜 범위 형식: 2025-12-10 ~ 2025-12-15 제목
          const startDateStr = dateMatch[1];
          const endDateStr = dateMatch[3] || dateMatch[1];
          
          const startDate = parseDate(startDateStr, currentYear);
          const endDate = parseDate(endDateStr, currentYear);

          if (!startDate || !endDate) {
            errors.push(`날짜 파싱 실패: ${line}`);
            i++;
            continue;
          }

          // 제목, 태그, 상태 추출
          const restOfLine = line.substring(dateMatch[0].length).trim();
          const { title, tags, status } = parseTitleTagsStatus(restOfLine);

          // 설명 추출
          const description = extractDescription(lines, i + 1);

          // 날짜 범위의 모든 날짜에 일정 생성
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            // 태그 기반 색상 우선 적용 (메뉴 로그용)
            const tagColor = tags.length > 0 ? getColorByTags(tags) : undefined;
            const finalColor = tagColor || getColorByStatus(status);

            events.push({
              title,
              date: new Date(currentDate),
              description,
              tags,
              status,
              color: finalColor,
            });
            currentDate.setDate(currentDate.getDate() + 1);
          }

          // 다음 날짜 줄까지 건너뛰기
          i = findNextDateLine(lines, i + 1);
        } else {
          // 단일 날짜 형식
          const dateStr = dateMatch[1];
          const date = parseDate(dateStr, currentYear);

          if (!date) {
            errors.push(`날짜 파싱 실패: ${line}`);
            i++;
            continue;
          }

          // 제목, 태그, 상태 추출
          const restOfLine = line.substring(dateMatch[0].length).trim();
          const { title, tags, status } = parseTitleTagsStatus(restOfLine);

          // 설명 추출
          const description = extractDescription(lines, i + 1);

          // 태그 기반 색상 우선 적용 (메뉴 로그용)
          const tagColor = tags.length > 0 ? getColorByTags(tags) : undefined;
          const finalColor = tagColor || getColorByStatus(status);

          events.push({
            title,
            date,
            description,
            tags,
            status,
            color: finalColor,
          });

          // 다음 날짜 줄까지 건너뛰기
          i = findNextDateLine(lines, i + 1);
        }
      } catch (error) {
        errors.push(`파싱 오류 (${line}): ${error instanceof Error ? error.message : String(error)}`);
        i++;
      }
    } else {
      // 날짜가 없는 줄은 건너뛰기 (설명으로 인식되지 않은 경우)
      i++;
    }
  }

  return { events, errors, warnings };
}

/**
 * 날짜 문자열을 Date 객체로 변환
 */
function parseDate(dateStr: string, currentYear: number): Date | null {
  // 다양한 날짜 형식 지원
  const formats = [
    /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/,  // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
    /^(\d{1,2})[-./](\d{1,2})$/,              // MM-DD, MM/DD (올해로 설정)
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (match.length === 4) {
        // YYYY-MM-DD 형식
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // 0-based
        const day = parseInt(match[3], 10);
        return new Date(year, month, day);
      } else if (match.length === 3) {
        // MM-DD 형식 (올해로 설정)
        const month = parseInt(match[1], 10) - 1; // 0-based
        const day = parseInt(match[2], 10);
        return new Date(currentYear, month, day);
      }
    }
  }

  return null;
}

/**
 * 제목에서 태그와 상태 추출
 */
function parseTitleTagsStatus(text: string): {
  title: string;
  tags: string[];
  status?: 'todo' | 'in_progress' | 'done';
} {
  let title = text;
  const tags: string[] = [];
  let status: 'todo' | 'in_progress' | 'done' | undefined;

  // 태그 추출 (#태그명)
  const tagRegex = /#(\S+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(text)) !== null) {
    tags.push(tagMatch[1]);
    title = title.replace(tagMatch[0], '').trim();
  }

  // 상태 추출 ([todo], [in_progress], [done], [진행중], [완료])
  const statusRegex = /\[(todo|in_progress|done|진행중|완료)\]/i;
  const statusMatch = text.match(statusRegex);
  if (statusMatch) {
    const statusStr = statusMatch[1].toLowerCase();
    if (statusStr === 'todo') {
      status = 'todo';
    } else if (statusStr === 'in_progress' || statusStr === '진행중') {
      status = 'in_progress';
    } else if (statusStr === 'done' || statusStr === '완료') {
      status = 'done';
    }
    title = title.replace(statusMatch[0], '').trim();
  }

  return { title, tags, status };
}

/**
 * 설명 추출 (날짜 줄 다음의 들여쓰기된 줄들)
 */
function extractDescription(lines: string[], startIndex: number): string | undefined {
  const descriptionLines: string[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];

    // 빈 줄이면 중단
    if (!line) {
      break;
    }

    // 날짜 줄이면 중단
    if (line.match(/^\d{4}[-./]?\d{1,2}[-./]?\d{1,2}/) || line.match(/^\d{1,2}[-./]\d{1,2}/)) {
      break;
    }

    // 들여쓰기 또는 리스트 마커로 시작하는 줄만 설명으로 인식
    if (line.match(/^[\s\-*•\d.]/)) {
      descriptionLines.push(line.replace(/^[\s\-*•\d.]+/, '').trim());
    } else {
      // 들여쓰기가 없는 줄은 설명이 아닐 수 있음
      break;
    }

    i++;
  }

  return descriptionLines.length > 0 ? descriptionLines.join('\n') : undefined;
}

/**
 * 다음 날짜 줄 찾기
 */
function findNextDateLine(lines: string[], startIndex: number): number {
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^\d{4}[-./]?\d{1,2}[-./]?\d{1,2}/) || line.match(/^\d{1,2}[-./]\d{1,2}/)) {
      return i;
    }
  }
  return lines.length;
}

/**
 * 상태에 따른 색상 반환
 */
function getColorByStatus(status?: 'todo' | 'in_progress' | 'done'): string | undefined {
  if (status === 'todo') return '#ef4444'; // 빨간색
  if (status === 'in_progress') return '#f59e0b'; // 노란색
  if (status === 'done') return '#10b981'; // 초록색
  return undefined;
}

/**
 * 태그에 따른 색상 반환 (메뉴 로그용)
 */
function getColorByTags(tags: string[]): string | undefined {
  // 회식 태그가 있으면 분홍색
  if (tags.includes('회식')) return '#ec4899'; // 분홍색
  
  // 저녁 태그가 있으면 보라색
  if (tags.includes('저녁')) return '#8b5cf6'; // 보라색
  
  // 점심 태그가 있으면 파란색
  if (tags.includes('점심')) return '#3b82f6'; // 파란색
  
  // 아침 태그가 있으면 주황색
  if (tags.includes('아침')) return '#f97316'; // 주황색
  
  // 기타 태그가 있으면 회색
  if (tags.includes('기타')) return '#6b7280'; // 회색
  
  return undefined;
}

