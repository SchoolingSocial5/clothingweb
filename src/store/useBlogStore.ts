import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Blog {
  id: string;
  title: string;
  category: string | null;
  subtitle: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface BlogStore {
  blogs: Blog[];
  loading: boolean;
  fetchBlogs: () => Promise<void>;
  fetchPublicBlogs: () => Promise<Blog[]>;
  createBlog: (data: FormData) => Promise<void>;
  updateBlog: (id: string, data: FormData) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  bulkDeleteBlogs: (ids: string[]) => Promise<void>;
}

export const useBlogStore = create<BlogStore>((set) => ({
  blogs: [],
  loading: false,

  fetchBlogs: async () => {
    set({ loading: true });
    try {
      const data = await apiClient('/admin/blogs');
      set({ blogs: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchPublicBlogs: async () => {
    set({ loading: true });
    try {
      const data = await apiClient<Blog[]>('/blogs');
      set({ blogs: data, loading: false });
      return data;
    } catch (err) {
      set({ loading: false });
      return [];
    }
  },

  createBlog: async (data) => {
    const blog = await apiClient('/admin/blogs', { method: 'POST', body: data, isFormData: true });
    set((s) => ({ blogs: [blog, ...s.blogs] }));
  },

  updateBlog: async (id, data) => {
    // Laravel needs POST + _method=PUT for multipart
    data.append('_method', 'PUT');
    const blog = await apiClient(`/admin/blogs/${id}`, { method: 'POST', body: data, isFormData: true });
    set((s) => ({ blogs: s.blogs.map((b) => (b.id === id ? blog : b)) }));
  },

  deleteBlog: async (id) => {
    await apiClient(`/admin/blogs/${id}`, { method: 'DELETE' });
    set((s) => ({ blogs: s.blogs.filter((b) => b.id !== id) }));
  },

  bulkDeleteBlogs: async (ids) => {
    await apiClient('/admin/blogs', { method: 'DELETE', body: JSON.stringify({ ids }) });
    set((s) => ({ blogs: s.blogs.filter((b) => !ids.includes(b.id)) }));
  },
}));
