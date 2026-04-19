"use client";
import { useState, useEffect } from "react";
import { useBannerStore } from "@/store/useBannerStore";
import { getImageUrl, compressImage } from "@/utils/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingId: number | null;
  bannerToEdit: any;
}

export default function BannerModal({ isOpen, onClose, editingId, bannerToEdit }: Props) {
  const { addBanner, updateBanner } = useBannerStore();
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', category: 'Home', image: null as File | null });
  const [bannerPreview, setBannerPreview] = useState("");
  const [creatingBanner, setCreatingBanner] = useState(false);
  const [bannerError, setBannerError] = useState('');

  useEffect(() => {
    if (editingId && bannerToEdit) {
      setNewBanner({
        title: bannerToEdit.title || '',
        subtitle: bannerToEdit.subtitle || '',
        category: bannerToEdit.category || 'Home',
        image: null
      });
      setBannerPreview(getImageUrl(bannerToEdit.image_url) || "");
    } else {
      setNewBanner({ title: '', subtitle: '', category: 'Home', image: null });
      setBannerPreview("");
    }
    setBannerError('');
  }, [editingId, bannerToEdit, isOpen]);

  const handleBannerFileChange = (file: File) => {
    setNewBanner(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.image && !editingId) return;
    setCreatingBanner(true);

    const data = new FormData();
    if (newBanner.image) {
      const compressedImage = await compressImage(newBanner.image);
      data.append('image', compressedImage);
    }
    data.append('title', newBanner.title);
    data.append('subtitle', newBanner.subtitle);
    data.append('category', newBanner.category);

    try {
      if (editingId) {
        await updateBanner(editingId, data);
      } else {
        await addBanner(data);
      }
      onClose();
    } catch (err: any) {
      const details = err.data?.errors
        ? Object.values(err.data.errors as Record<string, string[]>).flat().join(' ')
        : err.message || 'Saving failed. Please try again.';
      setBannerError(details);
    } finally {
      setCreatingBanner(false);
    }
  };

  const inputClass = "w-full px-5 py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-xl relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/50 flex-shrink-0 rounded-t-3xl">
          <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
            {editingId ? 'Edit Banner' : 'Add New Banner'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1 cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSaveBanner} className="p-8 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <label className={labelClass}>Banner Image</label>
            <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 hover:border-black transition-colors aspect-[16/8] bg-gray-50 flex items-center justify-center">
              {bannerPreview ? (
                <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <svg className="mx-auto text-gray-300 mb-2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Image</p>
                </div>
              )}
              <input type="file" required={!editingId} onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleBannerFileChange(file);
              }} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Banner Title</label>
            <input 
              type="text" 
              value={newBanner.title} 
              onChange={e => setNewBanner(prev => ({...prev, title: e.target.value}))} 
              className={inputClass} 
              placeholder="e.g. New Summer Collection" 
            />
          </div>

          <div>
            <label className={labelClass}>Banner Subtitle</label>
            <input
              type="text"
              value={newBanner.subtitle}
              onChange={e => setNewBanner(prev => ({...prev, subtitle: e.target.value}))}
              className={inputClass}
              placeholder="e.g. Up to 50% Off Everything"
            />
          </div>

          <div>
            <label className={labelClass}>Banner Category</label>
            <input
              type="text"
              value={newBanner.category}
              onChange={e => setNewBanner(prev => ({...prev, category: e.target.value}))}
              className={inputClass}
              placeholder="e.g. Home, About, Sale"
            />
          </div>

          {bannerError && (
            <p className="text-red-500 text-sm font-semibold bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-100 dark:border-red-800">
              {bannerError}
            </p>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={creatingBanner || (!newBanner.image && !editingId)}
              className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-gray-900 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {creatingBanner ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
