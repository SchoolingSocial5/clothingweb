"use client";
import { useEffect, useState } from "react";
import { useSocialMediaStore, SocialMediaPlatform, SocialMediaActivity } from "@/store/useSocialMediaStore";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function SocialMediaPage() {
  const { platforms, activities, loading, fetchData, createPlatform, updatePlatform, deletePlatform, createActivity, deleteActivity } = useSocialMediaStore();
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  const [platformForm, setPlatformForm] = useState({ name: "", url: "", handle: "", icon: "" });
  const [activityForm, setActivityForm] = useState({ platform_id: "", activity_type: "Post", description: "", date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlatform(platformForm);
      setIsPlatformModalOpen(false);
      setPlatformForm({ name: "", url: "", handle: "", icon: "" });
    } catch (err) {}
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createActivity(activityForm);
      setIsActivityModalOpen(false);
      setActivityForm({ platform_id: "", activity_type: "Post", description: "", date: new Date().toISOString().split('T')[0] });
    } catch (err) {}
  };

  return (
    <div className="p-8 pb-32">
      <AdminPageHeader 
        title="Social Media" 
        description="Manage your brand's social media presence and track activities."
        stats={{ label: "Active Platforms", value: platforms.length }}
      >
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPlatformModalOpen(true)}
            className="bg-white text-black border border-gray-200 px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            Add Platform
          </button>
          <button 
            onClick={() => setIsActivityModalOpen(true)}
            className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
          >
            Log Activity
          </button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platforms List */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-black uppercase tracking-widest text-xs text-gray-400 px-2">Connected Platforms</h3>
          <div className="grid grid-cols-1 gap-4">
            {platforms.map(platform => (
              <div key={platform.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                    {platform.name.toLowerCase().includes('insta') ? '📸' : 
                     platform.name.toLowerCase().includes('face') ? '🔵' : 
                     platform.name.toLowerCase().includes('twit') || platform.name.toLowerCase().includes(' x ') ? '🐦' : '🔗'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{platform.name}</h4>
                    <p className="text-xs text-gray-500">{platform.handle || platform.url || 'No handle set'}</p>
                  </div>
                </div>
                <button onClick={() => deletePlatform(platform.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
            {platforms.length === 0 && !loading && (
              <div className="bg-gray-50 border border-dashed border-gray-200 p-8 rounded-2xl text-center text-gray-400 font-medium">
                No platforms added yet.
              </div>
            )}
          </div>
        </div>

        {/* Activities Table */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-black uppercase tracking-widest text-xs text-gray-400 px-2">Recent Activities</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                    <th className="px-6 py-4">Platform</th>
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activities.map(activity => (
                    <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm text-gray-900">{activity.platform?.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest text-blue-600">{activity.activity_type}</span>
                          <span className="text-sm text-gray-600 mt-1">{activity.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => deleteActivity(activity.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">No activities recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Modal */}
      {isPlatformModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add Platform</h3>
              <button onClick={() => setIsPlatformModalOpen(false)} className="text-gray-400 hover:text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handlePlatformSubmit} className="p-8 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Platform Name</label>
                <input required type="text" value={platformForm.name} onChange={e => setPlatformForm({...platformForm, name: e.target.value})} placeholder="Instagram, Facebook, etc." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Username / Handle</label>
                <input type="text" value={platformForm.handle} onChange={e => setPlatformForm({...platformForm, handle: e.target.value})} placeholder="@wink_store" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Account URL</label>
                <input type="url" value={platformForm.url} onChange={e => setPlatformForm({...platformForm, url: e.target.value})} placeholder="https://instagram.com/..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsPlatformModalOpen(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors">Save Platform</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Log Social Activity</h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="text-gray-400 hover:text-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleActivitySubmit} className="p-8 space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Platform</label>
                <select required value={activityForm.platform_id} onChange={e => setActivityForm({...activityForm, platform_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none">
                  <option value="">Select Platform</option>
                  {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Type</label>
                  <select value={activityForm.activity_type} onChange={e => setActivityForm({...activityForm, activity_type: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none">
                    <option>Post</option>
                    <option>Story</option>
                    <option>Reel</option>
                    <option>Advertisement</option>
                    <option>Mention</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Date</label>
                  <input required type="date" value={activityForm.date} onChange={e => setActivityForm({...activityForm, date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                <textarea rows={3} value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} placeholder="e.g. Posted new arrivals carousel" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsActivityModalOpen(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors">Log Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
