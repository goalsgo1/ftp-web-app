/**
 * 기능 이름을 뉴스 카테고리로 매핑하는 유틸리티
 */

type NewsCategory = 'IT' | '경제' | '정치' | '사회' | '기타';

/**
 * 기능 이름에서 뉴스 카테고리를 추론
 */
export function inferNewsCategoriesFromFeatureName(featureName: string): NewsCategory[] {
  const name = featureName.toLowerCase();
  
  // 정치 관련
  if (name.includes('정치') || name.includes('선거') || name.includes('국회') || name.includes('정당')) {
    return ['정치'];
  }
  
  // 경제 관련
  if (name.includes('주식') || name.includes('증권') || name.includes('유가') || 
      name.includes('경제') || name.includes('금융') || name.includes('투자') || 
      name.includes('부동산') || name.includes('코인') || name.includes('비트코인')) {
    return ['경제'];
  }
  
  // IT 관련
  if (name.includes('it') || name.includes('ai') || name.includes('인공지능') || 
      name.includes('기술') || name.includes('스마트') || name.includes('디지털') ||
      name.includes('소프트웨어') || name.includes('하드웨어') || name.includes('개발') ||
      name.includes('프로그래밍') || name.includes('코딩') || name.includes('앱') ||
      name.includes('게임') || name.includes('전자')) {
    return ['IT'];
  }
  
  // 사회 관련
  if (name.includes('사회') || name.includes('교육') || name.includes('의료') ||
      name.includes('건강') || name.includes('환경') || name.includes('교통') ||
      name.includes('날씨') || name.includes('재난') || name.includes('사고')) {
    return ['사회'];
  }
  
  // 연예계 관련
  if (name.includes('연예') || name.includes('엔터테인먼트') || name.includes('예능') ||
      name.includes('가수') || name.includes('배우') || name.includes('영화') ||
      name.includes('드라마') || name.includes('음악') || name.includes('k-pop')) {
    return ['기타']; // 연예는 아직 별도 카테고리가 없음
  }
  
  // 스포츠 관련
  if (name.includes('스포츠') || name.includes('야구') || name.includes('축구') ||
      name.includes('농구') || name.includes('배구') || name.includes('골프')) {
    return ['기타'];
  }
  
  // 기본값: 모든 카테고리
  return ['IT', '경제', '정치', '사회'];
}

/**
 * 기능 이름과 설명을 기반으로 뉴스 카테고리 추론 (더 정확)
 */
export function inferNewsCategoriesFromFeature(
  featureName: string, 
  description?: string
): NewsCategory[] {
  const text = `${featureName} ${description || ''}`.toLowerCase();
  
  // 카테고리별 키워드 매칭 (우선순위 순)
  const categoryKeywords: Record<NewsCategory, string[]> = {
    '정치': ['정치', '선거', '국회', '정당', '의원', '대통령', '정부', '국회의원'],
    '경제': ['주식', '증권', '유가', '경제', '금융', '투자', '부동산', '코인', '비트코인', '환율', '금리'],
    'IT': ['it', 'ai', '인공지능', '기술', '스마트', '디지털', '소프트웨어', '하드웨어', '개발', '프로그래밍', '코딩', '앱', '게임', '전자'],
    '사회': ['사회', '교육', '의료', '건강', '환경', '교통', '날씨', '재난', '사고', '범죄'],
    '기타': ['연예', '엔터테인먼트', '예능', '가수', '배우', '영화', '드라마', '음악', '스포츠'],
  };
  
  // 각 카테고리별로 매칭되는 키워드 수 계산
  const categoryScores: Record<NewsCategory, number> = {
    'IT': 0,
    '경제': 0,
    '정치': 0,
    '사회': 0,
    '기타': 0,
  };
  
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        categoryScores[category as NewsCategory]++;
      }
    });
  });
  
  // 가장 높은 점수의 카테고리 찾기
  const maxScore = Math.max(...Object.values(categoryScores));
  
  if (maxScore === 0) {
    // 매칭되는 키워드가 없으면 모든 카테고리 반환
    return ['IT', '경제', '정치', '사회'];
  }
  
  // 가장 높은 점수의 카테고리들 반환
  const matchedCategories = Object.entries(categoryScores)
    .filter(([_, score]) => score === maxScore)
    .map(([category]) => category as NewsCategory);
  
  return matchedCategories;
}

