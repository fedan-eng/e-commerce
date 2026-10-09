"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, Maximize2, X } from "lucide-react";

// Updated data structure to accommodate the new mixed layout
const items = [
  {
    id: 1,
    type: "campaign",
    badge: "Campaign Film",
    title: "Light can go. You stay on.",
    duration: "1:20",
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/magflex.mp4",
    poster: "", // Leaving blank to show the dark green background initially as per screenshot
    previewStart: 0,
  },
  {
    id: 2,
    type: "creator",
    badge: "Creator",
    badgeColor: "bg-[#00E575]", // Bright Green
    title: "So if you've been seeing",
    description: "Honest review, no script",
    handle: "@peacelucci",
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/dammy-2.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/dammy-2-thumb.png",
    previewStart: 0,
  },
  {
    id: 3,
    type: "creator",
    badge: "Creator",
    badgeColor: "bg-[#C49BFF]", // Purple
    title: "Honest review...",
    description: "no script",
    handle: "@papeetyah",
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/papeetyah.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/papeetyah-thumb.png",
    previewStart: 87,
  },
  {
    id: 4,
    type: "creator",
    badge: "Creator",
    badgeColor: "bg-[#FFD166]", // Yellow
    title: "Thunder Power Bank test",
    description: "Charge speed test",
    handle: "@techguy",
    img: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/videos/thunder-power-bank.mp4",
    poster: "https://pub-2808252d92f04792b5072c00044ff5b2.r2.dev/thumbnails/thunder-power-bank-thumb.png",
    previewStart: 0,
  },
];

// Utility functions kept intact
function safePlay(videoEl) {
  const p = videoEl.play();
  videoEl._pendingPlay = p;
  if (p !== undefined) p.catch(() => {});
}

function safePause(videoEl, resetTime = false) {
  const pending = videoEl._pendingPlay;
  if (pending !== undefined) {
    pending
      .then(() => {
        videoEl.pause();
        if (resetTime) videoEl.currentTime = 0;
      })
      .catch(() => {});
    videoEl._pendingPlay = undefined;
  } else {
    videoEl.pause();
    if (resetTime) videoEl.currentTime = 0;
  }
}

function applyIOSInlineAttributes(el) {
  if (!el) return;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.setAttribute("x5-playsinline", "");
  el.setAttribute("x5-video-player-type", "h5");
  el.setAttribute("x5-video-player-fullscreen", "false");
}

export default function Creators() {
  const [activeFilter, setActiveFilter] = useState('Instagram');
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreenMuted, setIsFullscreenMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [activeFullscreenId, setActiveFullscreenId] = useState(null);

  const videoRefs = useRef({});
  const fullscreenVideoRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 300 : 500;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const pauseAllExcept = useCallback((id) => {
    Object.entries(videoRefs.current).forEach(([vid, el]) => {
      if (!el) return;
      if (Number(vid) !== id) safePause(el, true);
    });
  }, []);

  const handlePlayClick = (item) => {
    const el = videoRefs.current[item.id];
    if (!el) return;

    if (playingId === item.id) {
      if (el.paused) safePlay(el);
      else {
        safePause(el);
        setPlayingId(null);
      }
    } else {
      pauseAllExcept(item.id);
      el.currentTime = item.previewStart ?? 0;
      safePlay(el);
      setPlayingId(item.id);
    }
  };

  const openFullscreen = (item, e) => {
    e.stopPropagation();
    // Pause inline video before opening fullscreen
    if (playingId === item.id) {
      const el = videoRefs.current[item.id];
      if (el) safePause(el);
      setPlayingId(null);
    }
    setActiveFullscreenId(item.id);
    setIsFullscreen(true);
  };

  useEffect(() => {
    return () => {
      Object.values(videoRefs.current).forEach((el) => {
        if (el) safePause(el);
      });
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeFullscreenItem = items.find(i => i.id === activeFullscreenId) || items[0];

  return (
    <section className="w-full bg-[#082C17] py-16 md:py-24 overflow-hidden text-white font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10">
          <h2 className="text-[32px] sm:text-[40px] leading-tight font-bold tracking-tight mb-2">
            See FIL in action.
          </h2>
          <p className="text-gray-300 text-[15px] sm:text-base max-w-2xl leading-relaxed mb-6">
            Demos, creator reviews and behind-the-scenes from our team.<br className="hidden sm:block"/>
            Real people using real gear, no studio magic.
          </p>

          <div className="flex items-end justify-between gap-4">
            {/* Filters */}
            <div className="flex gap-3">
              {['Instagram', 'TikTok'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setActiveFilter(platform)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${
                    activeFilter === platform 
                      ? 'border-white text-white' 
                      : 'border-white/30 text-white/70 hover:border-white/60 hover:text-white'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors group"
              >
                <ChevronLeft size={18} strokeWidth={2} className="text-white" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors group"
              >
                <ChevronRight size={18} strokeWidth={2} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {items.map((item) => {
            const isPlaying = playingId === item.id;
            const isCampaign = item.type === "campaign";

            return (
              <div
                key={item.id}
                className={`relative flex-shrink-0 snap-start rounded-[32px] overflow-hidden bg-[#0D4024] shadow-lg cursor-pointer group ${
                  isCampaign 
                    ? "w-[85vw] sm:w-[600px] lg:w-[700px] aspect-[4/3] sm:aspect-[16/9]" 
                    : "w-[260px] sm:w-[280px] aspect-[9/16]"
                }`}
                onClick={() => handlePlayClick(item)}
              >
                {/* Video Element */}
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current[item.id] = el;
                      applyIOSInlineAttributes(el);
                    }
                  }}
                  poster={item.poster}
                  muted={isMuted}
                  playsInline
                  loop
                  className={`w-full h-full object-cover transition-opacity duration-300 ${!isPlaying && isCampaign && !item.poster ? 'opacity-0' : 'opacity-100'}`}
                >
                  <source src={item.img} type="video/mp4" />
                </video>

                {/* Overlays & Badges */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                  
                  {/* Top: Badge & Controls */}
                  <div className="flex justify-between items-start w-full">
                    {/* Badge */}
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold text-gray-900 leading-none ${
                      isCampaign ? "bg-white" : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                    
                    {/* Top Right Controls (Fullscreen) */}
                    {isPlaying && (
                      <button
                        onClick={(e) => openFullscreen(item, e)}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors pointer-events-auto"
                      >
                        <Maximize2 size={18} className="text-white" />
                      </button>
                    )}
                  </div>

                  {/* Campaign Card - Center Play Button */}
                  {isCampaign && !isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#00E575] rounded-full flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                        <Play size={32} className="text-[#082C17] fill-[#082C17] ml-1.5" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Content Area */}
                  <div className="flex items-end justify-between w-full relative z-10 pointer-events-auto">
                    
                    {/* Text Data */}
                    <div className="flex flex-col gap-1 pr-4">
                      <h3 className={`font-bold leading-tight ${isCampaign ? "text-xl sm:text-2xl" : "text-[18px]"}`}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-white/80 text-[13px] leading-snug">
                          {item.description}
                        </p>
                      )}
                      {item.handle && (
                        <p className="text-white/60 text-[12px] mt-1">
                          {item.handle}
                        </p>
                      )}
                      {item.duration && (
                        <p className="text-white/80 text-[14px] mt-1">
                          {item.duration}
                        </p>
                      )}
                    </div>

                    {/* Creator Card - Bottom Right Play Button & Mute */}
                    <div className="flex flex-col gap-3">
                      {isPlaying && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsMuted((m) => !m); }}
                          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors"
                        >
                          {isMuted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
                        </button>
                      )}
                      
                      {!isCampaign && !isPlaying && (
                        <div className="w-10 h-10 bg-[#00E575] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 self-end pointer-events-none">
                          <Play size={20} className="text-[#082C17] fill-[#082C17] ml-1" />
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Dark Gradient Overlay for text readability (only really needed for creator cards) */}
                {!isCampaign && (
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Modal (Kept from original logic) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFullscreen(false);
            }}
          >
            <motion.div
              className="relative w-full max-w-lg md:max-w-2xl rounded-2xl overflow-hidden shadow-2xl bg-black"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <video
                ref={fullscreenVideoRef}
                key={activeFullscreenItem.id}
                src={activeFullscreenItem.img}
                poster={activeFullscreenItem.poster}
                muted={isFullscreenMuted}
                playsInline
                controls
                autoPlay
                className="w-full h-auto max-h-[85vh] object-contain"
              />

              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-white" />
              </button>

              {/* Added a secondary mute toggle specifically for fullscreen for better UX if controls hide */}
              <button
                onClick={() => setIsFullscreenMuted((m) => !m)}
                className="absolute bottom-6 right-6 z-10 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors md:hidden"
              >
                {isFullscreenMuted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}