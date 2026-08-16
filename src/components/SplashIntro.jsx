import React, { useState, useEffect, useRef } from "react";
import { C } from "../theme";

const TOTAL_FRAMES = 70;

const frameUrl = (index) => {
  const num = String(index).padStart(3, "0");
  return `/splash/ezgif-frame-${num}.jpg`;
};

export default function SplashIntro({ onFinish, lang = "en" }) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [loadedCount, setLoadedCount] = useState(0);
  const [fading, setFading] = useState(false);
  const imagesRef = useRef([]);
  const canvasRef = useRef(null);
  const isBn = lang === "bn";

  // Preload all 70 frames
  useEffect(() => {
    let count = 0;
    const imgs = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = frameUrl(i);
      img.onload = () => {
        count++;
        setLoadedCount(count);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // Play animation once at least 15 frames or all loaded
  useEffect(() => {
    if (loadedCount < 10) return;

    let frame = 1;
    let animationTimer = null;

    const intervalMs = 1000 / 28; // ~28 fps for smooth playback
    animationTimer = setInterval(() => {
      frame++;
      if (frame <= TOTAL_FRAMES) {
        setCurrentFrame(frame);
        // Draw to canvas for ultra smooth 60fps rendering
        const canvas = canvasRef.current;
        const img = imagesRef.current[frame - 1];
        if (canvas && img && img.complete) {
          const ctx = canvas.getContext("2d");
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          // Scale to cover
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width / 2) - (img.width / 2) * scale;
          const y = (canvas.height / 2) - (img.height / 2) * scale;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
      } else {
        clearInterval(animationTimer);
        // Fade out
        setFading(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 500);
      }
    }, intervalMs);

    return () => clearInterval(animationTimer);
  }, [loadedCount >= 10]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#154212] transition-opacity duration-500 select-none cursor-pointer ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ display: loadedCount >= 10 ? "block" : "none" }}
      />

      {/* Fallback image display while canvas initializes */}
      {loadedCount < 10 && (
        <div className="flex flex-col items-center justify-center p-6 text-center text-white">
          <img
            src={frameUrl(1)}
            alt="Kunjachaya Splash"
            className="w-48 h-48 object-contain rounded-2xl mb-4 shadow-2xl animate-pulse"
          />
          <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-400 transition-all duration-200 rounded-full"
              style={{ width: `${Math.round((loadedCount / TOTAL_FRAMES) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-white/70">
            {isBn ? "কুঞ্জছায়া ক্লাব লোড হচ্ছে..." : "Loading Kunjachaya Club..."}
          </p>
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute bottom-6 right-6 px-4 py-1.5 rounded-full text-xs font-bold bg-black/40 hover:bg-black/60 text-white backdrop-blur border border-white/20 transition-colors"
      >
        {isBn ? "এড়িয়ে যান ❯" : "Skip ❯"}
      </button>
    </div>
  );
}
