import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth';

// 뉴스 아티클 타입
export interface NewsArticle {
  id?: string;
  featureId: string;  // 어떤 기능(뉴스 스크래퍼)에 속하는지
  userId?: string;    // 생성자 ID (공개/비공개 구분용)
  
  // 원본 정보
  title: string;
  url: string;
  content: string;
  source: 'naver' | 'daum' | 'rss';
  originalCategory?: string;
  publishedAt: Date;
  author?: string;
  
  // AI 분석 결과
  summary?: string;
  keywords?: string[];  // ["AI", "기술", "산업"]
  refinedCategory?: 'IT' | '경제' | '정치' | '사회' | '기타';
  sentiment?: '긍정' | '중립' | '부정';
  importanceScore?: number;  // 1.0 ~ 10.0
  entities?: {
    people?: string[];
    organizations?: string[];
    locations?: string[];
  };
  oneLiner?: string;
  
  // 메타데이터
  scrapedAt: Date;
  analyzedAt?: Date;
  contentHash?: string;  // 중복 방지를 위한 해시 (URL 기반)
  
  createdAt?: Date;
  updatedAt?: Date;
}

// 스크래핑 작업 타입
export interface ScrapingJob {
  id?: string;
  featureId: string;
  userId: string;  // 작업을 시작한 사용자
  
  source: 'naver' | 'daum' | 'rss' | 'all';
  startedAt: Date;
  finishedAt?: Date;
  status: 'running' | 'success' | 'failed';
  articlesFound?: number;
  articlesSaved?: number;
  errorMessage?: string;
  executionTimeSeconds?: number;
  
  createdAt?: Date;
}

// 뉴스 스크래퍼 설정 타입
export interface NewsScraperSettings {
  id?: string;
  featureId: string;
  userId: string;  // 설정을 소유한 사용자 (생성자)
  
  // 스크래핑 설정
  scrapingEnabled: boolean;
  scrapingInterval: number;  // 분 단위 (기본 30분)
  sources: ('naver' | 'daum' | 'rss')[];
  categories: ('IT' | '경제' | '정치' | '사회' | '기타')[];
  
  // AI 분석 설정
  aiAnalysisEnabled: boolean;
  analyzeOnScrape: boolean;  // 스크래핑 시 즉시 분석
  
  // 데이터 보관 설정
  retentionDays: number;  // 보관 기간 (기본 30일)
  autoDelete: boolean;    // 자동 삭제 여부
  
  createdAt?: Date;
  updatedAt?: Date;
}

// 뉴스 목록 조회 옵션
export interface GetNewsArticlesOptions {
  category?: 'IT' | '경제' | '정치' | '사회' | '기타';
  source?: 'naver' | 'daum' | 'rss';
  sortBy?: 'published_at' | 'importance_score';
  limit?: number;
  startAfter?: any;  // 페이지네이션용
}

// 뉴스 아티클 추가
export const addNewsArticle = async (
  article: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'newsArticles'), {
      featureId: article.featureId,
      userId: article.userId || null,
      title: article.title,
      url: article.url,
      content: article.content,
      source: article.source,
      originalCategory: article.originalCategory || null,
      publishedAt: Timestamp.fromDate(article.publishedAt),
      author: article.author || null,
      summary: article.summary || null,
      keywords: article.keywords || [],
      refinedCategory: article.refinedCategory || null,
      sentiment: article.sentiment || null,
      importanceScore: article.importanceScore || null,
      entities: article.entities || null,
      oneLiner: article.oneLiner || null,
      scrapedAt: Timestamp.fromDate(article.scrapedAt),
      analyzedAt: article.analyzedAt ? Timestamp.fromDate(article.analyzedAt) : null,
      contentHash: article.contentHash || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('뉴스 아티클 추가 실패:', error);
    throw error;
  }
};

// 뉴스 아티클 목록 조회
export const getNewsArticles = async (
  featureId: string,
  options: GetNewsArticlesOptions = {}
): Promise<NewsArticle[]> => {
  try {
    let q = query(
      collection(db, 'newsArticles'),
      where('featureId', '==', featureId)
    );

    // 카테고리 필터
    if (options.category) {
      q = query(q, where('refinedCategory', '==', options.category));
    }

    // 소스 필터
    if (options.source) {
      q = query(q, where('source', '==', options.source));
    }

    // 정렬
    if (options.sortBy === 'importance_score') {
      q = query(q, orderBy('importanceScore', 'desc'));
    } else {
      q = query(q, orderBy('publishedAt', 'desc'));
    }

    // 제한
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate() || new Date(),
        scrapedAt: data.scrapedAt?.toDate() || new Date(),
        analyzedAt: data.analyzedAt?.toDate() || undefined,
        keywords: data.keywords || [],
        createdAt: data.createdAt?.toDate() || undefined,
        updatedAt: data.updatedAt?.toDate() || undefined,
      } as NewsArticle;
    });
  } catch (error) {
    console.error('뉴스 아티클 목록 가져오기 실패:', error);
    throw error;
  }
};

// 뉴스 아티클 상세 조회
export const getNewsArticleById = async (articleId: string): Promise<NewsArticle | null> => {
  try {
    const docRef = doc(db, 'newsArticles', articleId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        publishedAt: data.publishedAt?.toDate() || new Date(),
        scrapedAt: data.scrapedAt?.toDate() || new Date(),
        analyzedAt: data.analyzedAt?.toDate() || undefined,
        keywords: data.keywords || [],
        createdAt: data.createdAt?.toDate() || undefined,
        updatedAt: data.updatedAt?.toDate() || undefined,
      } as NewsArticle;
    }
    
    return null;
  } catch (error) {
    console.error('뉴스 아티클 가져오기 실패:', error);
    throw error;
  }
};

// 뉴스 아티클 수정
export const updateNewsArticle = async (
  articleId: string,
  article: Partial<Omit<NewsArticle, 'id' | 'featureId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'newsArticles', articleId);
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (article.title !== undefined) updateData.title = article.title;
    if (article.url !== undefined) updateData.url = article.url;
    if (article.content !== undefined) updateData.content = article.content;
    if (article.source !== undefined) updateData.source = article.source;
    if (article.originalCategory !== undefined) updateData.originalCategory = article.originalCategory;
    if (article.publishedAt !== undefined) updateData.publishedAt = Timestamp.fromDate(article.publishedAt);
    if (article.author !== undefined) updateData.author = article.author;
    if (article.summary !== undefined) updateData.summary = article.summary;
    if (article.keywords !== undefined) updateData.keywords = article.keywords;
    if (article.refinedCategory !== undefined) updateData.refinedCategory = article.refinedCategory;
    if (article.sentiment !== undefined) updateData.sentiment = article.sentiment;
    if (article.importanceScore !== undefined) updateData.importanceScore = article.importanceScore;
    if (article.entities !== undefined) updateData.entities = article.entities;
    if (article.oneLiner !== undefined) updateData.oneLiner = article.oneLiner;
    if (article.analyzedAt !== undefined) updateData.analyzedAt = Timestamp.fromDate(article.analyzedAt);

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('뉴스 아티클 수정 실패:', error);
    throw error;
  }
};

// 뉴스 아티클 삭제
export const deleteNewsArticle = async (articleId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'newsArticles', articleId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('뉴스 아티클 삭제 실패:', error);
    throw error;
  }
};

// 뉴스 통계 조회
export interface NewsStatistics {
  totalArticles: number;
  todayArticles: number;
  byCategory: Record<string, number>;
  avgImportance: number;
  lastScraping: Date | null;
  bySource: Record<string, number>;
}

export const getNewsStatistics = async (featureId: string): Promise<NewsStatistics> => {
  try {
    const articles = await getNewsArticles(featureId, { limit: 1000 }); // 통계용으로 충분히 가져오기
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayArticles = articles.filter(a => {
      const articleDate = new Date(a.publishedAt);
      articleDate.setHours(0, 0, 0, 0);
      return articleDate.getTime() === today.getTime();
    });

    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let totalImportance = 0;
    let importanceCount = 0;

    articles.forEach(article => {
      // 카테고리별 카운트
      const category = article.refinedCategory || '기타';
      byCategory[category] = (byCategory[category] || 0) + 1;

      // 소스별 카운트
      bySource[article.source] = (bySource[article.source] || 0) + 1;

      // 평균 중요도 계산
      if (article.importanceScore !== undefined) {
        totalImportance += article.importanceScore;
        importanceCount++;
      }
    });

    // 마지막 스크래핑 시간 찾기
    const lastScraping = articles.length > 0 
      ? articles.reduce((latest, article) => {
          return article.scrapedAt > latest ? article.scrapedAt : latest;
        }, articles[0].scrapedAt)
      : null;

    return {
      totalArticles: articles.length,
      todayArticles: todayArticles.length,
      byCategory,
      avgImportance: importanceCount > 0 ? totalImportance / importanceCount : 0,
      lastScraping,
      bySource,
    };
  } catch (error) {
    console.error('뉴스 통계 가져오기 실패:', error);
    throw error;
  }
};

// 스크래핑 작업 추가
export const addScrapingJob = async (
  job: Omit<ScrapingJob, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'scrapingJobs'), {
      featureId: job.featureId,
      userId: job.userId,
      source: job.source,
      startedAt: Timestamp.fromDate(job.startedAt),
      finishedAt: job.finishedAt ? Timestamp.fromDate(job.finishedAt) : null,
      status: job.status,
      articlesFound: job.articlesFound || null,
      articlesSaved: job.articlesSaved || null,
      errorMessage: job.errorMessage || null,
      executionTimeSeconds: job.executionTimeSeconds || null,
      createdAt: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('스크래핑 작업 추가 실패:', error);
    throw error;
  }
};

// 스크래핑 작업 목록 조회
export const getScrapingJobs = async (
  featureId: string,
  limitCount: number = 50
): Promise<ScrapingJob[]> => {
  try {
    const q = query(
      collection(db, 'scrapingJobs'),
      where('featureId', '==', featureId),
      orderBy('startedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate() || new Date(),
        finishedAt: data.finishedAt?.toDate() || undefined,
        createdAt: data.createdAt?.toDate() || undefined,
      } as ScrapingJob;
    });
  } catch (error) {
    console.error('스크래핑 작업 목록 가져오기 실패:', error);
    throw error;
  }
};

// 스크래핑 작업 업데이트
export const updateScrapingJob = async (
  jobId: string,
  updates: Partial<Omit<ScrapingJob, 'id' | 'featureId' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'scrapingJobs', jobId);
    const updateData: any = {};

    if (updates.finishedAt !== undefined) updateData.finishedAt = Timestamp.fromDate(updates.finishedAt);
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.articlesFound !== undefined) updateData.articlesFound = updates.articlesFound;
    if (updates.articlesSaved !== undefined) updateData.articlesSaved = updates.articlesSaved;
    if (updates.errorMessage !== undefined) updateData.errorMessage = updates.errorMessage;
    if (updates.executionTimeSeconds !== undefined) updateData.executionTimeSeconds = updates.executionTimeSeconds;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('스크래핑 작업 업데이트 실패:', error);
    throw error;
  }
};

// 뉴스 스크래퍼 설정 저장
export const saveNewsScraperSettings = async (
  featureId: string,
  userId: string,
  settings: Omit<NewsScraperSettings, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  try {
    // 클라이언트 사이드에서만 인증 체크
    if (typeof window !== 'undefined') {
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.uid !== userId) {
        throw new Error('권한이 없습니다.');
      }
    }

    const docRef = doc(db, `features/${featureId}/newsScraperSettings`, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // 업데이트
      await updateDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now(),
      });
    } else {
      // 생성
      await setDoc(docRef, {
        featureId,
        userId,
        ...settings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('설정 저장 실패:', error);
    throw error;
  }
};

// 뉴스 스크래퍼 설정 조회
export const getNewsScraperSettings = async (
  featureId: string,
  userId: string
): Promise<NewsScraperSettings | null> => {
  try {
    const docRef = doc(db, `features/${featureId}/newsScraperSettings`, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || undefined,
        updatedAt: data.updatedAt?.toDate() || undefined,
      } as NewsScraperSettings;
    }
    
    return null;
  } catch (error) {
    console.error('설정 가져오기 실패:', error);
    throw error;
  }
};

// 기본 설정 가져오기
export const getDefaultNewsScraperSettings = (): Omit<NewsScraperSettings, 'id' | 'featureId' | 'userId' | 'createdAt' | 'updatedAt'> => {
  return {
    scrapingEnabled: false,
    scrapingInterval: 30,  // 30분
    sources: ['naver', 'daum'],
    categories: ['IT', '경제', '정치', '사회'],
    aiAnalysisEnabled: false,
    analyzeOnScrape: false,
    retentionDays: 30,
    autoDelete: false,
  };
};

