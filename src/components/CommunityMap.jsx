import React, { useState } from "react";
import {
  MapPin, Navigation, ExternalLink, Copy, Check, Compass,
  Layers, Building, Map as MapIcon, Share2, Info, ChevronRight
} from "lucide-react";
import { Card, Badge, Btn } from "./primitives";
import { C } from "../theme";

export const KUNJACHAYA_MAP_URL = "https://www.google.com/maps/place/Kunjachaya+Residential+Area,+Chattogram/@22.3810056,91.8165975,18z/data=!4m10!1m2!2m1!1skunjochaya+R%2FA+detailed+map!3m6!1s0x30acd8667bccf937:0xc04874cf10161475!8m2!3d22.3810056!4d91.8165975!15sChtrdW5qb2NoYXlhIFIvQSBkZXRhaWxlZCBtYXCSAQxuZWlnaGJvcmhvb2TgAQA!16s%2Fg%2F1tf0b8p6";
export const KUNJACHAYA_COORDS = { lat: 22.3810056, lng: 91.8165975 };
export const KUNJACHAYA_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${KUNJACHAYA_COORDS.lat},${KUNJACHAYA_COORDS.lng}`;

export default function CommunityMap({ lang = "en", toast = () => {}, className = "", compact = false }) {
  const isBn = lang === "bn";
  const [copied, setCopied] = useState(false);
  const [mapType, setMapType] = useState("m"); // "m" for roadmap, "k" for satellite

  const embedUrl = `https://maps.google.com/maps?q=${KUNJACHAYA_COORDS.lat},${KUNJACHAYA_COORDS.lng}&hl=${isBn ? "bn" : "en"}&t=${mapType}&z=18&output=embed`;

  const copyCoordinates = () => {
    const text = `${KUNJACHAYA_COORDS.lat}, ${KUNJACHAYA_COORDS.lng} (Kunjachhaya Residential Area, Bayezid Bostami, Chattogram)`;
    navigator.clipboard?.writeText?.(text);
    setCopied(true);
    toast(isBn ? "GPS কোঅর্ডিনেট ও ঠিকানা কপি করা হয়েছে!" : "Coordinates and address copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: isBn ? "কুঞ্জছায়া আবাসিক এলাকা, চট্টগ্রাম" : "Kunjachaya Residential Area, Chattogram",
        text: isBn ? "কুঞ্জছায়া আবাসিক এলাকা, বায়েজীদ বোস্তামী, চট্টগ্রাম এর গুগল ম্যাপ লোকেশন" : "Google Maps location of Kunjachaya Residential Area, Chattogram",
        url: KUNJACHAYA_MAP_URL,
      }).catch(() => {});
    } else {
      copyCoordinates();
    }
  };

  return (
    <Card className={`p-4 sm:p-5 overflow-hidden relative shadow-sm ${className}`} style={{ borderColor: C.outlineVariant }}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 shrink-0 shadow-xs">
            <MapPin size={22} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base heading text-gray-900 dark:text-gray-100">
                {isBn ? "কুঞ্জছায়া আবাসিক এলাকা মানচিত্র" : "Kunjachaya Community Map"}
              </h3>
              <Badge tone="success">
                {isBn ? "লাইভ গুগল ম্যাপস" : "Live Google Maps"}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isBn
                ? "বায়েজিদ বোস্তামী থানা রোড, ২নং জালালাবাদ ওয়ার্ড, চট্টগ্রাম।"
                : "Bayezid Bostami Road, 2 No. Jalalabad Ward, Chattogram."}
            </p>
          </div>
        </div>

        {/* View Mode Controls & Directions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="p-1 rounded-xl flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMapType("m")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${mapType === "m" ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs" : "text-gray-500"}`}
            >
              {isBn ? "রোডম্যাপ" : "Road"}
            </button>
            <button
              type="button"
              onClick={() => setMapType("k")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${mapType === "k" ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs" : "text-gray-500"}`}
            >
              {isBn ? "স্যাটেলাইট" : "Satellite"}
            </button>
          </div>

          <a
            href={KUNJACHAYA_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Navigation size={13} />
            <span>{isBn ? "দিকনির্দেশনা" : "Directions"}</span>
          </a>
        </div>
      </div>

      {/* Embedded Live Interactive Google Maps Viewport */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 aspect-[16/9] sm:aspect-[21/9] min-h-[260px] shadow-inner">
        <iframe
          title="Kunjachaya Residential Area Map"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full object-cover"
        />

        {/* Floating Quick Action Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="text-[10px] sm:text-xs font-bold text-slate-900 bg-white/90 dark:bg-slate-900/90 dark:text-slate-100 px-3 py-1 rounded-full shadow-md backdrop-blur-xs pointer-events-auto border border-black/5 dark:border-white/10">
            📍 22.3810° N, 91.8166° E
          </span>

          <a
            href={KUNJACHAYA_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] sm:text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-900 dark:bg-emerald-700/90 dark:hover:bg-emerald-700 px-3 py-1 rounded-full shadow-md backdrop-blur-xs pointer-events-auto flex items-center gap-1 transition-transform active:scale-95"
          >
            <span>{isBn ? "গুগল ম্যাপে বড় করে দেখুন" : "Open in Google Maps"}</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Area Landmark & Geographical Highlights */}
      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {isBn ? "ব্লক বিন্যাস" : "Blocks"}
            </span>
            <p className="font-black text-gray-900 dark:text-gray-100">
              {isBn ? "ব্লক A, B, C, D, E" : "Block A, B, C, D, E"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {isBn ? "সিটি কর্পোরেশন" : "City Corp"}
            </span>
            <p className="font-black text-gray-900 dark:text-gray-100">
              {isBn ? "২নং জালালাবাদ ওয়ার্ড" : "Ward 2 (Jalalabad)"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {isBn ? "থানা ও জেলা" : "Thana & District"}
            </span>
            <p className="font-black text-gray-900 dark:text-gray-100">
              {isBn ? "বায়েজিদ, চট্টগ্রাম" : "Bayezid, Chattogram"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {isBn ? "প্রধান সংযোগ" : "Main Route"}
            </span>
            <p className="font-black text-gray-900 dark:text-gray-100 truncate">
              {isBn ? "বায়েজিদ বোস্তামী রোড" : "Bayezid Bostami Rd"}
            </p>
          </div>
        </div>
      )}

      {/* Footer Share & Copy Actions */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap text-xs">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Info size={13} className="text-emerald-600 shrink-0" />
          <span>
            {isBn
              ? "ক্লাব সংবিধানের ৩নং ধারা অনুসারে এই ভৌগোলিক এলাকার সকল বাসিন্দা সংগঠনের অন্তর্ভুক্ত।"
              : "As per Article 3 of the constitution, all residents within this boundary are eligible."}
          </span>
        </p>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={copyCoordinates}
            className="flex items-center gap-1 py-1.5 px-3 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copied ? (isBn ? "কপি হয়েছে!" : "Copied!") : (isBn ? "ঠিকানা কপি" : "Copy Info")}</span>
          </button>

          <button
            type="button"
            onClick={shareLocation}
            className="flex items-center gap-1 py-1.5 px-3 rounded-xl font-bold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <Share2 size={13} />
            <span>{isBn ? "শেয়ার" : "Share"}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
