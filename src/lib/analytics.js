// src/lib/analytics.js
//
// Loads Google Analytics asynchronously (never blocks page render) and
// ONLY after explicit consent — see ConsentBanner.jsx. Loading a
// tracking script before consent is a compliance violation in most
// jurisdictions with cookie-consent law, not just a nice-to-have.
//
// Swap VITE_GA_MEASUREMENT_ID for your real GA4 measurement ID (looks
// like "G-XXXXXXX") via .env — nothing loads if it's unset, so this is
// safe to ship even before you've set one up.

let loaded = false;

export function loadAnalytics() {
  if (loaded) return;
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!id) {
    console.warn("Analytics: VITE_GA_MEASUREMENT_ID not set — skipping.");
    return;
  }
  loaded = true;

  const s = document.createElement("script");
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  s.async = true;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id, { anonymize_ip: true });
}

/** Call this from the app; it's always safe even if consent hasn't
 * been granted yet or analytics never loaded — it just no-ops. */
export function trackEvent(name, params = {}) {
  if (!loaded || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export const CONSENT_KEY = "kc_analytics_consent";

export function hasStoredConsent() {
  try { return localStorage.getItem(CONSENT_KEY) === "granted"; } catch { return false; }
}
export function storeConsent(granted) {
  try { localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied"); } catch { /* ignore */ }
}
