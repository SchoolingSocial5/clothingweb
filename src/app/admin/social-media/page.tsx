"use client";
import { useEffect, useState, useRef } from "react";
import { useSocialMediaStore, SocialMediaPlatform, SocialMediaActivity } from "@/store/useSocialMediaStore";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function SocialMediaPage() {
  const { platforms, activities, loading, fetchData, createPlatform, updatePlatform, deletePlatform, createActivity, deleteActivity } = useSocialMediaStore();
  const [activeTab, setActiveTab] = useState<number | 'all'>('all');
  
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  const [platformForm, setPlatformForm] = useState({ 
    name: "", url: "", handle: "", icon: null as File | null, 
    email: "", password: "", phone_number: "" 
  });
  
  const [activityForm, setActivityForm] = useState({ 
    platform_id: "", name: "", activity_type: "Post", description: "", 
    followers: 0, posts_count: 0, likes_count: 0, comments_count: 0, 
    date: new Date().toISOString().split('T')[0], image: null as File | null 
  });

  const iconInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', platformForm.name);
    if (platformForm.url) formData.append('url', platformForm.url);
    if (platformForm.handle) formData.append('handle', platformForm.handle);
    if (platformForm.email) formData.append('email', platformForm.email);
    if (platformForm.password) formData.append('password', platformForm.password);
    if (platformForm.phone_number) formData.append('phone_number', platformForm.phone_number);
    if (platformForm.icon) formData.append('icon', platformForm.icon);

    try {
      await createPlatform(formData);
      setIsPlatformModalOpen(false);
      setPlatformForm({ name: "", url: "", handle: "", icon: null, email: "", password: "", phone_number: "" });
    } catch (err) {}
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('platform_id', activityForm.platform_id);
    formData.append('name', activityForm.name);
    formData.append('activity_type', activityForm.activity_type);
    if (activityForm.description) formData.append('description', activityForm.description);
    formData.append('followers', activityForm.followers.toString());
    formData.append('posts_count', activityForm.posts_count.toString());
    formData.append('likes_count', activityForm.likes_count.toString());
    formData.append('comments_count', activityForm.comments_count.toString());
    formData.append('date', activityForm.date);
    if (activityForm.image) formData.append('image', activityForm.image);

    try {
      await createActivity(formData);
      setIsActivityModalOpen(false);
      setActivityForm({ 
        platform_id: "", name: "", activity_type: "Post", description: "", 
        followers: 0, posts_count: 0, likes_count: 0, comments_count: 0, 
        date: new Date().toISOString().split('T')[0], image: null 
      });
    } catch (err) {}
  };

  const filteredActivities = activeTab === 'all' 
    ? activities 
    : activities.filter(a => a.platform_id === activeTab);

  return (
    <div className="p-[10px] md:p-8 pb-32 md:pb-32 w-full">
      <AdminPageHeader 
        title="Social Media Hub" 
        description="Monitor engagement, manage accounts, and track multi-channel growth."
        stats={{ label: "Active Platforms", value: platforms.length }}
      >
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPlatformModalOpen(true)}
            className="group relative bg-white text-black border border-gray-200 px-4 py-2 md:px-6 md:py-3 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer overflow-hidden"
          >
            <span className="relative z-10">Add Account</span>
            <div className="absolute inset-0 bg-gray-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
          <button 
            onClick={() => setIsActivityModalOpen(true)}
            className="bg-black text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl text-sm font-bold shadow-xl shadow-black/10 hover:bg-gray-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            Update Stats
          </button>
        </div>
      </AdminPageHeader>

      {/* Horizontal Tabs */}
      <div className="mb-10 relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${activeTab === 'all' ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}
          >
            All Channels
          </button>
          
          {platforms.map(platform => (
            <button 
              key={platform.id}
              onClick={() => setActiveTab(platform.id)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-3 ${activeTab === platform.id ? 'bg-white text-black border-black shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
            >
              {platform.icon ? (
                <img src={platform.icon} className="w-5 h-5 rounded-md object-cover" alt="" />
              ) : (
                <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center text-[10px]">
                  {platform.name.charAt(0)}
                </div>
              )}
              {platform.name}
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
      </div>

      {/* Content Area */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">
            {activeTab === 'all' ? 'Consolidated Performance' : `${platforms.find(p => p.id === activeTab)?.name} Reports`}
          </h3>
          <div className="text-[10px] font-bold text-gray-400">
            TOTAL RECORDS: {filteredActivities.length}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-8 py-6">Reference / Image</th>
                  <th className="px-8 py-6">Engagement Report</th>
                  <th className="px-8 py-6">Activity Type</th>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                {filteredActivities.map(activity => (
                  <tr key={activity.id} className="group hover:bg-gray-50/30 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                          {activity.image_url ? (
                            <img src={activity.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-300">
                               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{activity.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {activity.platform?.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 dark:text-gray-100">{activity.followers.toLocaleString()}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Followers</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 dark:text-gray-100">{activity.likes_count.toLocaleString()}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Likes</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 dark:text-gray-100">{activity.comments_count.toLocaleString()}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Comments</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                        {activity.activity_type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                        {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => deleteActivity(activity.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredActivities.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">No activities found</h4>
                        <p className="text-xs text-gray-400">Start by adding an account or logging your first performance update.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Platform Modal */}
      {isPlatformModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-gray-50 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/50">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Add Channel</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Connect a new social media profile</p>
              </div>
              <button onClick={() => setIsPlatformModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:text-black hover:border-black transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handlePlatformSubmit} className="p-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Brand Name</label>
                    <input required type="text" value={platformForm.name} onChange={e => setPlatformForm({...platformForm, name: e.target.value})} placeholder="Instagram, Twitter, etc." className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Account URL</label>
                    <input type="url" value={platformForm.url} onChange={e => setPlatformForm({...platformForm, url: e.target.value})} placeholder="https://..." className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Email Address</label>
                    <input type="email" value={platformForm.email} onChange={e => setPlatformForm({...platformForm, email: e.target.value})} placeholder="social@brand.com" className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                  </div>
                </div>
                
                <div className="space-y-6">
                   <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Handle / Username</label>
                    <input type="text" value={platformForm.handle} onChange={e => setPlatformForm({...platformForm, handle: e.target.value})} placeholder="@username" className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Password (Opt)</label>
                      <input type="password" value={platformForm.password} onChange={e => setPlatformForm({...platformForm, password: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Phone (Opt)</label>
                      <input type="tel" value={platformForm.phone_number} onChange={e => setPlatformForm({...platformForm, phone_number: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Channel Icon</label>
                    <div 
                      onClick={() => iconInputRef.current?.click()}
                      className="w-full h-14 bg-white border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all group overflow-hidden"
                    >
                      {platformForm.icon ? (
                        <span className="text-xs font-bold text-black">{platformForm.icon.name}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-300 group-hover:text-black"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-black">Upload Icon</span>
                        </div>
                      )}
                      <input type="file" ref={iconInputRef} className="hidden" accept="image/*" onChange={e => setPlatformForm({...platformForm, icon: e.target.files?.[0] || null})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <button type="button" onClick={() => setIsPlatformModalOpen(false)} className="flex-1 px-8 py-5 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all">Discard</button>
                <button type="submit" className="flex-1 px-8 py-5 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-gray-800 transition-all">Save Channel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-gray-50 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/50">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Post Analysis</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Record report & engagement stats</p>
              </div>
              <button onClick={() => setIsActivityModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:text-black hover:border-black transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleActivitySubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Channel</label>
                    <select required value={activityForm.platform_id} onChange={e => setActivityForm({...activityForm, platform_id: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all appearance-none cursor-pointer dark:text-gray-100">
                      <option value="">Select Platform</option>
                      {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Activity Name / Subject</label>
                    <input required type="text" value={activityForm.name} onChange={e => setActivityForm({...activityForm, name: e.target.value})} placeholder="e.g. Summer Campaign Week 1" className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Type</label>
                      <select value={activityForm.activity_type} onChange={e => setActivityForm({...activityForm, activity_type: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all cursor-pointer">
                        <option>Post</option>
                        <option>Story</option>
                        <option>Reel</option>
                        <option>Live</option>
                        <option>Ad</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Date</label>
                      <input required type="date" value={activityForm.date} onChange={e => setActivityForm({...activityForm, date: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Post / Preview Image</label>
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full h-24 bg-white border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all group overflow-hidden"
                    >
                      {activityForm.image ? (
                         <div className="relative w-full h-full">
                            <img src={URL.createObjectURL(activityForm.image)} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</span>
                            </div>
                         </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-200 group-hover:text-black"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-black">Upload Visual</span>
                        </div>
                      )}
                      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={e => setActivityForm({...activityForm, image: e.target.files?.[0] || null})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Followers</label>
                      <input type="number" value={activityForm.followers} onChange={e => setActivityForm({...activityForm, followers: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Posts</label>
                      <input type="number" value={activityForm.posts_count} onChange={e => setActivityForm({...activityForm, posts_count: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Likes</label>
                      <input type="number" value={activityForm.likes_count} onChange={e => setActivityForm({...activityForm, likes_count: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Comments</label>
                      <input type="number" value={activityForm.comments_count} onChange={e => setActivityForm({...activityForm, comments_count: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all dark:text-gray-100" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Notes / Description</label>
                    <textarea rows={4} value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} placeholder="Key takeaways from this period..." className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-0 focus:border-black outline-none font-bold text-sm transition-all resize-none dark:text-gray-100" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsActivityModalOpen(false)} className="flex-1 px-8 py-5 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-5 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-gray-800 transition-all">Update Analytics</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
