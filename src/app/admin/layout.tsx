"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import AdminTopHeader from '@/components/admin/AdminTopHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { socket } from '@/utils/socket';
import { useOrderStore } from '@/store/useOrderStore';
import { useWholesaleOrderStore } from '@/store/useWholesaleOrderStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { fetchUnpaidCount, addLiveOrder } = useOrderStore();
  const addLiveWholesaleOrder = useWholesaleOrderStore(state => state.addLiveOrder);

  const isSuper = user?.role === 'admin' || user?.status === 'admin' || user?.staffPosition === 'Director' || user?.staffPosition === 'Developer';
  const staffType = user?.staff_type || user?.staffType || 'Retail';

  const canShowRetail = isSuper || staffType === 'Retail' || staffType === 'All';
  const canShowWholesale = isSuper || staffType === 'Wholesale' || staffType === 'All';

  useEffect(() => {
    socket.connect();
    if (!loading && user && canShowRetail) {
      fetchUnpaidCount();
    }

    let audioUnlockedInstance: HTMLAudioElement | null = null;
    let activeAudio: HTMLAudioElement | null = null;

    try {
      audioUnlockedInstance = new Audio('/ring_tone.mp3');
      audioUnlockedInstance.load();
    } catch (e) {
      console.error("Audio init error:", e);
    }

    const unlock = () => {
      if (audioUnlockedInstance) {
        audioUnlockedInstance.volume = 0;
        audioUnlockedInstance.play()
          .then(() => {
            console.log("Audio system successfully unlocked for real-time ringtone notifications!");
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
          })
          .catch((err) => {
            console.warn("Failed to unlock audio channel:", err);
          });
      }
    };

    const stopRinging = () => {
      if (activeAudio) {
        console.log("User action detected. Stopping notification sound!");
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio = null;
      }
    };

    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('click', stopRinging);
    window.addEventListener('mousemove', stopRinging);
    window.addEventListener('keydown', stopRinging);
    window.addEventListener('scroll', stopRinging);
    window.addEventListener('touchstart', stopRinging);

    const handleNewOrder = (order: any) => {
      if (!canShowRetail) return; // Skip retail order alerts for wholesale staff
      console.log("New live order received via socket:", order);
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      activeAudio = new Audio('/ring_tone.mp3');
      activeAudio.volume = 1.0;
      activeAudio.loop = true;
      activeAudio.play()
        .then(() => {
          console.log("Ringtone played successfully!");
        })
        .catch((err) => {
          console.error("Autoplay blocked or failed. Interact with document to enable sound alerts:", err);
        });
      addLiveOrder(order);
    };

    const handleNewWholesaleOrder = (order: any) => {
      if (!canShowWholesale) return; // Skip wholesale order alerts for retail staff
      console.log("New live wholesale order received via socket:", order);
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      activeAudio = new Audio('/ring_tone.mp3');
      activeAudio.volume = 1.0;
      activeAudio.loop = true;
      activeAudio.play()
        .then(() => {
          console.log("Ringtone played successfully!");
        })
        .catch((err) => {
          console.error("Autoplay blocked or failed. Interact with document to enable sound alerts:", err);
        });
      addLiveWholesaleOrder(order);
    };

    socket.on('newOrder', handleNewOrder);
    socket.on('newWholesaleOrder', handleNewWholesaleOrder);

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('click', stopRinging);
      window.removeEventListener('mousemove', stopRinging);
      window.removeEventListener('keydown', stopRinging);
      window.removeEventListener('scroll', stopRinging);
      window.removeEventListener('touchstart', stopRinging);
      if (activeAudio) {
        activeAudio.pause();
        activeAudio = null;
      }
      socket.off('newOrder', handleNewOrder);
      socket.off('newWholesaleOrder', handleNewWholesaleOrder);
      socket.disconnect();
    };
  }, [fetchUnpaidCount, addLiveOrder, addLiveWholesaleOrder, canShowRetail, canShowWholesale, loading, user]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/sign-in');
      } else if (user.status !== 'staff') {
        alert("You are not authorized to access the admin panel.");
        logout();
      }
    }
  }, [user, loading, router, logout]);

  if (loading || !user || user.status !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex transition-colors duration-300 overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen md:pl-64">
        <AdminTopHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {children}
      </main>
    </div>
  );
}
