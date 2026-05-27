"use client";
import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/utils/api';
import { socket } from '@/utils/socket';

interface Dispatcher {
  id: string | number;
  name: string;
  phone?: string;
  email: string;
  staffPosition?: string;
  latitude: number;
  longitude: number;
  lastLocationUpdate: string;
}

interface MapModalProps {
  onClose: () => void;
}

export default function MapModal({ onClose }: MapModalProps) {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  const isValidToken = mapboxToken && mapboxToken.startsWith('pk.') && mapboxToken.length > 25;

  // 1. Fetch live dispatch locations
  const fetchLocations = async () => {
    try {
      const data = await apiClient<Dispatcher[]>('/admin/users/dispatch/locations');
      setDispatchers(data);
      setError(null);
      return data;
    } catch (err: any) {
      console.error('Failed to load dispatch locations:', err);
      setError('Failed to load active dispatchers from database');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();

    if (!socket.connected) socket.connect();

    const handleLocationUpdate = (updatedDisp: any) => {
      setDispatchers((prev) => {
        const dispId = updatedDisp.id || updatedDisp._id;
        
        if (!updatedDisp.isTrackingEnabled) {
          // Remove dispatcher from list if they turn location tracking OFF
          return prev.filter(d => String(d.id || (d as any)._id) !== String(dispId));
        }

        const exists = prev.some(d => String(d.id || (d as any)._id) === String(dispId));
        if (exists) {
          // Update dispatcher's coordinates inside state if they already exist
          return prev.map(d => 
            String(d.id || (d as any)._id) === String(dispId)
              ? { ...d, latitude: updatedDisp.latitude, longitude: updatedDisp.longitude, lastLocationUpdate: updatedDisp.lastLocationUpdate }
              : d
          );
        } else {
          // Append dispatcher if they newly turned tracking ON
          return [...prev, {
            id: dispId,
            name: updatedDisp.name,
            phone: updatedDisp.phone,
            email: updatedDisp.email,
            staffPosition: updatedDisp.staffPosition,
            latitude: updatedDisp.latitude,
            longitude: updatedDisp.longitude,
            lastLocationUpdate: updatedDisp.lastLocationUpdate
          }];
        }
      });
    };

    socket.on('locationUpdated', handleLocationUpdate);

    return () => {
      socket.off('locationUpdated', handleLocationUpdate);
    };
  }, []);

  const validDispatchers = dispatchers.filter(disp => 
    disp && 
    typeof disp.latitude === 'number' && 
    typeof disp.longitude === 'number' &&
    !isNaN(disp.latitude) && 
    !isNaN(disp.longitude) &&
    disp.latitude >= -90 && disp.latitude <= 90 &&
    disp.longitude >= -180 && disp.longitude <= 180
  );

  // 2. Dynamically load Mapbox GL script & stylesheet
  useEffect(() => {
    if (loading || error || !isValidToken) return;

    let mapboxglScript = document.getElementById('mapbox-gl-script') as HTMLScriptElement;
    let mapboxglCSS = document.getElementById('mapbox-gl-css') as HTMLLinkElement;

    const initializeMap = () => {
      try {
        const windowGL = (window as any).mapboxgl;
        if (!windowGL || !mapContainerRef.current) return;

        windowGL.accessToken = mapboxToken;

        // Center map around first valid dispatcher or Lagos, Nigeria by default
        const defaultCenter: [number, number] = validDispatchers.length > 0
          ? [validDispatchers[0].longitude, validDispatchers[0].latitude]
          : [3.3792, 6.5244]; // Lagos, Nigeria

        if (!mapRef.current) {
          mapRef.current = new windowGL.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: defaultCenter,
            zoom: validDispatchers.length > 0 ? 13 : 9,
          });

          mapRef.current.addControl(new windowGL.NavigationControl(), 'top-right');
        }

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Render fresh markers for each valid dispatcher
        validDispatchers.forEach(disp => {
          try {
            // Create custom delivery marker element
            const el = document.createElement('div');
            el.className = 'w-9 h-9 bg-red-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform';
            el.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            `;

            // Create popup content
            const popup = new windowGL.Popup({ offset: 25 }).setHTML(`
              <div class="p-2 space-y-1 select-none font-sans">
                <p class="font-extrabold text-sm text-gray-900">${disp.name}</p>
                <p class="text-xs text-gray-500 font-bold uppercase tracking-wider">${disp.staffPosition || 'Dispatcher'}</p>
                <p class="text-xs text-gray-400 font-medium">${disp.phone || 'No phone'}</p>
                <div class="flex items-center gap-1.5 pt-1 border-t border-gray-100 mt-1">
                  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <p class="text-[9px] text-gray-400 font-bold uppercase">Online Now</p>
                </div>
              </div>
            `);

            const marker = new windowGL.Marker(el)
              .setLngLat([disp.longitude, disp.latitude])
              .setPopup(popup)
              .addTo(mapRef.current);

            markersRef.current.push(marker);
          } catch (markerErr) {
            console.error('Error drawing map marker:', markerErr);
          }
        });
      } catch (mapInitErr: any) {
        console.error('Mapbox canvas initialization error:', mapInitErr);
        setError('Mapbox could not initialize. Please verify your token and browser WebGL compatibility.');
      }
    };

    if (!mapboxglScript) {
      // Load CSS
      mapboxglCSS = document.createElement('link');
      mapboxglCSS.id = 'mapbox-gl-css';
      mapboxglCSS.rel = 'stylesheet';
      mapboxglCSS.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
      document.head.appendChild(mapboxglCSS);

      // Load JS
      mapboxglScript = document.createElement('script');
      mapboxglScript.id = 'mapbox-gl-script';
      mapboxglScript.src = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js';
      mapboxglScript.async = true;
      mapboxglScript.onload = initializeMap;
      document.head.appendChild(mapboxglScript);
    } else {
      if ((window as any).mapboxgl) {
        initializeMap();
      } else {
        mapboxglScript.addEventListener('load', initializeMap);
      }
    }

    return () => {
      if (mapboxglScript) {
        mapboxglScript.removeEventListener('load', initializeMap);
      }
    };
  }, [loading, error, validDispatchers, mapboxToken]);

  const selectDispatcher = (disp: Dispatcher) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [disp.longitude, disp.latitude],
        zoom: 15,
        essential: true
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-neutral-900 rounded-[40px] w-full max-w-4xl h-[80vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sidebar Info Panel */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-100 dark:border-neutral-800 p-6 flex flex-col justify-between max-h-[30vh] md:max-h-full">
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Active Dispatchers</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Live GPS Tracking</p>
              </div>
              <button 
                onClick={onClose}
                className="md:hidden p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-12 space-y-2">
                <div className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 animate-pulse">Checking GPS Coordinates...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-center">
                <p className="text-xs font-bold text-red-500">{error}</p>
              </div>
            ) : validDispatchers.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center text-gray-400 mx-auto">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <p className="text-xs font-bold text-gray-500">No active dispatchers found online</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed px-4">Dispatchers must click 'Enable Location' in their sidebar to start sharing coordinates.</p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {validDispatchers.map(disp => (
                  <div 
                    key={disp.id}
                    onClick={() => selectDispatcher(disp)}
                    className="p-4 bg-gray-50 dark:bg-neutral-800 hover:bg-red-50/50 dark:hover:bg-red-950/20 border border-gray-100 dark:border-neutral-700/50 rounded-2xl cursor-pointer transition-all active:scale-98 group flex items-start justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{disp.name}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{disp.staffPosition || 'Dispatcher'}</p>
                      <p className="text-xs text-gray-500 font-semibold">{disp.phone || 'No phone'}</p>
                    </div>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mt-1"></span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block pt-4 border-t border-gray-100 dark:border-neutral-800">
            <button 
              onClick={onClose} 
              className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              Close Window
            </button>
          </div>
        </div>

        {/* Map Rendering Container */}
        <div className="flex-1 h-full relative bg-gray-50 dark:bg-neutral-950 flex items-center justify-center">
          {!isValidToken ? (
            <div className="p-8 max-w-md text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <h4 className="text-md font-black text-gray-900 dark:text-white uppercase tracking-wider">Mapbox Access Token Missing or Invalid</h4>
              <p className="text-xs text-gray-505 dark:text-gray-400 leading-relaxed">
                To render dynamic, real-time dispatch routes on the map, a valid public Mapbox Token (starting with 'pk.') is required. Please set up the environment variable in your frontend configuration files.
              </p>
              <div className="p-4 bg-gray-100 dark:bg-neutral-850 rounded-2xl text-left select-all font-mono text-[10px] break-all text-gray-600 dark:text-gray-350 border border-gray-200 dark:border-neutral-800">
                NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token_here
              </div>
            </div>
          ) : (
            <div ref={mapContainerRef} className="w-full h-full" />
          )}
        </div>
      </div>
    </div>
  );
}
