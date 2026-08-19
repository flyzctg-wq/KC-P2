export const uid = (p = "id") => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
export const nowISO = () => new Date().toISOString();
export const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); } catch { return iso; } };
export const fmtDateTime = (iso) => { try { return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return iso; } };
export const currency = (n) => `৳${Number(n || 0).toLocaleString()}`;
export const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
export const avatarHue = (seed = "") => { let h = 0; for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h); return Math.abs(h) % 360; };
export const monthLabel = (ym) => { const [y, m] = ym.split("-"); return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" }); };
export const currentMonthYM = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

/** Returns the real web base URL (e.g. Vercel domain) for invitation links, avoiding localhost in mobile builds */
export const getAppBaseUrl = () => {
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1") && !origin.startsWith("capacitor://") && !origin.startsWith("http://localhost")) {
      return origin.replace(/\/+$/, "");
    }
  }
  return "https://kc-p2.vercel.app";
};

/** Normalizes Bangladesh / international phone numbers for tel: and WhatsApp links */
export const cleanPhone = (phone = "") => {
  const digits = String(phone || "").replace(/[^0-9+]/g, "");
  if (!digits) return "";
  if (digits.startsWith("+")) return digits.slice(1);
  if (digits.startsWith("88")) return digits;
  if (digits.startsWith("01")) return `88${digits}`;
  return digits;
};

/** Plays a mild, pleasant tap/pop notification sound using Web Audio API */
let _audioCtx = null;
export const playTapSound = (type = "send") => {
  try {
    if (typeof window === "undefined") return;
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return;

    if (!_audioCtx) {
      _audioCtx = new AudioCtxClass();
    }
    if (_audioCtx.state === "suspended") {
      _audioCtx.resume().catch(() => {});
    }

    const ctx = _audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "send") {
      // Crisp, subtle tap / water pop (560Hz -> 760Hz -> 400Hz in 55ms)
      osc.type = "sine";
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.015);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.055);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      // Soft gentle two-tone tap for received message
      osc.type = "sine";
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.035);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
    // Fail silently if browser audio is restricted
  }
};

