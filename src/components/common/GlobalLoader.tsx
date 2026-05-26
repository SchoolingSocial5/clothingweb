"use client";
import { useEffect, useState } from "react";
import PageLoader from "@/components/common/PageLoader";
import { useSettings } from "@/context/SettingsContext";
import { getActiveRequestsCount } from "@/utils/api";
import { useProductStore } from "@/store/useProductStore";
import { useWholesaleProductStore } from "@/store/useWholesaleProductStore";
import { useBannerStore } from "@/store/useBannerStore";
import { useBlogStore } from "@/store/useBlogStore";
import { useFaqStore } from "@/store/useFaqStore";

// This variable resides in module scope. It persists across component unmounts/remounts
// and only resets on hard page refresh or initial visit.
let isFirstLoadCompleted = false;

export default function GlobalLoader() {
  const { loading: settingsLoading } = useSettings();
  const [activeCount, setActiveCount] = useState(0);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [loaded, setLoaded] = useState(isFirstLoadCompleted);

  useEffect(() => {
    if (isFirstLoadCompleted) {
      setLoaded(true);
      return;
    }

    // Pre-fetch all shop resources in parallel on initial entry/refresh
    useProductStore.getState().fetchProducts().catch(() => {});
    useWholesaleProductStore.getState().fetchWholesaleProducts().catch(() => {});
    useBannerStore.getState().fetchBanners().catch(() => {});
    useBlogStore.getState().fetchPublicBlogs().catch(() => {});
    useFaqStore.getState().fetchFaqs().catch(() => {});

    setActiveCount(getActiveRequestsCount());

    const handleActiveRequests = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      setActiveCount(customEvent.detail);
    };

    window.addEventListener('api-active-requests', handleActiveRequests);

    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 1000);

    return () => {
      window.removeEventListener('api-active-requests', handleActiveRequests);
      clearTimeout(timer);
    };
  }, []);

  // Transition to loaded once all initial conditions are met
  useEffect(() => {
    if (!loaded && minTimePassed && !settingsLoading && activeCount === 0) {
      isFirstLoadCompleted = true;
      setLoaded(true);
    }
  }, [minTimePassed, settingsLoading, activeCount, loaded]);

  const isLoading = !loaded;

  return <PageLoader isLoading={isLoading} />;
}
