/**
 * Web Audio API Notification & Alert Sound Synthesizer
 * Provides crisp, pleasant, zero-latency notification sounds offline
 * without requiring external audio files.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a synthesized notification sound
 * @param {"notice" | "success" | "error" | "info" | "tap"} type
 * @param {boolean} [force=false]
 */
export function playNotificationSound(type = "notice", force = false) {
  try {
    // Check localStorage setting if not forced
    if (!force) {
      try {
        const saved = localStorage.getItem("kc_app_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.soundEnabled === false) return;
        }
      } catch (_) {}
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === "notice" || type === "info") {
      // Pleasant modern 3-tone notification chime: C5 (523Hz) -> E5 (659Hz) -> A5 (880Hz)
      const notes = [
        { freq: 523.25, time: now, dur: 0.12, gain: 0.12 },
        { freq: 659.25, time: now + 0.08, dur: 0.14, gain: 0.14 },
        { freq: 880.00, time: now + 0.16, dur: 0.35, gain: 0.18 },
      ];

      notes.forEach(({ freq, time, dur, gain: maxGain }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(maxGain, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + dur + 0.05);
      });
    } else if (type === "success") {
      // Upbeat 2-tone chime: F5 (698Hz) -> C6 (1046Hz)
      const notes = [
        { freq: 698.46, time: now, dur: 0.10, gain: 0.12 },
        { freq: 1046.50, time: now + 0.09, dur: 0.28, gain: 0.15 },
      ];

      notes.forEach(({ freq, time, dur, gain: maxGain }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(maxGain, time + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + dur + 0.05);
      });
    } else if (type === "error") {
      // Subtle double warning tone: 370Hz -> 310Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(370, now);
      osc.frequency.exponentialRampToValueAtTime(310, now + 0.18);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Crisp tactile tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch (err) {
    console.debug("Audio playback error:", err);
  }
}
