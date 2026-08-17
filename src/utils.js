export const uid = (p = "id") => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
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
