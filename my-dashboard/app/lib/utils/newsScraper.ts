/**
 * 뉴스 스크래핑 유틸리티 함수
 */

import * as crypto from 'crypto';
import type { NewsArticle } from '@/lib/firebase/newsScraper';

// URL 해시 생성 (중복 체크용)
export function generateContentHash(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

// 네이버 뉴스 섹션 URL (HTML 크롤링용)
const NAVER_NEWS_SECTIONS = {
  IT: { url: 'https://news.naver.com/main/main.naver?mode=LSD&mid=shm&sid1=105', sid: 105 },
  경제: { url: 'https://news.naver.com/main/main.naver?mode=LSD&mid=shm&sid1=101', sid: 101 },
  정치: { url: 'https://news.naver.com/main/main.naver?mode=LSD&mid=shm&sid1=100', sid: 100 },
  사회: { url: 'https://news.naver.com/main/main.naver?mode=LSD&mid=shm&sid1=102', sid: 102 },
};

// 다음 뉴스 RSS 피드 URL - 모든 카테고리 포함
const DAUM_NEWS_RSS = {
  IT: 'https://media.daum.net/syndication/rss/it.xml',
  경제: 'https://media.daum.net/syndication/rss/economic.xml',
  정치: 'https://media.daum.net/syndication/rss/politics.xml',
  사회: 'https://media.daum.net/syndication/rss/society.xml',
  기타: 'https://media.daum.net/syndication/rss/entertain.xml', // 연예/스포츠
};

// RSS 피드에서 뉴스 가져오기
export async function fetchNewsFromRSS(
  rssUrl: string,
  source: 'naver' | 'daum',
  category: string
): Promise<Array<{
  title: string;
  url: string;
  content: string;
  publishedAt: Date;
  author?: string;
}>> {
  try {
    // 동적 import (서버 사이드에서만 사용)
    const Parser = (await import('rss-parser')).default;
    const axios = (await import('axios')).default;
    
    const parser = new Parser({
      customFields: {
        item: ['description', 'pubDate', 'author', 'content:encoded'],
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      // XML 파싱 에러를 더 관대하게 처리
      xml2js: {
        explicitArray: false,
        ignoreAttrs: false,
        mergeAttrs: true,
      },
    });

    // axios로 먼저 가져온 후 파싱 (더 나은 에러 핸들링)
    const response = await axios.get(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      timeout: 10000,
      validateStatus: (status) => status < 500, // 5xx 에러만 제외
    });

    if (response.status === 404) {
      console.warn(`RSS 피드를 찾을 수 없음 (404): ${rssUrl}`);
      return [];
    }

    if (response.status !== 200) {
      console.warn(`RSS 피드 가져오기 실패 (${response.status}): ${rssUrl}`);
      return [];
    }

    // 응답 데이터가 문자열인 경우 그대로 사용, 객체인 경우 문자열로 변환
    const xmlData = typeof response.data === 'string' ? response.data : response.data.toString();
    const feed = await parser.parseString(xmlData);
    
    if (!feed.items) {
      return [];
    }

    return feed.items
      .filter(item => item.title && item.link)
      .map(item => {
        // 설명에서 HTML 태그 제거
        const content = (item.contentSnippet || item.description || item.title || '')
          .replace(/<[^>]*>/g, '')
          .trim();

        // 발행일 파싱
        let publishedAt = new Date();
        if (item.pubDate) {
          const parsedDate = new Date(item.pubDate);
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate;
          }
        }

        return {
          title: item.title || '',
          url: item.link || '',
          content: content || item.title || '',
          publishedAt,
          author: item.creator || item.author || undefined,
        };
      });
  } catch (error) {
    console.error(`RSS 피드 가져오기 실패 (${rssUrl}):`, error);
    return [];
  }
}

// 네이버 뉴스 HTML 크롤링 - 모든 카테고리에서 수집
export async function scrapeNaverNews(
  categories: string[] = ['IT', '경제', '정치', '사회', '기타']
): Promise<Array<Omit<NewsArticle, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'>>> {
  const articles: Array<Omit<NewsArticle, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'>> = [];

  for (const category of categories) {
    const section = NAVER_NEWS_SECTIONS[category as keyof typeof NAVER_NEWS_SECTIONS];
    if (!section) continue;

    try {
      const axios = (await import('axios')).default;
      const cheerio = await import('cheerio');

      const response = await axios.get(section.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      
      // 네이버 뉴스 메인 페이지의 기사 링크 추출
      const links: Array<{ url: string; title: string }> = [];
      $('a[href*="/article/"]').each((_idx: number, element: any) => {
        const $link = $(element);
        const href = $link.attr('href');
        const title = $link.text().trim();

        if (!href || !title || title.length < 5) return;

        // 상대 URL을 절대 URL로 변환
        const articleUrl = href.startsWith('http') ? href : `https://news.naver.com${href}`;
        
        // 중복 체크
        if (links.find(l => l.url === articleUrl)) return;
        
        links.push({ url: articleUrl, title });
      });

      // 최대 20개 기사만 처리
      const linksToProcess = links.slice(0, 20);

      // 각 기사의 내용 크롤링 (병렬 처리로 속도 개선, 최대 5개 동시)
      const batchSize = 5;
      for (let i = 0; i < linksToProcess.length; i += batchSize) {
        const batch = linksToProcess.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async ({ url, title }) => {
          try {
            // 중복 체크
            const existing = articles.find(a => a.contentHash === generateContentHash(url));
            if (existing) return;

            // 기사 본문 크롤링 시도
            let content = title; // 기본값은 제목
            try {
              const articleResponse = await axios.get(url, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                timeout: 5000,
              });
              
              const $article = cheerio.load(articleResponse.data);
              // 네이버 뉴스 기사 본문 추출
              const articleContent = $article('#newsEndContents, .go_trans._article_content, ._article_body_contents')
                .text()
                .trim()
                .replace(/\s+/g, ' ')
                .substring(0, 1000); // 최대 1000자
              
              if (articleContent && articleContent.length > 10) {
                content = `${title} ${articleContent}`; // 제목 + 본문
              }
            } catch (contentError) {
              // 본문 크롤링 실패 시 제목만 사용
              console.warn(`기사 본문 크롤링 실패 (${url}):`, contentError);
            }

            articles.push({
              title,
              url,
              content,
              source: 'naver',
              originalCategory: category,
              publishedAt: new Date(), // HTML에서 시간 추출 어려워 현재 시간 사용
              scrapedAt: new Date(),
              contentHash: generateContentHash(url),
            });
          } catch (error) {
            console.warn(`기사 처리 실패 (${url}):`, error);
          }
        }));
        
        // 배치 사이에 약간의 딜레이
        if (i + batchSize < linksToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Rate limiting: 각 카테고리 사이에 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`네이버 뉴스 스크래핑 실패 (${category}):`, error);
    }
  }

  return articles;
}

// 다음 뉴스 스크래핑 - 모든 카테고리에서 수집
export async function scrapeDaumNews(
  categories: string[] = ['IT', '경제', '정치', '사회', '기타']
): Promise<Array<Omit<NewsArticle, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'>>> {
  const articles: Array<Omit<NewsArticle, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'>> = [];

  for (const category of categories) {
    const rssUrl = DAUM_NEWS_RSS[category as keyof typeof DAUM_NEWS_RSS];
    if (!rssUrl) continue;

    try {
      const items = await fetchNewsFromRSS(rssUrl, 'daum', category);
      
      for (const item of items) {
        articles.push({
          title: item.title,
          url: item.url,
          content: item.content,
          source: 'daum',
          originalCategory: category,
          publishedAt: item.publishedAt,
          author: item.author,
          scrapedAt: new Date(),
          contentHash: generateContentHash(item.url),
        });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`다음 뉴스 스크래핑 실패 (${category}):`, error);
    }
  }

  return articles;
}

// 네이버 뉴스 키워드 검색 (일반 뉴스 앱처럼 검색 API 사용)
export async function searchNaverNewsByKeyword(
  keyword: string,
  maxResults: number = 30
): Promise<Array<Omit<NewsArticle, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'>>> {
  const articles: Array<Omit<NewsArticle, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'>> = [];

  try {
    const axios = (await import('axios')).default;
    const cheerio = await import('cheerio');

    // 네이버 뉴스 검색 URL (최신순 정렬)
    const searchUrl = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(keyword)}&sm=tab_jum&sort=1`;

    console.log(`네이버 뉴스 검색 시작: "${keyword}"`);

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // 네이버 뉴스 검색 결과 링크 추출
    const links: Array<{ url: string; title: string }> = [];

    // 방법 1: .news_wrap > a.news_tit (최신 네이버 뉴스 검색 구조)
    $('.news_wrap').each((_idx: number, element: any) => {
      if (links.length >= maxResults) return false;

      const $wrap = $(element);
      const $link = $wrap.find('a.news_tit');
      let href = $link.attr('href');
      const title = $link.text().trim();

      if (!href || !title || title.length < 5) return;

      // 네이버 뉴스 링크만 수집 (news.naver.com/article)
      if (!href.includes('news.naver.com/article')) return;

      // 절대 URL로 변환
      if (!href.startsWith('http')) {
        href = `https://${href}`;
      }

      // 중복 체크
      if (links.find(l => l.url === href)) return;

      links.push({ url: href, title });
    });

    console.log(`검색 결과 링크 추출: ${links.length}개`);

    // 키워드 정규화 (대소문자 구분 없이 검색)
    const normalizedKeyword = keyword.trim().toLowerCase();

    // 각 기사의 본문 크롤링 (병렬 처리)
    const batchSize = 5;
    let filteredOutCount = 0; // 키워드 불일치로 제외된 기사 수

    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);

      await Promise.all(batch.map(async ({ url, title }) => {
        try {
          // 중복 체크
          const existing = articles.find(a => a.contentHash === generateContentHash(url));
          if (existing) return;

          // 기사 본문 크롤링 (제목 + 본문으로 키워드 검색 정확도 향상)
          let content = title; // 기본값은 제목
          try {
            const articleResponse = await axios.get(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
              timeout: 8000,
            });

            const $article = cheerio.load(articleResponse.data);

            // 네이버 뉴스 기사 본문 추출 (여러 선택자 시도)
            let articleContent = '';

            // 방법 1: #newsEndContents (일반 기사)
            articleContent = $article('#newsEndContents').text().trim();

            // 방법 2: .go_trans._article_content (번역 기사)
            if (!articleContent || articleContent.length < 50) {
              articleContent = $article('.go_trans._article_content').text().trim();
            }

            // 방법 3: ._article_body_contents (기타 구조)
            if (!articleContent || articleContent.length < 50) {
              articleContent = $article('._article_body_contents').text().trim();
            }

            // 방법 4: #articleBodyContents (대체 구조)
            if (!articleContent || articleContent.length < 50) {
              articleContent = $article('#articleBodyContents').text().trim();
            }

            // 본문 정리 (제목 + 본문 조합)
            if (articleContent && articleContent.length > 50) {
              content = `${title} ${articleContent.replace(/\s+/g, ' ').substring(0, 2000)}`;
            } else {
              content = title; // 본문 추출 실패 시 제목만 사용
            }
          } catch (contentError: any) {
            console.warn(`기사 본문 크롤링 실패 (${url.substring(0, 50)}...):`, contentError.message);
            // 본문 크롤링 실패해도 제목만으로 저장 시도
          }

          // 키워드 검증: 제목 또는 본문에 키워드가 포함되어 있는지 확인
          const titleLower = title.toLowerCase();
          const contentLower = content.toLowerCase();
          const hasKeyword = titleLower.includes(normalizedKeyword) || contentLower.includes(normalizedKeyword);

          if (!hasKeyword) {
            // 키워드가 포함되지 않은 기사는 제외
            filteredOutCount++;
            console.log(`키워드 불일치로 제외: "${title.substring(0, 50)}..."`);
            return;
          }

          articles.push({
            title,
            url,
            content, // 제목 + 본문 (키워드 검증 완료)
            source: 'naver',
            originalCategory: '기타',
            publishedAt: new Date(),
            scrapedAt: new Date(),
            contentHash: generateContentHash(url),
          });
        } catch (error: any) {
          console.warn(`기사 처리 실패 (${url.substring(0, 50)}...):`, error.message);
        }
      }));

      // 배치 사이 딜레이 (서버 부하 방지)
      if (i + batchSize < links.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`키워드 검색 완료: "${keyword}" → ${links.length}개 검색, ${articles.length}개 수집 (${filteredOutCount}개 제외)`);
  } catch (error: any) {
    console.error(`네이버 뉴스 키워드 검색 실패 (${keyword}):`, error.message);
  }

  return articles;
}

// 모든 소스에서 뉴스 스크래핑 - 키워드 검색 지원
export async function scrapeAllNews(
  sources: ('naver' | 'daum' | 'rss')[] = ['naver', 'daum'],
  categories: string[] = ['IT', '경제', '정치', '사회', '기타'],
  keywords?: string[] // 키워드가 있으면 검색 모드로 전환
): Promise<Array<Omit<NewsArticle, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'>>> {
  const allArticles: Array<Omit<NewsArticle, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'>> = [];

  // 키워드가 있으면 키워드 검색 모드 (더 많은 결과를 위해)
  if (keywords && keywords.length > 0) {
    console.log(`키워드 검색 모드: ${keywords.join(', ')}`);
    
    // 각 키워드별로 검색
    for (const keyword of keywords) {
      if (sources.includes('naver')) {
        const searchResults = await searchNaverNewsByKeyword(keyword, 30);
        allArticles.push(...searchResults);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // 키워드 검색 결과가 있으면 반환
    if (allArticles.length > 0) {
      return allArticles;
    }
  }

  // 키워드가 없으면 기존 방식 (카테고리별 최신 기사)
  if (sources.includes('naver')) {
    const naverArticles = await scrapeNaverNews(categories);
    allArticles.push(...naverArticles);
  }

  if (sources.includes('daum')) {
    const daumArticles = await scrapeDaumNews(categories);
    allArticles.push(...daumArticles);
  }

  return allArticles;
}

