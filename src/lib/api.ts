import { STRAPI_BASE_URL } from './constants';

// ---- TypeScript 类型定义 ----

export interface ImageData {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  name: string;
  width: number;
  height: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  cover: ImageData | null;
  tags: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  category: 'web' | 'design' | 'photo' | 'other';
  images: ImageData[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface StrapiCollectionResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

// ---- 工具函数 ----

export function getImageUrl(image: ImageData | null): string {
  if (!image) return '';
  if (image.url.startsWith('http')) return image.url;
  return `${STRAPI_BASE_URL}${image.url}`;
}

export function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  return tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

async function fetchAPI<T>(endpoint: string): Promise<T | null> {
  const url = `${STRAPI_BASE_URL}${endpoint}`;
  console.log(`[API] Fetching: ${url}`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[API] Error ${res.status}: ${url}`);
      return null;
    }
    const json = await res.json();
    // Strapi 5 返回 { data: [...] } 格式，解包 data
    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as T;
    }
    return json as T;
  } catch (err) {
    console.error(`[API] Network error: ${(err as Error).message}. Is Strapi running at ${STRAPI_BASE_URL}?`);
    return null;
  }
}

// ---- API 函数 ----

export async function getBlogs(): Promise<BlogPost[]> {
  const data = await fetchAPI<BlogPost[]>('/api/blogs?populate=cover');
  return Array.isArray(data) ? data : [];
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const blogs = await getBlogs();
  return blogs.find((b) => b.slug === slug) || null;
}

export async function getBlogSlugs(): Promise<string[]> {
  const blogs = await getBlogs();
  return blogs.map((b) => b.slug);
}

export async function getPortfolios(): Promise<PortfolioItem[]> {
  const data = await fetchAPI<PortfolioItem[]>('/api/portfolios?populate=images');
  return Array.isArray(data) ? data : [];
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
  const portfolios = await getPortfolios();
  return portfolios.find((p) => p.slug === slug) || null;
}

export async function getPortfolioSlugs(): Promise<string[]> {
  const portfolios = await getPortfolios();
  return portfolios.map((p) => p.slug);
}

export async function getLatestBlogs(count: number = 3): Promise<BlogPost[]> {
  const blogs = await getBlogs();
  return blogs.slice(0, count);
}

export async function getFilteredPortfolios(
  count: number = 4
): Promise<PortfolioItem[]> {
  const portfolios = await getPortfolios();
  return portfolios.slice(0, count);
}
