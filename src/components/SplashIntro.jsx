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

  // Play animation once frames start loading
  useEffect(() => {
    if (loadedCount < 8) return;

    let frame = 1;
    let animationTimer = null;

    const intervalMs = 1000 / 28; // ~28 fps for smooth playback
    animationTimer = setInterval(() => {
      frame++;
      if (frame <= TOTAL_FRAMES) {
        setCurrentFrame(frame);
        // Draw to canvas in centered container
        const canvas = canvasRef.current;
        const img = imagesRef.current[frame - 1];
        if (canvas && img && img.complete) {
          const ctx = canvas.getContext("2d");
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);
          // Scale to fit / contain cleanly inside the 30% center box
          const scale = Math.min(w / img.width, h / img.height);
          const x = (w - img.width * scale) / 2;
          const y = (h - img.height * scale) / 2;
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
  }, [loadedCount >= 8]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 select-none cursor-pointer ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ backgroundColor: "rgb(21, 66, 18)", overflow: "hidden" }}
    >
      {/* Centered 30% area intro box */}
      <div className="relative flex flex-col items-center justify-center p-4">
        {/* Soft atmospheric backlight */}
        <div
          className="absolute -inset-4 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{ backgroundColor: "rgba(74, 222, 128, 0.25)" }}
        />

        <div
          className="relative w-[30vw] min-w-[260px] max-w-[420px] aspect-square rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <canvas
            ref={canvasRef}
            width={480}
            height={480}
            className="w-full h-full object-contain"
            style={{ display: loadedCount >= 8 ? "block" : "none" }}
          />

          {/* Fallback image & progress while loading first frames */}
          {loadedCount < 8 && (
            <div className="flex flex-col items-center justify-center p-6 text-center text-white">
              <img
                src={frameUrl(1)}
                alt="Kunjachaya Splash"
                className="w-32 h-32 object-contain rounded-2xl mb-3 shadow-xl animate-pulse"
              />
              <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-400 transition-all duration-200 rounded-full"
                  style={{ width: `${Math.round((loadedCount / TOTAL_FRAMES) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-white/70">
                {isBn ? "লোড হচ্ছে..." : "Loading..."}
              </p>
            </div>
          )}
        </div>

        {/* Club subtitle */}
        <p className="mt-4 text-xs font-semibold text-white/80 tracking-wider text-center">
          {isBn ? "কুঞ্জছায়া ক্লাব • চট্টগ্রাম" : "KUNJACHAYA CLUB • CHATTOGRAM"}
        </p>
      </div>

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
