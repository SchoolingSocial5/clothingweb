import { create } from 'zustand';
import { apiClient } from '@/utils/api';

export interface Blog {
  id: number;
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
  createBlog: (data: FormData) => Promise<void>;
  updateBlog: (id: number, data: FormData) => Promise<void>;
  deleteBlog: (id: number) => Promise<void>;
  bulkDeleteBlogs: (ids: number[]) => Promise<void>;
}

export const useBlogStore = create<BlogStore>((set, get) => ({
  blogs: [],
  loading: false,

  fetchBlogs: async () => {
    if (get().blogs.length === 0) set({ loading: true });
    try {
      const data = await apiClient('/admin/blogs');
      set({ blogs: data, loading: false });
    } catch {
      set({ loading: false });
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
