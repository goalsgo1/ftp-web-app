import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticles, addNewsArticle, addScrapingJob, updateScrapingJob } from '@/lib/firebase/newsScraper';
import { scrapeAllNews } from '@/lib/utils/newsScraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { featureId, sources, keywords, userId } = body;

    if (!featureId || !userId) {
      return NextResponse.json(
        { success: false, error: 'featureId와 userId가 필요합니다.' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const startDate = new Date();

    // 스크래핑 작업 생성
    const jobId = await addScrapingJob({
      featureId,
      userId,
      source: sources?.length === 1 ? sources[0] : 'all',
      startedAt: startDate,
      status: 'running',
    });

    try {
      // 스크래핑 실행 (모든 카테고리에서 수집)
      const sourcesToScrape = sources || ['naver', 'daum'];
      // 모든 카테고리에서 수집 (카테고리 필터링 제거)
      const categoriesToScrape = ['IT', '경제', '정치', '사회', '기타'];

      console.log(`스크래핑 시작: featureId=${featureId}, sources=${sourcesToScrape.join(',')}, categories=all${keywords ? `, keywords=${keywords.join(',')}` : ''}`);

      // 키워드가 있으면 키워드 검색 모드로 전환
      const isKeywordSearchMode = keywords && Array.isArray(keywords) && keywords.length > 0;
      const scrapedArticles = await scrapeAllNews(sourcesToScrape, categoriesToScrape, keywords);
      
      console.log(`스크래핑 완료: ${scrapedArticles.length}개 기사 발견`);

      // 기존 기사들의 contentHash 목록 가져오기 (중복 체크용)
      const existingArticles = await getNewsArticles(featureId, { limit: 1000 });
      const existingHashes = new Set(
        existingArticles
          .map(a => a.contentHash)
          .filter((hash): hash is string => !!hash)
      );

      // 중복 체크 및 새 기사만 필터링
      let newArticles = scrapedArticles.filter(article => {
        if (!article.contentHash) return true;
        return !existingHashes.has(article.contentHash);
      });
      
      // 키워드 필터링 (키워드 검색 모드가 아닌 경우에만 적용)
      // 키워드 검색 모드에서는 이미 키워드가 포함된 기사만 가져왔으므로 필터링 불필요
      if (!isKeywordSearchMode && keywords && Array.isArray(keywords) && keywords.length > 0) {
        // 키워드 정규화 (공백 제거만, 한글은 대소문자 구분 없음)
        const normalizedKeywords = keywords
          .map(k => k.trim())
          .filter(k => k.length > 0);
        
        if (normalizedKeywords.length > 0) {
          console.log(`키워드 필터링 시작: ${normalizedKeywords.join(', ')}`);
          console.log(`필터링 전 기사 수: ${newArticles.length}개`);
          const beforeCount = newArticles.length;
          
          // 디버깅: 샘플 기사 확인 (최대 5개)
          const sampleSize = Math.min(5, newArticles.length);
          console.log(`\n=== 샘플 기사 확인 (${sampleSize}개) ===`);
          for (let i = 0; i < sampleSize; i++) {
            const article = newArticles[i];
            console.log(`[${i}] 제목: "${article.title}"`);
            console.log(`    내용(50자): "${(article.content || '').substring(0, 50)}"`);
          }
          
          newArticles = newArticles.filter((article, index) => {
            // 한글 키워드는 대소문자 변환 불필요, 공백 제거만
            const title = article.title.trim();
            const content = (article.content || '').trim();
            
            // 제목이나 내용에 키워드가 하나라도 포함되어 있으면 포함
            const matches = normalizedKeywords.some(keyword => {
              const titleMatch = title.includes(keyword);
              const contentMatch = content.includes(keyword);
              return titleMatch || contentMatch;
            });
            
            // 디버깅: 매칭 결과 로그 (처음 10개만)
            if (index < 10) {
              const matchedKeyword = normalizedKeywords.find(kw => 
                title.includes(kw) || content.includes(kw)
              );
              console.log(`[${index}] "${title.substring(0, 40)}...": 매칭=${matches}${matchedKeyword ? ` (키워드: ${matchedKeyword})` : ''}`);
            }
            
            return matches;
          });
          
          console.log(`\n키워드 필터링 후: ${beforeCount}개 → ${newArticles.length}개 기사`);
          
          // 키워드 필터링으로 모든 기사가 제외된 경우 경고 및 상세 로그
          if (newArticles.length === 0 && beforeCount > 0) {
            console.warn(`\n⚠️ 경고: 키워드 "${normalizedKeywords.join(', ')}"가 기사에 포함되지 않아 모든 기사가 제외되었습니다.`);
            console.log(`제외된 기사 제목 샘플 (최대 10개):`);
            const excludedSample = scrapedArticles.slice(0, Math.min(10, scrapedArticles.length));
            excludedSample.forEach((article, idx) => {
              console.log(`  ${idx + 1}. "${article.title}"`);
            });
          }
        }
      }

      console.log(`중복 제외 후: ${newArticles.length}개 새 기사`);

      // Firestore에 저장
      let savedCount = 0;
      const errors: string[] = [];

      for (const article of newArticles) {
        try {
          await addNewsArticle({
            ...article,
            featureId,
            userId,
          });
          savedCount++;
        } catch (error: any) {
          console.error('기사 저장 실패:', error);
          errors.push(`${article.title}: ${error.message}`);
        }
      }

      const endTime = Date.now();
      const executionTime = Math.floor((endTime - startTime) / 1000);

      // 작업 완료 기록
      await updateScrapingJob(jobId, {
        status: 'success',
        finishedAt: new Date(),
        articlesFound: scrapedArticles.length,
        articlesSaved: savedCount,
        executionTimeSeconds: executionTime,
        errorMessage: errors.length > 0 ? errors.slice(0, 5).join('; ') : undefined,
      });

      // 키워드 필터링으로 인해 저장된 기사가 없는 경우 경고 메시지 추가
      const warnings: string[] = [];
      if (keywords && Array.isArray(keywords) && keywords.length > 0 && savedCount === 0 && scrapedArticles.length > 0) {
        warnings.push(`키워드 필터링: "${keywords.join(', ')}" 키워드가 포함된 기사를 찾지 못했습니다.`);
      }
      
      return NextResponse.json({
        success: true,
        jobId,
        articlesFound: scrapedArticles.length,
        articlesSaved: savedCount,
        executionTimeSeconds: executionTime,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      });
    } catch (error: any) {
      const endTime = Date.now();
      const executionTime = Math.floor((endTime - startTime) / 1000);

      // 작업 실패 기록
      await updateScrapingJob(jobId, {
        status: 'failed',
        finishedAt: new Date(),
        executionTimeSeconds: executionTime,
        errorMessage: error.message || '알 수 없는 오류',
      });

      console.error('스크래핑 실패:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || '스크래핑 중 오류가 발생했습니다.',
          jobId,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET 요청으로 스크래핑 상태 확인 (선택사항)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'POST 요청으로 스크래핑을 시작하세요.',
    usage: {
      method: 'POST',
      body: {
        featureId: 'string (required)',
        userId: 'string (required)',
        sources: "array of 'naver' | 'daum' (optional)",
        categories: 'array of string (optional)',
      },
    },
  });
}

