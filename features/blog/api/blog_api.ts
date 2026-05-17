import { apiService } from '@/shared/services/api.service';
import type { BlogPostCard, BlogPostDetail, BlogCategory, BlogTag, ApiResponse } from '@/shared/types';

export async function getBlogPosts(params?: {
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<BlogPostCard[]> {
  const q = new URLSearchParams();
  if (params?.category) q.set('category', params.category);
  if (params?.tag) q.set('tag', params.tag);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit ?? 20));
  const res = await apiService.get<ApiResponse<BlogPostCard[]>>(`/api/v1/blog?${q}`);
  return res.data ?? [];
}

export async function getBlogPost(slug: string): Promise<BlogPostDetail> {
  const res = await apiService.get<ApiResponse<BlogPostDetail>>(`/api/v1/blog/${slug}`);
  return res.data;
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const res = await apiService.get<ApiResponse<BlogCategory[]>>('/api/v1/blog/categories');
  return res.data ?? [];
}

export async function getBlogTags(): Promise<BlogTag[]> {
  const res = await apiService.get<ApiResponse<BlogTag[]>>('/api/v1/blog/tags');
  return res.data ?? [];
}
