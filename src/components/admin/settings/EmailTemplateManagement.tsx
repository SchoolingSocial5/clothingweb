"use client";
import { useState, useEffect } from "react";
import { useEmailTemplateStore, EmailTemplate } from "@/store/useEmailTemplateStore";
import { getImageUrl, compressImage } from "@/utils/image";

export default function EmailTemplateManagement() {
  const { emailTemplates, fetchEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate, loading } = useEmailTemplateStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchEmailTemplates();
  }, [fetchEmailTemplates]);

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setTitle('');
    setContent('');
    setImage(null);
    setImagePreview('');
    setErrorMsg('');
    setIsOpen(true);
  };

  const openEdit = (t: EmailTemplate) => {
    setEditingId(t.id);
    setName(t.name);
    setTitle(t.title);
    setContent(t.content);
    setImage(null);
    setImagePreview(t.banner ? getImageUrl(t.banner) || '' : '');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleFileChange = (file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !content.trim()) return;
    setSaving(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    if (image) {
      try {
        const compressed = await compressImage(image);
        formData.append('banner', compressed);
      } catch (err) {
        formData.append('banner', image);
      }
    }

    try {
      if (editingId) {
        await updateEmailTemplate(editingId, formData);
      } else {
        await createEmailTemplate(formData);
      }
      setIsOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save email template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmailTemplate(id);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Delete template failed:', err);
    }
  };

  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1";
  const inputClass = "w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl text-sm font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all";

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-[32px] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors animate-in fade-in duration-300">
      <div className="p-8 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/30 dark:bg-neutral-800/30">
        <div>
          <h3 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">Email Templates</h3>
          <p className="text-xs text-gray-400 mt-1 font-bold">Design and customize the layout of emails sent to customers</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Email Template
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-neutral-800">
              <th className="px-8 py-4">Banner</th>
              <th className="px-8 py-4">Template Name</th>
              <th className="px-8 py-4">Subject Title</th>
              <th className="px-8 py-4">Content Preview</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
            {loading && emailTemplates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center">
                  <div className="flex flex-col items-center justify-center animate-pulse">
                    <div className="w-8 h-8 border-3 border-gray-100 border-t-black dark:border-t-white rounded-full animate-spin mb-2" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading templates...</span>
                  </div>
                </td>
              </tr>
            ) : emailTemplates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-widest italic">
                  No email templates created yet. Add one to get started!
                </td>
              </tr>
            ) : (
              emailTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="w-24 h-12 rounded-lg bg-gray-50 dark:bg-neutral-800 overflow-hidden border border-gray-100 dark:border-neutral-800 flex items-center justify-center">
                      {template.banner ? (
                        <img src={getImageUrl(template.banner) || undefined} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-300">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-black text-gray-900 dark:text-gray-100">
                    {template.name}
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-gray-600 dark:text-gray-400">
                    {template.title}
                  </td>
                  <td className="px-8 py-4 text-xs font-medium text-gray-400 max-w-xs truncate">
                    {template.content}
                  </td>
                  <td className="px-8 py-4 text-right flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(template)}
                      className="p-2.5 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl transition-all cursor-pointer"
                      title="Edit Template"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(template.id)}
                      className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                      title="Delete Template"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)}></div>
          <div className="bg-white dark:bg-neutral-900 rounded-[32px] w-full max-w-xl relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/50 rounded-t-[32px]">
              <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
                {editingId ? 'Edit Email Template' : 'Add Email Template'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1 cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <label className={labelClass}>Template Banner Image</label>
                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all aspect-[16/6] bg-gray-50 dark:bg-neutral-800 flex items-center justify-center cursor-pointer">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <svg className="mx-auto text-gray-300 mb-2" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Upload Banner Image</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Template Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Welcome Email"
                />
              </div>

              <div>
                <label className={labelClass}>Email Subject / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Welcome to Hi-Health!"
                />
              </div>

              <div>
                <label className={labelClass}>Email Body Content</label>
                <textarea
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  className={`${inputClass} resize-none`}
                  placeholder="Enter email content..."
                />
              </div>

              {errorMsg && (
                <p className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-950/20 px-5 py-4 rounded-2xl border border-red-100 dark:border-red-900">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-100 dark:border-neutral-800 rounded-2xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim() || !title.trim() || !content.trim()}
                  className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save Template'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowDeleteConfirm(null)}></div>
          <div className="bg-white dark:bg-neutral-900 rounded-[32px] w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-300 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">Delete Email Template?</h3>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 leading-relaxed mb-6">Are you sure you want to delete this template? This action is permanent and cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-100 dark:border-neutral-800 rounded-xl transition-colors cursor-pointer"
              >
                No, Keep
              </button>
              <button
                type="button"
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
