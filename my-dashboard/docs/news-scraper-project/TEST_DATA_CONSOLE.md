# 브라우저 콘솔에서 테스트 데이터 추가하기

## 🚀 빠른 실행 코드

브라우저 콘솔(F12)에서 다음 코드를 **전체 복사해서 실행**하세요:

```javascript
// 전체 코드를 복사해서 실행
(async function() {
  try {
    console.log('=== 뉴스 스크래퍼 설정 시작 ===\n');
    
    // Firebase 함수 임포트 (동적 import)
    const { addFeature, getFeatures } = await import('/app/lib/firebase/features.js');
    const { addNewsArticle } = await import('/app/lib/firebase/newsScraper.js');
    const { getCurrentUser } = await import('/app/lib/firebase.js');
    
    const user = getCurrentUser();
    if (!user) {
      console.error('❌ 로그인이 필요합니다. 먼저 로그인해주세요.');
      return;
    }
    
    // 1. 기능 추가
    console.log('1. 뉴스 스크래퍼 기능 확인 중...');
    const existingFeatures = await getFeatures();
    let featureId = existingFeatures.find(
      f => f.url?.includes('news-scraper') || f.name === '뉴스 스크래퍼'
    )?.id;
    
    if (!featureId) {
      console.log('   기능이 없어서 새로 추가합니다...');
      featureId = await addFeature({
        name: '뉴스 스크래퍼',
        description: 'AI 기반 뉴스 자동 수집 및 분석 대시보드',
        category: '뉴스',
        url: '/features/news-scraper?id=news-scraper',
        isPublic: true,
        status: 'completed',
      }, user.uid);
      console.log('   ✓ 기능 추가 완료:', featureId);
    } else {
      console.log('   ✓ 기존 기능 사용:', featureId);
    }
    
    // 2. 테스트 데이터 추가
    console.log('\n2. 테스트 데이터 추가 중...');
    const now = new Date();
    const testArticles = [
      {
        featureId,
        userId: user.uid,
        title: 'AI 기술 발전으로 산업 전반에 변화 예상',
        url: 'https://example.com/news/ai-tech-development',
        content: '최근 AI 기술의 급속한 발전으로 산업 전반에 큰 변화가 예상되고 있습니다.',
        source: 'naver',
        originalCategory: 'IT',
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        author: '기자 홍길동',
        summary: 'AI 기술 발전이 산업 전반에 큰 변화를 가져올 것으로 예상됩니다.',
        keywords: ['AI', '기술', '산업'],
        refinedCategory: 'IT',
        sentiment: '긍정',
        importanceScore: 8.5,
        entities: { people: ['홍길동'], organizations: ['정부'], locations: ['한국'] },
        oneLiner: 'AI 산업 전환 가속화',
        scrapedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        analyzedAt: new Date(now.getTime() - 50 * 60 * 1000),
        contentHash: 'hash_ai_001',
      },
      {
        featureId,
        userId: user.uid,
        title: '코로나19 이후 경제 회복세 지속',
        url: 'https://example.com/news/economy-recovery',
        content: '코로나19 팬데믹 이후 한국 경제가 꾸준한 회복세를 보이고 있습니다.',
        source: 'daum',
        originalCategory: '경제',
        publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        author: '기자 김철수',
        summary: '한국 경제가 꾸준히 회복하고 있습니다.',
        keywords: ['경제', 'GDP', '코로나19'],
        refinedCategory: '경제',
        sentiment: '긍정',
        importanceScore: 7.8,
        entities: { people: ['김철수'], organizations: ['한국은행'], locations: ['한국'] },
        oneLiner: '한국 경제 회복세 지속',
        scrapedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        analyzedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        contentHash: 'hash_economy_001',
      },
      {
        featureId,
        userId: user.uid,
        title: '정치 개혁 논의 본격화',
        url: 'https://example.com/news/politics-reform',
        content: '국회에서 정치 개혁 논의가 본격화되고 있습니다.',
        source: 'naver',
        originalCategory: '정치',
        publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        author: '기자 이영희',
        summary: '정치 개혁 논의가 본격화되고 있습니다.',
        keywords: ['정치', '개혁', '국회'],
        refinedCategory: '정치',
        sentiment: '중립',
        importanceScore: 6.5,
        entities: { people: ['이영희'], organizations: ['국회'], locations: ['서울'] },
        oneLiner: '정치 개혁 논의 본격화',
        scrapedAt: new Date(now.getTime() - 7 * 60 * 60 * 1000),
        analyzedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        contentHash: 'hash_politics_001',
      },
    ];
    
    let successCount = 0;
    for (const article of testArticles) {
      try {
        await addNewsArticle(article);
        console.log(`   ✓ 추가됨: ${article.title.substring(0, 30)}...`);
        successCount++;
      } catch (error) {
        console.error(`   ✗ 실패: ${article.title}`, error);
      }
    }
    
    console.log(`\n=== 완료! (${successCount}/${testArticles.length}개 성공) ===`);
    console.log(`\n다음 URL에서 확인하세요:`);
    console.log(`http://localhost:3000/features/news-scraper?featureId=${featureId}`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
})();
```

## 📝 실행 단계

1. **개발 서버 실행 확인**
   ```powershell
   npm.cmd run dev
   ```

2. **브라우저에서 로그인**
   - http://localhost:3000 접속
   - 로그인 또는 회원가입

3. **개발자 도구 열기**
   - `F12` 키 누르기

4. **콘솔 탭 선택**

5. **위 코드 전체 복사 후 붙여넣기**

6. **Enter 키 누르기**

7. **결과 확인**
   - 콘솔에 성공 메시지 확인
   - 제공된 URL로 이동하여 데이터 확인

## ✅ 확인 방법

1. 메인 페이지 → "웹 기능 목록"
2. "뉴스 스크래퍼" 기능 클릭
3. 3개의 테스트 뉴스 확인

---

**참고**: 위 코드는 간단한 버전입니다. 더 많은 테스트 데이터가 필요하면 `TEST_DATA_SETUP.md`를 참고하세요.

