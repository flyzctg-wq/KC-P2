import React, { useState, useEffect } from "react";
import { C, LOGO_MARK } from "../theme";

export default function SplashIntro({ onFinish, lang = "en" }) {
  const [fading, setFading] = useState(false);
  const isBn = lang === "bn";

  useEffect(() => {
    // Smooth, rapid intro: completes automatically in ~1.5s
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 400);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-400 select-none cursor-pointer ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ backgroundColor: "rgb(21, 66, 18)", overflow: "hidden" }}
    >
      <style>{`
        @keyframes kc-splash-pulse {
          0% { transform: scale(0.92); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 1; filter: drop-shadow(0 0 16px rgba(74, 222, 128, 0.4)); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes kc-progress-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Centered intro card */}
      <div className="relative flex flex-col items-center justify-center p-4">
        {/* Atmospheric backlight */}
        <div
          className="absolute -inset-6 rounded-full blur-3xl opacity-50 pointer-events-none"
          style={{ backgroundColor: "rgba(74, 222, 128, 0.28)" }}
        />

        <div
          className="relative w-[32vw] min-w-[260px] max-w-[360px] aspect-square rounded-3xl overflow-hidden flex flex-col items-center justify-center shadow-2xl p-6"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="w-36 h-36 flex items-center justify-center mb-4"
            style={{ animation: "kc-splash-pulse 1.4s ease-out forwards" }}
          >
            <img
              src={LOGO_MARK}
              alt="Kunjachaya Club"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>

          {/* Smooth progress indicator */}
          <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ animation: "kc-progress-fill 1.3s cubic-bezier(0.4, 0, 0.2, 1) forwards" }}
            />
          </div>

          <p className="text-[11px] text-emerald-200/90 font-medium tracking-wide">
            {isBn ? "লোড হচ্ছে..." : "Loading..."}
          </p>
        </div>

        {/* Club subtitle */}
        <p className="mt-5 text-xs font-semibold text-white/90 tracking-widest text-center uppercase">
          {isBn ? "কুঞ্জছায়া ক্লাব • চট্টগ্রাম" : "Kunjachaya Club • Chattogram"}
        </p>
      </div>

      {/* Skip button */}
      <button
        type="button"
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
