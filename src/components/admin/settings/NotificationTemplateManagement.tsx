"use client";
import { useState, useEffect } from "react";
import { useNotificationTemplateStore, NotificationTemplate } from "@/store/useNotificationTemplateStore";

export default function NotificationTemplateManagement() {
  const { notificationTemplates, fetchNotificationTemplates, createNotificationTemplate, updateNotificationTemplate, deleteNotificationTemplate, loading } = useNotificationTemplateStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUserRead, setIsUserRead] = useState(false);
  const [isAdminRead, setIsAdminRead] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchNotificationTemplates();
  }, [fetchNotificationTemplates]);

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setTitle('');
    setContent('');
    setIsUserRead(false);
    setIsAdminRead(false);
    setErrorMsg('');
    setIsOpen(true);
  };

  const openEdit = (t: NotificationTemplate) => {
    setEditingId(t.id);
    setName(t.name);
    setTitle(t.title);
    setContent(t.content);
    setIsUserRead(t.isUserRead);
    setIsAdminRead(t.isAdminRead);
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !content.trim()) return;
    setSaving(true);
    setErrorMsg('');

    const payload = {
      name: name.trim(),
      title: title.trim(),
      content: content.trim(),
      isUserRead,
      isAdminRead,
    };

    try {
      if (editingId) {
        await updateNotificationTemplate(editingId, payload);
      } else {
        await createNotificationTemplate(payload);
      }
      setIsOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save notification template.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRead = async (t: NotificationTemplate, field: 'isUserRead' | 'isAdminRead') => {
    try {
      await updateNotificationTemplate(t.id, {
        [field]: !t[field],
      });
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotificationTemplate(id);
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
          <h3 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">Notification Templates</h3>
          <p className="text-xs text-gray-400 mt-1 font-bold">Manage core systems template logs and reading permissions</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Notification Template
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-neutral-800">
              <th className="px-8 py-4">Template Name</th>
              <th className="px-8 py-4">Title / Header</th>
              <th className="px-8 py-4">Content Message</th>
              <th className="px-8 py-4 text-center">User Read</th>
              <th className="px-8 py-4 text-center">Admin Read</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
            {loading && notificationTemplates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center">
                  <div className="flex flex-col items-center justify-center animate-pulse">
                    <div className="w-8 h-8 border-3 border-gray-100 border-t-black dark:border-t-white rounded-full animate-spin mb-2" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading templates...</span>
                  </div>
                </td>
              </tr>
            ) : notificationTemplates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-widest italic">
                  No notification templates created yet. Add one to get started!
                </td>
              </tr>
            ) : (
              notificationTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-8 py-4 text-sm font-black text-gray-900 dark:text-gray-100">
                    {template.name}
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-gray-600 dark:text-gray-400">
                    {template.title}
                  </td>
                  <td className="px-8 py-4 text-xs font-medium text-gray-400 max-w-xs truncate">
                    {template.content}
                  </td>
                  <td className="px-8 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(template, 'isUserRead')}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                        template.isUserRead
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      }`}
                    >
                      {template.isUserRead ? 'Read' : 'Unread'}
                    </button>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(template, 'isAdminRead')}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                        template.isAdminRead
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50'
                          : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                      }`}
                    >
                      {template.isAdminRead ? 'Read' : 'Unread'}
                    </button>
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
                {editingId ? 'Edit Notification Template' : 'Add Notification Template'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1 cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto">
              <div>
                <label className={labelClass}>Template Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Order Shipped"
                />
              </div>

              <div>
                <label className={labelClass}>Notification Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Your order is on its way!"
                />
              </div>

              <div>
                <label className={labelClass}>Message Content</label>
                <textarea
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  className={`${inputClass} resize-none`}
                  placeholder="Enter notification message..."
                />
              </div>

              <div className="flex gap-8 px-1 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isUserRead}
                    onChange={e => setIsUserRead(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                    User Read by Default
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isAdminRead}
                    onChange={e => setIsAdminRead(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                    Admin Read by Default
                  </span>
                </label>
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
            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-gray-100 mb-2">Delete Notification Template?</h3>
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
