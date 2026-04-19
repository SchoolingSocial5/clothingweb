"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import TableLoader from "@/components/admin/TableLoader";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import { useBlogStore, Blog } from "@/store/useBlogStore";
import Toast from "@/components/admin/Toast";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

import { getImageUrl } from "@/utils/image";

interface BlogForm {
  title: string;
  category: string;
  subtitle: string;
  content: string;
}

const EMPTY_FORM: BlogForm = { title: "", category: "", subtitle: "", content: "" };

const quillModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean", "removeBackground"],
    ],
    handlers: {
      removeBackground: function (this: any) {
        this.quill.format("background", false);
      },
    },
  },
};

export default function BlogPage() {
  const { blogs, loading, fetchBlogs, createBlog, updateBlog, deleteBlog, bulkDeleteBlogs } = useBlogStore();

  const [selected, setSelected] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const allSelected = blogs.length > 0 && selected.length === blogs.length;
  const toggleAll = () => setSelected(allSelected ? [] : blogs.map((b) => b.id));
  const toggleOne = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openCreate = () => {
    setEditBlog(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (blog: Blog) => {
    setEditBlog(blog);
    setForm({
      title: blog.title,
      category: blog.category || "",
      subtitle: blog.subtitle || "",
      content: blog.content,
    });
    setImageFile(null);
    setImagePreview(getImageUrl(blog.image_url));
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("subtitle", form.subtitle);
      fd.append("content", form.content);
      if (imageFile) fd.append("image", imageFile);

      if (editBlog) {
        await updateBlog(editBlog.id, fd);
        showToast("Blog post updated successfully");
      } else {
        await createBlog(fd);
        showToast("Blog post published successfully");
      }
      await fetchBlogs();
      setShowModal(false);
    } catch (err: any) {
      showToast(err.message || "Failed to save blog post", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black";
  const labelClass = "block text-xs font-black uppercase tracking-widest text-gray-400 mb-2";

  return (
    <div className="p-[10px] md:p-8 w-full">
      <AdminPageHeader
        title="Blog"
        description="Manage blog posts and articles published on your store."
        stats={{ label: "Total Posts", value: blogs.length }}
      />

      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between gap-4">
          {selected.length > 0 ? (
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Delete {selected.length} Selected
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              {blogs.length} {blogs.length === 1 ? "post" : "posts"}
            </span>
          )}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Post
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 rounded accent-black cursor-pointer" />
                </th>
                <th className="px-4 py-4 w-12">S/N</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Subtitle</th>
                <th className="px-6 py-4">Content</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
              {blogs.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-gray-300 font-bold uppercase tracking-widest italic text-sm">
                    No blog posts yet. Write your first one!
                  </td>
                </tr>
              )}
              {blogs.map((blog, index) => (
                <tr key={blog.id} className={`hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors ${selected.includes(blog.id) ? "bg-gray-50 dark:bg-neutral-800/50" : ""}`}>
                  <td className="px-6 py-4">
                    <input type="checkbox" checked={selected.includes(blog.id)} onChange={() => toggleOne(blog.id)} className="w-4 h-4 rounded accent-black cursor-pointer" />
                  </td>
                  <td className="px-4 py-4 font-black text-gray-400 text-[11px]">{index + 1}</td>
                  <td className="px-6 py-4 max-w-[180px]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-neutral-700 flex items-center justify-center">
                        {blog.image_url ? (
                          <img src={getImageUrl(blog.image_url) || ""} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm line-clamp-2">{blog.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {blog.category ? (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{blog.category}</span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-[180px]">
                    <p className="text-sm text-gray-500 line-clamp-2">{blog.subtitle || "—"}</p>
                  </td>
                  <td className="px-6 py-4 max-w-[220px]">
                    <p className="text-xs text-gray-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: blog.content }} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(blog)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => setPendingDeleteId(blog.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && <TableLoader colSpan={7} />}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-800/50 flex-shrink-0">
              <h3 className="text-lg font-black uppercase tracking-tight">{editBlog ? "Edit Post" : "New Blog Post"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black transition-colors p-1 cursor-pointer">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                    className={inputClass}
                    placeholder="e.g. Top 5 Fashion Trends"
                  />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={inputClass}
                    placeholder="e.g. Fashion, Lifestyle"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  className={inputClass}
                  placeholder="A short teaser line"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className={labelClass}>Cover Image <span className="text-gray-300 font-medium normal-case tracking-normal">(optional)</span></label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </button>
                  {imagePreview && (
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="text-xs text-red-400 hover:text-red-600 font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className={labelClass}>Content <span className="text-red-400">*</span></label>
                <style>{`
                  .ql-removeBackground {
                    width: 26px !important;
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                  }
                  .ql-removeBackground::before {
                    content: '';
                    display: block;
                    width: 16px;
                    height: 16px;
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: contain;
                    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect x='1' y='9' width='14' height='5' rx='1' fill='%23fbbf24' stroke='%23d97706' stroke-width='0.8'/><path d='M4 9L8 2l4 7z' fill='%23555'/><line x1='2' y1='15' x2='14' y2='1' stroke='%23ef4444' stroke-width='1.8' stroke-linecap='round'/></svg>");
                    opacity: 0.7;
                    transition: opacity 0.15s;
                  }
                  .ql-removeBackground:hover::before { opacity: 1; }
                `}</style>
                <ReactQuill
                  theme="snow"
                  value={form.content}
                  onChange={(val) => setForm((f) => ({ ...f, content: val }))}
                  modules={quillModules}
                  placeholder="Write your blog post content here..."
                  style={{ minHeight: "200px" }}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : editBlog ? "Update Post" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => { if (pendingDeleteId) deleteBlog(pendingDeleteId); }}
        title="Delete Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={async () => {
          await bulkDeleteBlogs(selected);
          setSelected([]);
        }}
        title="Delete Posts"
        message={`Are you sure you want to delete ${selected.length} selected post${selected.length !== 1 ? "s" : ""}? This action cannot be undone.`}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}
