// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  typeof supabaseUrl === "string" &&
  supabaseUrl.trim() !== "" &&
  !supabaseUrl.includes("placeholder.supabase.co") &&
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.trim() !== "" &&
  supabaseAnonKey !== "placeholder";

if (!isConfigured) {
  const errMsg =
    "[KC-P2 Config Error] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables are missing or set to placeholder values. Please check your .env configuration.";
  console.error(errMsg);
  if (import.meta.env.PROD) {
    // In production, notify immediately rather than silently failing on unroutable placeholder domains
    setTimeout(() => {
      const banner = document.createElement("div");
      banner.id = "kc-config-error-banner";
      banner.style.cssText =
        "position:fixed;bottom:0;left:0;right:0;background:#dc2626;color:#ffffff;padding:12px 16px;text-align:center;font-size:13px;font-weight:600;z-index:99999;box-shadow:0 -2px 10px rgba(0,0,0,0.3);";
      banner.textContent = "Server configuration missing: Please check VITE_SUPABASE_URL in app settings.";
      document.body.appendChild(banner);
    }, 1000);
  }
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);
