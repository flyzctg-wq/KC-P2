import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Navigation, ExternalLink, Copy, Check, Compass,
  Layers, Building, Map as MapIcon, Share2, Info, ChevronRight,
  Shield, User, Radio, StopCircle, Clock, AlertTriangle, Crosshair,
  Sparkles, Eye, EyeOff
} from "lucide-react";
import { Card, Badge, Btn, Modal } from "./primitives";
import { C } from "../theme";
import { supabase } from "../lib/supabase";
import { sanitizeUrl } from "../utils";

const escapeHtml = (str = "") =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const KUNJACHAYA_MAP_URL = "https://www.google.com/maps/place/Kunjachaya+Residential+Area,+Chattogram/@22.3810056,91.8165975,18z/data=!4m10!1m2!2m1!1skunjochaya+R%2FA+detailed+map!3m6!1s0x30acd8667bccf937:0xc04874cf10161475!8m2!3d22.3810056!4d91.8165975!15sChtrdW5qb2NoYXlhIFIvQSBkZXRhaWxlZCBtYXCSAQxuZWlnaGJvcmhvb2TgAQA!16s%2Fg%2F1tf0b8p6";
export const KUNJACHAYA_COORDS = { lat: 22.3810056, lng: 91.8165975 };
export const KUNJACHAYA_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${KUNJACHAYA_COORDS.lat},${KUNJACHAYA_COORDS.lng}`;

// Default hardcoded landmarks — used as fallback when Supabase has no data yet
const DEFAULT_LANDMARKS = [
  { id: "office",  nameEn: "Society Office & Clubhouse",           nameBn: "সোসাইটি অফিস ও ক্লাব ভবন",                    lat: 22.3810056, lng: 91.8165975, icon: "🏢", color: "#059669", type: "office" },
  { id: "gate1",   nameEn: "Gate 1 (Main Entrance - Bayezid Road)", nameBn: "১নং গেট (প্রধান প্রবেশদ্বার - বায়েজীদ রোড)", lat: 22.38138,   lng: 91.81615,   icon: "🚪", color: "#d97706", type: "gate"   },
  { id: "gate2",   nameEn: "Gate 2 (West Exit / Ring Road access)", nameBn: "২নং গেট (পশ্চিম নির্গমন / রিং রোড)",          lat: 22.38068,   lng: 91.81592,   icon: "🚪", color: "#d97706", type: "gate"   },
  { id: "mosque",  nameEn: "Kunjachaya Jamia Mosque",               nameBn: "কুঞ্জছায়া জামে মসজিদ",                         lat: 22.38125,   lng: 91.81682,   icon: "🕌", color: "#0284c7", type: "mosque" },
  { id: "park",    nameEn: "Community Park & Children Playground",  nameBn: "কমিউনিটি পার্ক ও শিশু খেলার মাঠ",             lat: 22.38148,   lng: 91.81710,   icon: "🌳", color: "#16a34a", type: "park"   },
  { id: "blockA", nameEn: "Block A", nameBn: "ব্লক এ", lat: 22.38155, lng: 91.81640, icon: "🅰️", color: "#6366f1", type: "block" },
  { id: "blockB", nameEn: "Block B", nameBn: "ব্লক বি", lat: 22.38118, lng: 91.81605, icon: "🅱️", color: "#6366f1", type: "block" },
  { id: "blockC", nameEn: "Block C", nameBn: "ব্লক সি", lat: 22.38078, lng: 91.81665, icon: "🅲",  color: "#6366f1", type: "block" },
  { id: "blockD", nameEn: "Block D", nameBn: "ব্লক ডি", lat: 22.38058, lng: 91.81715, icon: "🅳",  color: "#6366f1", type: "block" },
  { id: "blockE", nameEn: "Block E", nameBn: "ব্লক ই", lat: 22.38115, lng: 91.81740, icon: "🅴",  color: "#6366f1", type: "block" },
];

// Helper: Calculate Haversine distance in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km, isBn) {
  if (km === null || km === undefined || isNaN(km)) return "";
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return isBn ? `${meters} মিটার` : `${meters}m`;
  }
  return isBn ? `${km.toFixed(1)} কিমি` : `${km.toFixed(1)} km`;
}

function formatRelativeTime(dateIso, isBn) {
  if (!dateIso) return "";
  const sec = Math.floor((Date.now() - new Date(dateIso).getTime()) / 1000);
  if (sec < 10) return isBn ? "এইমাত্র" : "just now";
  if (sec < 60) return isBn ? `${sec} সেঃ আগে` : `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return isBn ? `${min} মিনিট আগে` : `${min}m ago`;
  const hr = Math.floor(min / 60);
  return isBn ? `${hr} ঘণ্টা আগে` : `${hr}h ago`;
}

export default function CommunityMap({ session, lang = "en", toast = () => {}, className = "", compact = false }) {
  const isBn = lang === "bn";
  const [mapType, setMapType] = useState("m"); // "m" for street, "k" for satellite
  const [copied, setCopied] = useState(false);
  const [filterMode, setFilterMode] = useState("all"); // "all", "members", "landmarks"

  // Dynamic landmarks loaded from Supabase (falls back to DEFAULT_LANDMARKS)
  const [landmarks, setLandmarks] = useState(DEFAULT_LANDMARKS);

  // Private GPS "Locate Me" state
  const [myLocation, setMyLocation] = useState(null); // { lat, lng, accuracy }
  const [locating, setLocating] = useState(false);

  // Live Community Sharing (Option 3 - Supabase Realtime Presence)
  const [liveUsers, setLiveUsers] = useState({}); // { [userId]: { ...presenceData } }
  const [isSharing, setIsSharing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareDuration, setShareDuration] = useState("60"); // minutes: "15", "60", "480", "unlimited"
  const [activityTag, setActivityTag] = useState("resident"); // "patrol", "gate", "event", "resident"
  const [customActivity, setCustomActivity] = useState("");
  const [shareExpiresAt, setShareExpiresAt] = useState(null);

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const landmarksGroupRef = useRef(null);
  const liveUsersGroupRef = useRef(null);
  const myMarkerGroupRef = useRef(null);

  // Supabase channel & GPS watch refs
  const channelRef = useRef(null);
  const watchIdRef = useRef(null);

  const isSecurityOrAdmin = session?.role === "admin" || session?.post === "Security Guard" || session?.post === "Security";

  // --------------------------------------------------------------------------
  // 0. Load Dynamic Landmarks from Supabase
  // --------------------------------------------------------------------------
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("app_config")
          .select("value")
          .eq("key", "kc_map_landmarks")
          .maybeSingle();
        if (!active) return;
        if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
          // Only show non-hidden landmarks on the map
          setLandmarks(data.value.filter(lm => !lm.hidden));
        }
        // else: keep DEFAULT_LANDMARKS
      } catch (_) {
        // Silently fall back to defaults on network/permission error
      }
    })();
    return () => { active = false; };
  }, []);

  // --------------------------------------------------------------------------
  // 1. Initialize Leaflet Map
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [KUNJACHAYA_COORDS.lat, KUNJACHAYA_COORDS.lng],
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom Control at top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Add Tile Layer
      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      });
      streetLayer.addTo(map);
      tileLayerRef.current = streetLayer;

      // Create Layer Groups
      const landmarksGroup = L.layerGroup().addTo(map);
      const liveUsersGroup = L.layerGroup().addTo(map);
      const myMarkerGroup = L.layerGroup().addTo(map);

      landmarksGroupRef.current = landmarksGroup;
      liveUsersGroupRef.current = liveUsersGroup;
      myMarkerGroupRef.current = myMarkerGroup;

      mapInstanceRef.current = map;

      // Invalidate size after container layout settles
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // 2. Switch Street / Satellite Tiles
  // --------------------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let newTileLayer;
    if (mapType === "k") {
      // Esri World Imagery (Satellite)
      newTileLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
      });
    } else {
      // OpenStreetMap Standard (Roadmap)
      newTileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      });
    }

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [mapType]);

  // --------------------------------------------------------------------------
  // 3. Render Landmark Markers
  // --------------------------------------------------------------------------
  useEffect(() => {
    const group = landmarksGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (filterMode === "members") return; // Hidden if filtered to only members

    landmarks.forEach((item) => {
      const name = isBn ? item.nameBn : item.nameEn;
      const safeName = escapeHtml(name);
      const safeIcon = escapeHtml(item.icon);
      const safeColor = escapeHtml(item.color);

      // Custom SVG / HTML divIcon
      const html = `
        <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
          <div style="background-color:${safeColor}; color:#fff; padding:3px 7px; border-radius:12px; font-weight:800; font-size:11px; box-shadow:0 3px 8px rgba(0,0,0,0.3); border:2px solid #fff; display:flex; align-items:center; gap:4px; white-space:nowrap;">
            <span>${safeIcon}</span>
            <span>${safeName}</span>
          </div>
          <div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid ${safeColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-landmark-pin",
        html,
        iconSize: [0, 0],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family:Inter,sans-serif; min-width:180px; padding:4px;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
            <span style="font-size:18px;">${safeIcon}</span>
            <strong style="font-size:13px; color:#111827;">${safeName}</strong>
          </div>
          <div style="font-size:11px; color:#6b7280; margin-bottom:8px;">
            GPS: ${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}
          </div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:bold; color:#059669; text-decoration:none;">
            ${isBn ? "এখানে যাওয়ার দিকনির্দেশনা" : "Navigate to this landmark"} →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      group.addLayer(marker);
    });
  }, [filterMode, isBn, landmarks]);

  // --------------------------------------------------------------------------
  // 4. Supabase Realtime Presence Channel for Community Live Location
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Listen to real-time presence on community_live_locations channel
    const channel = supabase.channel("community_live_locations", {
      config: {
        presence: { key: session?.id || `anon_${Date.now()}` },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const activeMap = {};

        Object.keys(state).forEach((userId) => {
          const presences = state[userId];
          if (presences && presences.length > 0) {
            const latest = presences[presences.length - 1];
            // Filter out expired locations
            if (latest.expiresAt && new Date(latest.expiresAt).getTime() < Date.now()) {
              return;
            }
            activeMap[userId] = latest;
          }
        });

        setLiveUsers(activeMap);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        const joinedUser = newPresences?.[0]?.name;
        if (joinedUser && key !== session?.id) {
          toast(
            isBn
              ? `${joinedUser} লাইভ অবস্থান শেয়ার শুরু করেছেন।`
              : `${joinedUser} started sharing live location.`,
            "info"
          );
        }
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        const leftUser = leftPresences?.[0]?.name;
        if (leftUser && key !== session?.id) {
          // Clean update
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [session?.id, isBn, toast]);

  // --------------------------------------------------------------------------
  // 5. Render Live Member / Guard Pins on the Map
  // --------------------------------------------------------------------------
  useEffect(() => {
    const group = liveUsersGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (filterMode === "landmarks") return;

    Object.values(liveUsers).forEach((user) => {
      if (!user.lat || !user.lng) return;

      const isMe = user.userId === session?.id;
      const isGuard = user.role === "admin" && (user.post?.toLowerCase().includes("guard") || user.activity === "patrol");
      const isAdmin = user.role === "admin";

      // Color coding: Guard = Amber (#f59e0b), Admin = Purple (#8b5cf6), Resident = Emerald (#10b981)
      const pinColor = isGuard ? "#f59e0b" : isAdmin ? "#8b5cf6" : "#10b981";
      const roleLabel = user.post || (isAdmin ? "Admin" : "Resident");
      const activityLabel =
        user.activityText ||
        (user.activity === "patrol"
          ? (isBn ? "ডিউটি / টহলে" : "On Patrol")
          : user.activity === "gate"
          ? (isBn ? "সোসাইটি গেটে" : "At Society Gate")
          : user.activity === "event"
          ? (isBn ? "অনুষ্ঠানে" : "At Community Event")
          : (isBn ? "সক্রিয় সদস্য" : "Active Resident"));

      const distanceToCenter = calculateDistanceKm(
        user.lat,
        user.lng,
        KUNJACHAYA_COORDS.lat,
        KUNJACHAYA_COORDS.lng
      );

      const safePhotoUrl = user.photoUrl ? sanitizeUrl(user.photoUrl, "") : "";
      const safeName = escapeHtml(user.name || "User");
      const safeFirstName = escapeHtml(user.name?.split(" ")?.[0] || "User");
      const safeRoleLabel = escapeHtml(roleLabel);
      const safeActivityLabel = escapeHtml(activityLabel);
      const safeInitial = escapeHtml((user.name || "U").slice(0, 1).toUpperCase());

      const html = `
        <div style="position:relative; display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%);">
          <!-- Pulsing ripple ring -->
          <div style="position:absolute; width:44px; height:44px; border-radius:50%; background-color:${pinColor}; opacity:0.35; animation:leafletPing 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
          
          <!-- Avatar / Marker Disc -->
          <div style="position:relative; width:34px; height:34px; border-radius:50%; background-color:#fff; border:3px solid ${pinColor}; box-shadow:0 3px 10px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; overflow:hidden; z-index:2;">
            ${
              safePhotoUrl
                ? `<img src="${safePhotoUrl}" style="width:100%; height:100%; object-fit:cover;" />`
                : `<span style="font-weight:900; font-size:13px; color:${pinColor};">${safeInitial}</span>`
            }
          </div>

          <!-- Name pill floating below -->
          <div style="position:relative; margin-top:3px; background-color:#111827; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:10px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.2); z-index:3;">
            ${isMe ? (isBn ? "আপনি (আমি)" : "You") : safeFirstName}
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: "custom-live-user-pin",
        html,
        iconSize: [0, 0],
      });

      const marker = L.marker([user.lat, user.lng], { icon: userIcon, zIndexOffset: 1000 });

      const popupHtml = `
        <div style="font-family:Inter,sans-serif; min-width:210px; padding:6px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <div style="width:36px; height:36px; border-radius:50%; background-color:${pinColor}20; border:2px solid ${pinColor}; display:flex; align-items:center; justify-content:center; font-weight:900; color:${pinColor};">
              ${safePhotoUrl ? `<img src="${safePhotoUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />` : safeInitial}
            </div>
            <div>
              <div style="font-size:13px; font-weight:800; color:#111827;">${safeName}</div>
              <div style="font-size:10px; font-weight:700; color:${pinColor}; text-transform:uppercase;">${safeRoleLabel}</div>
            </div>
          </div>

          <div style="background-color:#f3f4f6; border-radius:8px; padding:6px; font-size:11px; margin-bottom:8px;">
            <div style="display:flex; justify-content:between; margin-bottom:2px;">
              <span style="color:#6b7280;">${isBn ? "অবস্থা:" : "Activity:"}</span>
              <strong style="color:#111827;">${safeActivityLabel}</strong>
            </div>
            <div style="display:flex; justify-content:between; margin-bottom:2px;">
              <span style="color:#6b7280;">${isBn ? "দূরত্ব:" : "Distance:"}</span>
              <strong style="color:#111827;">${formatDistance(distanceToCenter, isBn)} ${isBn ? "কুঞ্জছায়া থেকে" : "from society"}</strong>
            </div>
            <div style="display:flex; justify-content:between;">
              <span style="color:#6b7280;">${isBn ? "সর্বশেষ আপডেট:" : "Updated:"}</span>
              <span style="color:#374151;">${formatRelativeTime(user.updatedAt, isBn)}</span>
            </div>
          </div>

          <a href="https://www.google.com/maps/dir/?api=1&destination=${user.lat},${user.lng}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:800; color:#059669; text-decoration:none;">
            ${isBn ? "এই সদস্যের কাছে যাওয়ার দিকনির্দেশনা" : "Navigate to Member"} →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      group.addLayer(marker);
    });
  }, [liveUsers, filterMode, isBn, session?.id]);

  // --------------------------------------------------------------------------
  // 6. Private "Locate Me" Pin on Map
  // --------------------------------------------------------------------------
  useEffect(() => {
    const group = myMarkerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!myLocation) return;

    const html = `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%);">
        <div style="position:absolute; width:40px; height:40px; border-radius:50%; background-color:#2563eb; opacity:0.35; animation:leafletPing 1.6s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="width:20px; height:20px; border-radius:50%; background-color:#2563eb; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>
      </div>
    `;

    const icon = L.divIcon({ className: "my-loc-pin", html, iconSize: [0, 0] });
    const marker = L.marker([myLocation.lat, myLocation.lng], { icon, zIndexOffset: 2000 });
    marker.bindPopup(`<strong>${isBn ? "আপনার বর্তমান অবস্থান" : "Your Current Location"}</strong><br/><span style="font-size:11px; color:#666;">Accuracy: ±${Math.round(myLocation.accuracy || 10)}m</span>`);
    group.addLayer(marker);
  }, [myLocation, isBn]);

  // --------------------------------------------------------------------------
  // 7. Start / Stop Live Location Sharing via GPS Watch & Presence
  // --------------------------------------------------------------------------
  const startSharingLiveLocation = () => {
    if (!navigator.geolocation) {
      toast(isBn ? "আপনার ব্রাউজার বা ডিভাইসে GPS সমর্থিত নয়।" : "Geolocation is not supported by your device.", "error");
      return;
    }

    if (!session) {
      toast(isBn ? "লাইভ অবস্থান শেয়ার করতে লগইন করুন।" : "Please log in to share live location.", "error");
      return;
    }

    const durationMinutes = parseInt(shareDuration, 10);
    const expiresAt = isNaN(durationMinutes) ? null : new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    setShareExpiresAt(expiresAt);

    toast(isBn ? "লাইভ লোকেশন চালু হচ্ছে..." : "Starting live location broadcast...", "info");

    const onPosSuccess = (pos) => {
      const { latitude, longitude, accuracy, heading, speed } = pos.coords;
      const posObj = { lat: latitude, lng: longitude, accuracy };
      setMyLocation(posObj);

      // Track in Supabase Presence
      if (channelRef.current) {
        channelRef.current.track({
          userId: session.id,
          name: session.name,
          role: session.role,
          post: session.post || session.memberClass,
          photoUrl: session.photoUrl,
          lat: latitude,
          lng: longitude,
          accuracy,
          heading: heading || 0,
          speed: speed || 0,
          activity: activityTag,
          activityText: customActivity.trim() || undefined,
          updatedAt: new Date().toISOString(),
          expiresAt,
        });
      }

      setIsSharing(true);
      setShareModalOpen(false);
    };

    const onPosError = (err) => {
      console.warn("GPS watchPosition error:", err);
      toast(
        isBn
          ? "GPS এক্সেস পাওয়া যায়নি। অনুগ্রহ করে ডিভাইসের লোকেশন পারমিশন দিন।"
          : "Could not access GPS. Please enable location permissions.",
        "error"
      );
      stopSharingLiveLocation();
    };

    const watchId = navigator.geolocation.watchPosition(onPosSuccess, onPosError, {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 15000,
    });

    watchIdRef.current = watchId;
  };

  const stopSharingLiveLocation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (channelRef.current) {
      channelRef.current.untrack();
    }

    setIsSharing(false);
    setShareExpiresAt(null);
    toast(isBn ? "লাইভ অবস্থান শেয়ার বন্ধ করা হয়েছে।" : "Stopped live location sharing.", "info");
  };

  // Auto-stop when expired
  useEffect(() => {
    if (!shareExpiresAt || !isSharing) return;

    const interval = setInterval(() => {
      if (new Date(shareExpiresAt).getTime() <= Date.now()) {
        stopSharingLiveLocation();
        toast(isBn ? "আপনার লাইভ লোকেশন শেয়ারিং-এর সময় সমাপ্ত হয়েছে।" : "Live location sharing period expired.", "info");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [shareExpiresAt, isSharing, isBn]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // 8. Locate Me (Private GPS without public broadcast)
  // --------------------------------------------------------------------------
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast(isBn ? "GPS সমর্থিত নয়।" : "GPS not supported.", "error");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude, accuracy });
        setLocating(false);

        const map = mapInstanceRef.current;
        if (map) {
          map.setView([latitude, longitude], 17);
        }

        const dist = calculateDistanceKm(latitude, longitude, KUNJACHAYA_COORDS.lat, KUNJACHAYA_COORDS.lng);
        toast(
          isBn
            ? `আপনার অবস্থান পাওয়া গেছে! কুঞ্জছায়া থেকে দূরত্ব: ${formatDistance(dist, true)}`
            : `Located! Distance to Kunjachaya: ${formatDistance(dist, false)}`,
          "success"
        );
      },
      (err) => {
        setLocating(false);
        toast(isBn ? "লোকেশন পেতে ব্যর্থ হয়েছে। GPS অন আছে কিনা দেখুন।" : "Failed to retrieve location. Please check device GPS.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const centerKunjachaya = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([KUNJACHAYA_COORDS.lat, KUNJACHAYA_COORDS.lng], 17);
    }
  };

  const copyCoordinates = () => {
    const text = `${KUNJACHAYA_COORDS.lat}, ${KUNJACHAYA_COORDS.lng} (Kunjachhaya Residential Area, Bayezid Bostami, Chattogram)`;
    navigator.clipboard?.writeText?.(text);
    setCopied(true);
    toast(isBn ? "GPS কোঅর্ডিনেট ও ঠিকানা কপি করা হয়েছে!" : "Coordinates and address copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareCommunityLink = () => {
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

  const liveUsersCount = Object.keys(liveUsers).length;

  return (
    <Card className={`p-4 sm:p-5 overflow-hidden relative shadow-sm ${className}`} style={{ borderColor: C.outlineVariant }}>
      {/* Dynamic Keyframes for Leaflet Pulsing Markers */}
      <style>{`
        @keyframes leafletPing {
          0% { transform: scale(0.6); opacity: 0.8; }
          80%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-container {
          z-index: 1 !important;
          font-family: inherit;
        }
      `}</style>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 shrink-0 shadow-xs">
            <MapPin size={22} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base heading text-gray-900 dark:text-gray-100">
                {isBn ? "কুঞ্জছায়া লাইভ কমিউনিটি মানচিত্র" : "Kunjachaya Community Live Map"}
              </h3>
              <Badge tone="success" className="animate-pulse">
                <Radio size={12} className="inline mr-1 text-emerald-600 dark:text-emerald-400" />
                {liveUsersCount > 0
                  ? (isBn ? `${liveUsersCount} জন লাইভ` : `${liveUsersCount} Live Now`)
                  : (isBn ? "লাইভ রিয়েলটাইম" : "Realtime Active")}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isBn
                ? "বায়েজিদ বোস্তামী থানা রোড, ২নং জালালাবাদ ওয়ার্ড, চট্টগ্রাম।"
                : "Bayezid Bostami Road, 2 No. Jalalabad Ward, Chattogram."}
            </p>
          </div>
        </div>

        {/* Action Controls & Layer Toggle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Map Layer Switcher: Street vs Satellite */}
          <div className="p-1 rounded-xl flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMapType("m")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${mapType === "m" ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs" : "text-gray-500"}`}
            >
              {isBn ? "রোডম্যাপ" : "Street"}
            </button>
            <button
              type="button"
              onClick={() => setMapType("k")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${mapType === "k" ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs" : "text-gray-500"}`}
            >
              {isBn ? "স্যাটেলাইট" : "Satellite"}
            </button>
          </div>

          {/* Option 3: Share Live Location Button */}
          {!isSharing ? (
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm"
              title={isBn ? "আপনার লাইভ অবস্থান শেয়ার করুন" : "Broadcast your live location to community"}
            >
              <Radio size={14} className="animate-pulse" />
              <span>{isBn ? "লাইভ শেয়ার" : "Share Live"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopSharingLiveLocation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm animate-pulse"
              title={isBn ? "লাইভ শেয়ারিং বন্ধ করুন" : "Stop live location sharing"}
            >
              <StopCircle size={14} />
              <span>{isBn ? "বন্ধ করুন" : "Stop Sharing"}</span>
            </button>
          )}

          {/* Quick Google Maps Directions Link */}
          <a
            href={KUNJACHAYA_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            title="Open turn-by-turn directions in Google Maps"
          >
            <Navigation size={13} className="text-emerald-600" />
            <span className="hidden sm:inline">{isBn ? "দিকনির্দেশনা" : "Directions"}</span>
          </a>
        </div>
      </div>

      {/* Active Live Broadcast Banner */}
      {isSharing && (
        <div
          className="flex items-center justify-between gap-3 p-3 rounded-xl mb-3 text-xs border"
          style={{ backgroundColor: `${C.primary}12`, borderColor: `${C.primary}35`, color: C.onSurface }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                {isBn ? "আপনার লাইভ লোকেশন সক্রিয় আছে" : "Your Live Location is Active"}
              </span>
              <span className="opacity-75 block text-[11px]">
                {shareExpiresAt
                  ? (isBn
                      ? `মেয়াদ শেষ হবে: ${new Date(shareExpiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : `Expires at: ${new Date(shareExpiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`)
                  : (isBn ? "ম্যানুয়ালি বন্ধ না করা পর্যন্ত চালু থাকবে" : "Broadcasting until stopped")}
              </span>
            </div>
          </div>
          <button
            onClick={stopSharingLiveLocation}
            className="px-2.5 py-1 rounded-lg font-bold text-xs bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
          >
            {isBn ? "বন্ধ করুন" : "Stop"}
          </button>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[16/9] sm:aspect-[21/9] min-h-[300px] sm:min-h-[380px] shadow-inner bg-slate-900 z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Quick Action Overlay Controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-[400]">
          {/* Snap to Kunjachaya */}
          <button
            type="button"
            onClick={centerKunjachaya}
            className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 shadow-md backdrop-blur-xs border border-black/5 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-transform active:scale-95"
            title={isBn ? "কুঞ্জছায়া সেন্টারে ফিরে যান" : "Center on Kunjachaya"}
          >
            <Compass size={17} className="text-emerald-600" />
          </button>

          {/* Locate My GPS */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 shadow-md backdrop-blur-xs border border-black/5 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-transform active:scale-95 disabled:opacity-60"
            title={isBn ? "আমার বর্তমান GPS অবস্থান খুঁজুন" : "Find My GPS Location"}
          >
            <Crosshair size={17} className={locating ? "animate-spin text-blue-600" : "text-blue-600"} />
          </button>
        </div>

        {/* Filter Pills overlay */}
        <div className="absolute top-3 right-14 flex items-center gap-1 z-[400] bg-white/90 dark:bg-slate-900/90 p-1 rounded-xl shadow-md border border-black/5 dark:border-white/10 backdrop-blur-xs text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-2 py-0.5 rounded-lg transition-colors ${filterMode === "all" ? "bg-emerald-600 text-white" : "text-slate-600 dark:text-slate-300"}`}
          >
            {isBn ? "সব" : "All"}
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("members")}
            className={`px-2 py-0.5 rounded-lg transition-colors ${filterMode === "members" ? "bg-emerald-600 text-white" : "text-slate-600 dark:text-slate-300"}`}
          >
            {isBn ? `সদস্য (${liveUsersCount})` : `Live (${liveUsersCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("landmarks")}
            className={`px-2 py-0.5 rounded-lg transition-colors ${filterMode === "landmarks" ? "bg-emerald-600 text-white" : "text-slate-600 dark:text-slate-300"}`}
          >
            {isBn ? "ল্যান্ডমার্ক" : "Places"}
          </button>
        </div>

        {/* Floating Bottom Info Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-[400]">
          <span className="text-xs font-bold text-slate-900 bg-white/90 dark:bg-slate-900/90 dark:text-slate-100 px-3 py-1 rounded-full shadow-md backdrop-blur-xs pointer-events-auto border border-black/5 dark:border-white/10 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>22.3810° N, 91.8166° E</span>
          </span>

          <a
            href={KUNJACHAYA_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] sm:text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-900 dark:bg-emerald-700/90 dark:hover:bg-emerald-700 px-3 py-1 rounded-full shadow-md backdrop-blur-xs pointer-events-auto flex items-center gap-1 transition-transform active:scale-95"
          >
            <span>{isBn ? "গুগল ম্যাপে বড় করুন" : "Open in Google Maps"}</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Community Landmark Quick Cards */}
      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {isBn ? "ব্লক বিন্যাস" : "Blocks"}
            </span>
            <p className="font-black text-gray-900 dark:text-gray-100">
              {isBn ? "ব্লক A, B, C, D, E" : "Block A, B, C, D, E"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {isBn ? "প্রবেশ ও নির্গমন গেট" : "Society Gates"}
            </span>
            <p className="font-black text-gray-900 dark:text-gray-100">
              {isBn ? "১নং ও ২নং গেট (২৪/৭ সিকিউরিটি)" : "Gate 1 & Gate 2 (24/7)"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {isBn ? "সিটি কর্পোরেশন" : "City Corp"}
            </span>
            <p className="font-black text-gray-900 dark:text-gray-100">
              {isBn ? "২নং জালালাবাদ ওয়ার্ড" : "Ward 2 (Jalalabad)"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              {isBn ? "নিকটবর্তী ল্যান্ডমার্ক" : "Nearest Police"}
            </span>
            <p className="font-black text-gray-900 dark:text-gray-100">
              {isBn ? "বায়েজিদ বোস্তামী থানা (৮০০মি)" : "Bayezid Thana (800m)"}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-200 dark:border-slate-700/60 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCoordinates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors"
            style={{ color: C.onSurfaceVariant }}
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? (isBn ? "কপি হয়েছে!" : "Copied!") : (isBn ? "কোঅর্ডিনেট কপি" : "Copy GPS")}</span>
          </button>

          <button
            type="button"
            onClick={shareCommunityLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors"
            style={{ color: C.onSurfaceVariant }}
          >
            <Share2 size={14} />
            <span>{isBn ? "শেয়ার লিংক" : "Share"}</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-400">
          {isBn
            ? "রিয়েলটাইম লাইভ ট্র্যাকিং সুপাবেস চ্যানেল দ্বারা সুরক্ষিত।"
            : "Live tracking powered by Supabase Realtime Presence."}
        </p>
      </div>

      {/* Share Live Location Setup Modal */}
      <Modal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={isBn ? "লাইভ অবস্থান শেয়ারিং কনফিগার করুন" : "Share Live Location with Community"}
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {isBn
              ? "আপনার লাইভ জিপিএস অবস্থান শুধুমাত্র কুঞ্জছায়া সোসাইটির যাচাইকৃত সদস্য ও সিকিউরিটির কাছে রিয়েলটাইমে দৃশ্যমান হবে।"
              : "Your live GPS position will be visible in real time to verified Kunjachaya residents and security staff on the community map."}
          </p>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {isBn ? "কতক্ষণ শেয়ার করতে চান?" : "Sharing Duration"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
              {[
                { val: "15", label: isBn ? "১৫ মিনিট" : "15 Mins" },
                { val: "60", label: isBn ? "১ ঘণ্টা" : "1 Hour" },
                { val: "480", label: isBn ? "৮ ঘণ্টা (ডিউটি)" : "8 Hours (Shift)" },
                { val: "unlimited", label: isBn ? "বন্ধ না করা পর্যন্ত" : "Until Stopped" },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setShareDuration(opt.val)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${shareDuration === opt.val ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Tag Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {isBn ? "কার্যক্রমের ধরন (স্ট্যাটাস)" : "Activity Status"}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: "patrol", label: isBn ? "🛡️ ডিউটি / সিকিউরিটি টহল" : "🛡️ On Duty / Patrol" },
                { key: "gate", label: isBn ? "🚪 সোসাইটি গেট অবস্থান" : "🚪 At Society Gate" },
                { key: "event", label: isBn ? "🎉 কমিউনিটি অনুষ্ঠানে" : "🎉 At Community Event" },
                { key: "resident", label: isBn ? "🏡 আবাসিক সদস্য" : "🏡 Resident Inside Area" },
              ].map(act => (
                <button
                  key={act.key}
                  type="button"
                  onClick={() => setActivityTag(act.key)}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${activityTag === act.key ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300" : "border-slate-200 dark:border-slate-700 text-gray-700 dark:text-gray-300"}`}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom note optional */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {isBn ? "অতিরিক্ত বার্তা (ঐচ্ছিক)" : "Custom Note (Optional)"}
            </label>
            <input
              type="text"
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              placeholder={isBn ? "যেমন: ১নং গেট পরিদর্শন করছি..." : "e.g. Inspecting Gate 1..."}
              maxLength={40}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShareModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={startSharingLiveLocation}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Radio size={14} className="animate-pulse" />
              <span>{isBn ? "শেয়ারিং শুরু করুন" : "Start Live Sharing"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
