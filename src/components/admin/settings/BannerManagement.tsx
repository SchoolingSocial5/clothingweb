"use client";
import { useBannerStore } from "@/store/useBannerStore";
import { getImageUrl } from "@/utils/image";

interface Props {
  onAdd: () => void;
  onEdit: (banner: any) => void;
  onDeleteRequest: (id: number, title: string) => void;
}

export default function BannerManagement({ onAdd, onEdit, onDeleteRequest }: Props) {
  const { banners } = useBannerStore();

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-8 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/30 dark:bg-neutral-800/30">
        <div>
          <h3 className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-gray-100">Hero Banners</h3>
          <p className="text-xs text-gray-400 mt-1 font-bold">Manage images and text for the homepage carousel</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Banner
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
              <th className="px-8 py-4">Preview</th>
              <th className="px-8 py-4">Title</th>
              <th className="px-8 py-4">Subtitle</th>
              <th className="px-8 py-4">Category</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
            {banners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-widest italic">
                  No banners added yet. Add your first hero banner!
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="px-8 py-4">
                    <div className="w-24 h-12 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden border border-gray-100 dark:border-neutral-700">
                      {banner.image_url ? (
                        <img src={getImageUrl(banner.image_url) || undefined} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-black text-gray-900 dark:text-gray-100">
                    {banner.title || <span className="opacity-20 italic">No Title</span>}
                  </td>
                  <td className="px-8 py-4 text-xs font-bold text-gray-400 dark:text-gray-500">
                    {banner.subtitle || <span className="opacity-20 italic">No Subtitle</span>}
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      banner.category === 'About'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {banner.category || 'Home'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(banner)}
                      className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                      title="Edit Banner"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRequest(banner.id, banner.title)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer"
                      title="Delete Banner"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
