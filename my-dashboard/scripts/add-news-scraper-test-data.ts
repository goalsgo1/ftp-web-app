// 뉴스 스크래퍼 기능 및 테스트 데이터를 추가하는 스크립트
// 브라우저 콘솔에서 실행하거나 API Route에서 사용

import { addFeature, getFeatures } from '@/lib/firebase/features';
import { addNewsArticle } from '@/lib/firebase/newsScraper';
import { getCurrentUser } from '@/lib/firebase';

// 뉴스 스크래퍼 기능 추가
export async function addNewsScraperFeature() {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      console.error('로그인이 필요합니다.');
      return null;
    }

    // 이미 등록되어 있는지 확인
    const existingFeatures = await getFeatures();
    const existingFeature = existingFeatures.find(
      f => f.url?.includes('news-scraper') || f.name === '뉴스 스크래퍼'
    );

    if (existingFeature) {
      console.log('뉴스 스크래퍼 기능이 이미 등록되어 있습니다. ID:', existingFeature.id);
      return existingFeature.id;
    }

    const featureId = await addFeature({
      name: '뉴스 스크래퍼',
      description: 'AI 기반 뉴스 자동 수집 및 분석 대시보드. 네이버, 다음 뉴스를 자동으로 수집하고 AI가 분석합니다.',
      category: '뉴스',
      url: '/features/news-scraper?id=news-scraper',
      isPublic: true,
      status: 'completed',
    }, user.uid);

    console.log('뉴스 스크래퍼 기능이 추가되었습니다. ID:', featureId);
    return featureId;
  } catch (error) {
    console.error('뉴스 스크래퍼 기능 추가 실패:', error);
    throw error;
  }
}

// 테스트 데이터 추가
export async function addNewsScraperTestData(featureId: string) {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      console.error('로그인이 필요합니다.');
      return;
    }

    const now = new Date();
    const testArticles = [
      {
        featureId,
        userId: user.uid,
        title: 'AI 기술 발전으로 산업 전반에 변화 예상',
        url: 'https://example.com/news/ai-tech-development',
        content: '최근 AI 기술의 급속한 발전으로 산업 전반에 큰 변화가 예상되고 있습니다. 특히 제조업과 서비스업에서 AI 도입이 가속화되고 있으며, 전문가들은 향후 5년 내 대부분의 기업이 AI 기술을 도입할 것으로 예측하고 있습니다. 이에 따라 AI 관련 투자도 급증하고 있으며, 정부도 AI 산업 육성을 위한 정책을 마련하고 있습니다.',
        source: 'naver' as const,
        originalCategory: 'IT',
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2시간 전
        author: '기자 홍길동',
        summary: 'AI 기술 발전이 산업 전반에 큰 변화를 가져올 것으로 예상됩니다. 제조업과 서비스업에서 AI 도입이 가속화되고 있으며, 정부도 AI 산업 육성 정책을 마련하고 있습니다.',
        keywords: ['AI', '기술', '산업', '제조업', '정책'],
        refinedCategory: 'IT' as const,
        sentiment: '긍정' as const,
        importanceScore: 8.5,
        entities: {
          people: ['홍길동'],
          organizations: ['정부'],
          locations: ['한국'],
        },
        oneLiner: 'AI 산업 전환 가속화, 정부 정책 지원 확대',
        scrapedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1시간 전
        analyzedAt: new Date(now.getTime() - 50 * 60 * 1000), // 50분 전
        contentHash: 'hash_ai_tech_001',
      },
      {
        featureId,
        userId: user.uid,
        title: '코로나19 이후 경제 회복세 지속',
        url: 'https://example.com/news/economy-recovery',
        content: '코로나19 팬데믹 이후 한국 경제가 꾸준한 회복세를 보이고 있습니다. 올해 상반기 GDP 성장률이 예상보다 높게 나타났으며, 소비와 투자가 동시에 증가하고 있습니다. 특히 제조업과 수출이 호조를 보이면서 경제 전망이 밝아지고 있습니다. 다만 인플레이션 우려와 부채 증가에 대한 관심도 높아지고 있습니다.',
        source: 'daum' as const,
        originalCategory: '경제',
        publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5시간 전
        author: '기자 김철수',
        summary: '코로나19 이후 한국 경제가 꾸준히 회복하고 있습니다. GDP 성장률이 예상보다 높게 나타났으며, 제조업과 수출이 호조를 보이고 있습니다.',
        keywords: ['경제', 'GDP', '코로나19', '회복', '수출'],
        refinedCategory: '경제' as const,
        sentiment: '긍정' as const,
        importanceScore: 7.8,
        entities: {
          people: ['김철수'],
          organizations: ['한국은행'],
          locations: ['한국'],
        },
        oneLiner: '한국 경제 회복세 지속, GDP 성장률 상승',
        scrapedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4시간 전
        analyzedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3시간 전
        contentHash: 'hash_economy_001',
      },
      {
        featureId,
        userId: user.uid,
        title: '정치 개혁 논의 본격화',
        url: 'https://example.com/news/politics-reform',
        content: '국회에서 정치 개혁 논의가 본격화되고 있습니다. 선거제도 개편과 정치 자금 규제 강화 등이 주요 의제로 떠오르고 있으며, 시민사회단체들도 적극적인 참여를 요구하고 있습니다. 정치권에서는 다양한 의견이 오가고 있으나 구체적인 합의에는 이르지 못하고 있습니다.',
        source: 'naver' as const,
        originalCategory: '정치',
        publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8시간 전
        author: '기자 이영희',
        summary: '국회에서 정치 개혁 논의가 본격화되고 있으며, 선거제도 개편과 정치 자금 규제 강화가 주요 의제로 논의되고 있습니다.',
        keywords: ['정치', '개혁', '국회', '선거제도', '정치자금'],
        refinedCategory: '정치' as const,
        sentiment: '중립' as const,
        importanceScore: 6.5,
        entities: {
          people: ['이영희'],
          organizations: ['국회', '시민사회단체'],
          locations: ['서울'],
        },
        oneLiner: '정치 개혁 논의 본격화, 구체적 합의는 미정',
        scrapedAt: new Date(now.getTime() - 7 * 60 * 60 * 1000), // 7시간 전
        analyzedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6시간 전
        contentHash: 'hash_politics_001',
      },
      {
        featureId,
        userId: user.uid,
        title: '사회적 기업 확산으로 일자리 창출 기대',
        url: 'https://example.com/news/social-enterprise',
        content: '사회적 기업이 확산되면서 새로운 일자리 창출에 기여하고 있습니다. 정부와 지자체가 사회적 기업 지원 정책을 강화하고 있으며, 청년들과 구직자들이 사회적 기업에 대한 관심을 높이고 있습니다. 특히 환경, 복지, 교육 분야에서 사회적 기업들이 활발하게 활동하고 있습니다.',
        source: 'rss' as const,
        originalCategory: '사회',
        publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12시간 전
        author: '기자 박민수',
        summary: '사회적 기업 확산으로 새로운 일자리 창출이 기대되고 있으며, 정부와 지자체의 지원 정책이 강화되고 있습니다.',
        keywords: ['사회적 기업', '일자리', '청년', '복지', '환경'],
        refinedCategory: '사회' as const,
        sentiment: '긍정' as const,
        importanceScore: 7.0,
        entities: {
          people: ['박민수'],
          organizations: ['정부', '지자체'],
          locations: ['전국'],
        },
        oneLiner: '사회적 기업 확산으로 일자리 창출 기대',
        scrapedAt: new Date(now.getTime() - 11 * 60 * 60 * 1000), // 11시간 전
        analyzedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000), // 10시간 전
        contentHash: 'hash_social_001',
      },
      {
        featureId,
        userId: user.uid,
        title: '반도체 산업 경쟁 심화',
        url: 'https://example.com/news/semiconductor-competition',
        content: '글로벌 반도체 산업 경쟁이 심화되고 있습니다. 최근 중국과 미국 간의 기술 패권 경쟁이 반도체 산업에 영향을 미치고 있으며, 한국 기업들도 새로운 전략을 모색하고 있습니다. 특히 AI 반도체와 자율주행용 반도체 수요가 급증하면서 시장 재편이 예상되고 있습니다.',
        source: 'naver' as const,
        originalCategory: 'IT',
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1일 전
        author: '기자 최지은',
        summary: '글로벌 반도체 산업 경쟁이 심화되고 있으며, AI 반도체와 자율주행용 반도체 수요가 급증하고 있습니다.',
        keywords: ['반도체', 'AI', '자율주행', '기술 경쟁', '시장'],
        refinedCategory: 'IT' as const,
        sentiment: '중립' as const,
        importanceScore: 8.0,
        entities: {
          people: ['최지은'],
          organizations: ['삼성전자', 'SK하이닉스'],
          locations: ['한국', '중국', '미국'],
        },
        oneLiner: '반도체 산업 경쟁 심화, AI 반도체 수요 급증',
        scrapedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000), // 23시간 전
        analyzedAt: new Date(now.getTime() - 22 * 60 * 60 * 1000), // 22시간 전
        contentHash: 'hash_semiconductor_001',
      },
    ];

    console.log(`테스트 데이터 추가 시작... (${testArticles.length}개)`);
    
    const addedIds: string[] = [];
    for (const article of testArticles) {
      try {
        const id = await addNewsArticle(article);
        addedIds.push(id);
        console.log(`✓ 추가됨: ${article.title.substring(0, 30)}...`);
      } catch (error) {
        console.error(`✗ 추가 실패: ${article.title}`, error);
      }
    }

    console.log(`\n테스트 데이터 추가 완료! (${addedIds.length}/${testArticles.length}개 성공)`);
    return addedIds;
  } catch (error) {
    console.error('테스트 데이터 추가 실패:', error);
    throw error;
  }
}

// 전체 실행 (기능 추가 + 테스트 데이터)
export async function setupNewsScraperFeature() {
  try {
    console.log('=== 뉴스 스크래퍼 설정 시작 ===\n');
    
    // 1. 기능 추가
    console.log('1. 뉴스 스크래퍼 기능 추가 중...');
    const featureId = await addNewsScraperFeature();
    
    if (!featureId) {
      console.error('기능 추가에 실패했습니다.');
      return;
    }

    // 2. 테스트 데이터 추가
    console.log('\n2. 테스트 데이터 추가 중...');
    await addNewsScraperTestData(featureId);
    
    console.log('\n=== 뉴스 스크래퍼 설정 완료 ===');
    console.log(`\n다음 URL에서 확인하세요:`);
    console.log(`http://localhost:3000/features/news-scraper?featureId=${featureId}`);
  } catch (error) {
    console.error('설정 중 오류 발생:', error);
    throw error;
  }
}

// 사용법:
// 브라우저 콘솔에서:
// import { setupNewsScraperFeature } from '@/scripts/add-news-scraper-test-data';
// await setupNewsScraperFeature();

