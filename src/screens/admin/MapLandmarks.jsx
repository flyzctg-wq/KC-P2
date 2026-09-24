import React, { useState, useEffect, useRef } from "react";
import {
  MapPin, Plus, Pencil, Trash2, Save, X, Loader2, ShieldAlert,
  RefreshCw, Map as MapIcon, Info, CheckCircle2, AlertTriangle,
  GripVertical, Eye, EyeOff, Navigation
} from "lucide-react";
import { Card, Badge, SectionTitle, Btn, Modal, Field, inputCls, inputStyle } from "../../components/primitives";
import { C } from "../../theme";
import { supabase } from "../../lib/supabase";

// Default fallback landmarks (same as CommunityMap hardcoded defaults)
const DEFAULT_LANDMARKS = [
  { id: "office",  nameEn: "Society Office & Clubhouse",           nameBn: "সোসাইটি অফিস ও ক্লাব ভবন",                      lat: 22.3810056, lng: 91.8165975, icon: "🏢", color: "#059669", type: "office" },
  { id: "gate1",   nameEn: "Gate 1 (Main Entrance - Bayezid Road)", nameBn: "১নং গেট (প্রধান প্রবেশদ্বার - বায়েজীদ রোড)",   lat: 22.38138,   lng: 91.81615,   icon: "🚪", color: "#d97706", type: "gate" },
  { id: "gate2",   nameEn: "Gate 2 (West Exit / Ring Road access)", nameBn: "২নং গেট (পশ্চিম নির্গমন / রিং রোড)",             lat: 22.38068,   lng: 91.81592,   icon: "🚪", color: "#d97706", type: "gate" },
  { id: "mosque",  nameEn: "Kunjachaya Jamia Mosque",               nameBn: "কুঞ্জছায়া জামে মসজিদ",                           lat: 22.38125,   lng: 91.81682,   icon: "🕌", color: "#0284c7", type: "mosque" },
  { id: "park",    nameEn: "Community Park & Children Playground",  nameBn: "কমিউনিটি পার্ক ও শিশু খেলার মাঠ",               lat: 22.38148,   lng: 91.81710,   icon: "🌳", color: "#16a34a", type: "park" },
  { id: "blockA",  nameEn: "Block A", nameBn: "ব্লক এ", lat: 22.38155, lng: 91.81640, icon: "🅰️", color: "#6366f1", type: "block" },
  { id: "blockB",  nameEn: "Block B", nameBn: "ব্লক বি", lat: 22.38118, lng: 91.81605, icon: "🅱️", color: "#6366f1", type: "block" },
  { id: "blockC",  nameEn: "Block C", nameBn: "ব্লক সি", lat: 22.38078, lng: 91.81665, icon: "🅲",  color: "#6366f1", type: "block" },
  { id: "blockD",  nameEn: "Block D", nameBn: "ব্লক ডি", lat: 22.38058, lng: 91.81715, icon: "🅳",  color: "#6366f1", type: "block" },
  { id: "blockE",  nameEn: "Block E", nameBn: "ব্লক ই", lat: 22.38115, lng: 91.81740, icon: "🅴",  color: "#6366f1", type: "block" },
];

const PRESET_ICONS = ["🏢", "🚪", "🕌", "🌳", "🏠", "🏥", "🏫", "🏪", "⛽", "🅰️", "🅱️", "🅲", "🅳", "🅴", "📍", "🔴", "🟢", "🔵", "⭐", "🚑", "🛡️", "🏋️", "🎪", "🌿", "💧", "🔒", "🚗", "🎯"];
const PRESET_COLORS = [
  "#059669", "#d97706", "#0284c7", "#16a34a", "#6366f1",
  "#dc2626", "#7c3aed", "#0891b2", "#ca8a04", "#be185d",
  "#374151", "#f97316", "#10b981", "#3b82f6", "#a855f7",
];
const LANDMARK_TYPES = ["office", "gate", "mosque", "park", "block", "facility", "emergency", "other"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const EMPTY_FORM = {
  id: "",
  nameEn: "",
  nameBn: "",
  lat: "",
  lng: "",
  icon: "📍",
  color: "#059669",
  type: "facility",
  hidden: false,
};

export default function AdminMapLandmarks({ session, lang, toast }) {
  const isBn = lang === "bn";
  const isSuperAdmin = session?.role === "admin" &&
    (session?.post === "President" || session?.post === "General Secretary");
  const isOIC = session?.role === "admin" &&
    (session?.post === "Officer-in-Charge" || session?.post === "General Secretary" ||
     session?.post === "President" || session?.post === "Joint Secretary");

  const canEdit = isSuperAdmin || isOIC;

  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = new
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [resetting, setResetting] = useState(false);

  // ── Load landmarks from Supabase ─────────────────────────────────────────
  const loadLandmarks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "kc_map_landmarks")
        .maybeSingle();

      if (error) throw error;
      if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
        setLandmarks(data.value);
      } else {
        // Seed with defaults on first load
        setLandmarks(DEFAULT_LANDMARKS);
      }
    } catch (err) {
      console.warn("Failed to load landmarks:", err);
      setLandmarks(DEFAULT_LANDMARKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLandmarks(); }, []);

  // ── Save all landmarks to Supabase ────────────────────────────────────────
  const saveLandmarks = async (list) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("app_config")
        .upsert({ key: "kc_map_landmarks", value: list, updated_at: new Date().toISOString() });
      if (error) throw error;
      setLandmarks(list);
      toast(isBn ? "মানচিত্রের ল্যান্ডমার্ক সংরক্ষণ করা হয়েছে।" : "Map landmarks saved successfully.", "success");
    } catch (err) {
      toast(err?.message || (isBn ? "সংরক্ষণ ব্যর্থ হয়েছে।" : "Failed to save landmarks."), "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Open add/edit modal ───────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, id: uid() });
    setModalOpen(true);
  };

  const openEdit = (lm) => {
    setEditTarget(lm.id);
    setForm({ ...lm });
    setModalOpen(true);
  };

  // ── Save from modal ───────────────────────────────────────────────────────
  const handleSaveForm = async () => {
    if (!form.nameEn.trim()) {
      toast(isBn ? "ইংরেজি নাম আবশ্যক।" : "English name is required.", "error");
      return;
    }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      toast(isBn ? "সঠিক GPS স্থানাঙ্ক (latitude/longitude) দিন।" : "Please enter valid GPS coordinates.", "error");
      return;
    }

    const entry = { ...form, lat, lng };
    let updated;
    if (editTarget) {
      updated = landmarks.map(lm => lm.id === editTarget ? entry : lm);
    } else {
      updated = [...landmarks, entry];
    }

    setModalOpen(false);
    await saveLandmarks(updated);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeletingId(id);
    const updated = landmarks.filter(lm => lm.id !== id);
    await saveLandmarks(updated);
    setDeleteConfirm(null);
    setDeletingId(null);
  };

  // ── Toggle hidden ─────────────────────────────────────────────────────────
  const toggleHidden = async (lm) => {
    const updated = landmarks.map(l => l.id === lm.id ? { ...l, hidden: !l.hidden } : l);
    await saveLandmarks(updated);
  };

  // ── Reset to defaults ─────────────────────────────────────────────────────
  const handleReset = async () => {
    setResetting(true);
    await saveLandmarks(DEFAULT_LANDMARKS);
    setResetting(false);
    setDeleteConfirm(null);
  };

  const f = (en, bn) => isBn ? bn : en;

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${C.outline}18` }}>
          <ShieldAlert size={32} style={{ color: C.outline }} />
        </div>
        <h2 className="font-extrabold text-lg mb-2" style={{ color: C.onSurface }}>
          {f("Access Restricted", "অ্যাক্সেস সীমাবদ্ধ")}
        </h2>
        <p className="text-sm max-w-xs" style={{ color: C.onSurfaceVariant }}>
          {f("Only Super Admin (President / General Secretary) or Officers-in-Charge can manage map landmarks.", "শুধুমাত্র সুপার অ্যাডমিন বা দায়িত্বপ্রাপ্ত কর্মকর্তা মানচিত্রের ল্যান্ডমার্ক পরিচালনা করতে পারবেন।")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: `${C.primary}18` }}>
            <MapPin size={22} style={{ color: C.primary }} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg heading" style={{ color: C.onSurface }}>
              {f("Map Landmarks", "মানচিত্র ল্যান্ডমার্ক")}
            </h1>
            <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
              {f("Manage pins shown on the Community Live Map.", "কমিউনিটি লাইভ ম্যাপে প্রদর্শিত পিন পরিচালনা করুন।")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadLandmarks}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ borderColor: C.outlineVariant, color: C.onSurfaceVariant }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {f("Refresh", "রিফ্রেশ")}
          </button>

          <button
            type="button"
            onClick={() => setDeleteConfirm("reset")}
            disabled={saving || resetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/30"
            style={{ borderColor: "#d97706", color: "#d97706" }}
          >
            <AlertTriangle size={13} />
            {f("Reset Defaults", "ডিফল্ট পুনরুদ্ধার")}
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-colors hover:opacity-90"
            style={{ backgroundColor: C.primary }}
          >
            <Plus size={14} />
            {f("Add Landmark", "ল্যান্ডমার্ক যোগ করুন")}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl text-xs border"
        style={{ backgroundColor: `${C.primary}0d`, borderColor: `${C.primary}30`, color: C.onSurfaceVariant }}>
        <Info size={14} className="shrink-0 mt-0.5" style={{ color: C.primary }} />
        <span>{f(
          "Changes are saved to Supabase and automatically appear on all users' Community Live Map. Hidden landmarks are stored but not displayed on the map.",
          "পরিবর্তনগুলো সুপাবেসে সংরক্ষিত হয় এবং স্বয়ংক্রিয়ভাবে সকল ব্যবহারকারীর ম্যাপে দেখা যায়। লুকানো ল্যান্ডমার্ক ম্যাপে প্রদর্শিত হয় না।"
        )}</span>
      </div>

      {/* Landmark List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin" size={28} style={{ color: C.primary }} />
        </div>
      ) : (
        <div className="space-y-2">
          {landmarks.length === 0 && (
            <Card className="p-8 text-center">
              <MapPin size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                {f("No landmarks yet. Add one to get started.", "এখনো কোনো ল্যান্ডমার্ক নেই।")}
              </p>
            </Card>
          )}

          {landmarks.map((lm, idx) => (
            <Card
              key={lm.id}
              className={`p-3 sm:p-4 transition-opacity ${lm.hidden ? "opacity-50" : ""}`}
              style={{ borderColor: C.outlineVariant }}
            >
              <div className="flex items-center gap-3">
                {/* Color dot + Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg shadow-xs border-2"
                  style={{ backgroundColor: `${lm.color}20`, borderColor: lm.color }}
                >
                  {lm.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm truncate" style={{ color: C.onSurface }}>
                      {lm.nameEn}
                    </span>
                    {lm.nameBn && (
                      <span className="text-xs truncate" style={{ color: C.onSurfaceVariant }}>
                        {lm.nameBn}
                      </span>
                    )}
                    {lm.hidden && (
                      <Badge tone="error" className="text-[10px]">
                        {f("Hidden", "লুকানো")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] font-mono" style={{ color: C.onSurfaceVariant }}>
                      {Number(lm.lat).toFixed(5)}, {Number(lm.lng).toFixed(5)}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                      style={{ backgroundColor: `${lm.color}20`, color: lm.color }}
                    >
                      {lm.type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Google Maps preview link */}
                  <a
                    href={`https://www.google.com/maps?q=${lm.lat},${lm.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title={f("Preview on Google Maps", "গুগল ম্যাপে দেখুন")}
                  >
                    <Navigation size={14} style={{ color: C.onSurfaceVariant }} />
                  </a>

                  {/* Toggle visibility */}
                  <button
                    type="button"
                    onClick={() => toggleHidden(lm)}
                    disabled={saving}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title={lm.hidden ? f("Show on map", "ম্যাপে দেখান") : f("Hide from map", "ম্যাপ থেকে লুকান")}
                  >
                    {lm.hidden
                      ? <EyeOff size={14} style={{ color: C.onSurfaceVariant }} />
                      : <Eye size={14} style={{ color: C.onSurfaceVariant }} />}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEdit(lm)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                    title={f("Edit", "সম্পাদনা")}
                  >
                    <Pencil size={14} className="text-blue-600" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(lm.id)}
                    disabled={deletingId === lm.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title={f("Delete", "মুছুন")}
                  >
                    {deletingId === lm.id
                      ? <Loader2 size={14} className="animate-spin text-red-500" />
                      : <Trash2 size={14} className="text-red-500" />}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {saving && (
        <div className="flex items-center gap-2 text-xs p-3 rounded-xl" style={{ backgroundColor: `${C.primary}12`, color: C.primary }}>
          <Loader2 size={13} className="animate-spin" />
          {f("Saving changes to Supabase…", "সুপাবেসে পরিবর্তন সংরক্ষণ হচ্ছে…")}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? f("Edit Landmark", "ল্যান্ডমার্ক সম্পাদনা") : f("Add New Landmark", "নতুন ল্যান্ডমার্ক যোগ করুন")}
      >
        <div className="space-y-4 py-1">
          {/* English Name */}
          <Field label={f("English Name *", "ইংরেজি নাম *")}>
            <input
              type="text"
              style={inputStyle()}
              className={inputCls}
              value={form.nameEn}
              onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
              placeholder="e.g. Society Office & Clubhouse"
            />
          </Field>

          {/* Bengali Name */}
          <Field label={f("Bengali Name (optional)", "বাংলা নাম (ঐচ্ছিক)")}>
            <input
              type="text"
              style={inputStyle()}
              className={inputCls}
              value={form.nameBn}
              onChange={e => setForm(f => ({ ...f, nameBn: e.target.value }))}
              placeholder="যেমন: সোসাইটি অফিস"
            />
          </Field>

          {/* GPS Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={f("Latitude *", "অক্ষাংশ *")}>
              <input
                type="number"
                step="0.00001"
                style={inputStyle()}
                className={inputCls}
                value={form.lat}
                onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                placeholder="22.38100"
              />
            </Field>
            <Field label={f("Longitude *", "দ্রাঘিমাংশ *")}>
              <input
                type="number"
                step="0.00001"
                style={inputStyle()}
                className={inputCls}
                value={form.lng}
                onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                placeholder="91.81659"
              />
            </Field>
          </div>

          <p className="text-[11px]" style={{ color: C.onSurfaceVariant }}>
            💡 {f("Tip: Find GPS coordinates by right-clicking any location on Google Maps → \"What's here?\"",
              "টিপস: গুগল ম্যাপে ডান ক্লিক করুন এবং \"What's here?\" নির্বাচন করুন।")}
          </p>

          {/* Icon Picker */}
          <Field label={f("Icon", "আইকন")}>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {PRESET_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border-2 transition-all ${form.icon === ic ? "scale-110 shadow-md" : "opacity-60 hover:opacity-100"}`}
                  style={{ borderColor: form.icon === ic ? C.primary : C.outlineVariant, backgroundColor: form.icon === ic ? `${C.primary}15` : "transparent" }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </Field>

          {/* Color Picker */}
          <Field label={f("Pin Color", "পিনের রঙ")}>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {PRESET_COLORS.map(col => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: col }))}
                  className={`w-7 h-7 rounded-full border-4 transition-all ${form.color === col ? "scale-125 shadow-md" : "border-transparent hover:scale-110"}`}
                  style={{ backgroundColor: col, borderColor: form.color === col ? C.onSurface : "transparent" }}
                />
              ))}
            </div>
            {/* Custom hex input */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full border shrink-0" style={{ backgroundColor: form.color, borderColor: C.outlineVariant }} />
              <input
                type="text"
                style={inputStyle()}
                className={`${inputCls} font-mono text-xs`}
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                placeholder="#059669"
                maxLength={7}
              />
            </div>
          </Field>

          {/* Type */}
          <Field label={f("Landmark Type", "ল্যান্ডমার্কের ধরন")}>
            <select
              style={inputStyle()}
              className={inputCls}
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {LANDMARK_TYPES.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </Field>

          {/* Hidden toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: C.surfaceContainer }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.onSurface }}>
                {f("Hide from Map", "ম্যাপ থেকে লুকান")}
              </p>
              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
                {f("Landmark is saved but not shown to users.", "ল্যান্ডমার্ক সংরক্ষিত কিন্তু ম্যাপে দেখা যাবে না।")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, hidden: !f.hidden }))}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.hidden ? "bg-rose-500" : "bg-emerald-500"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.hidden ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: C.surfaceContainer }}>
            <p className="text-xs font-semibold mr-2" style={{ color: C.onSurfaceVariant }}>
              {f("Preview:", "প্রিভিউ:")}
            </p>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-white text-xs font-bold shadow"
              style={{ backgroundColor: form.color }}
            >
              <span>{form.icon}</span>
              <span>{form.nameEn || f("Landmark Name", "ল্যান্ডমার্কের নাম")}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2 rounded-xl text-sm font-bold border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: C.outlineVariant, color: C.onSurfaceVariant }}
            >
              {f("Cancel", "বাতিল")}
            </button>
            <button
              type="button"
              onClick={handleSaveForm}
              disabled={saving}
              className="flex-1 py-2 rounded-xl text-sm font-bold text-white shadow transition-colors hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: C.primary }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {f("Save Landmark", "সংরক্ষণ করুন")}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete / Reset Confirm Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={deleteConfirm === "reset"
          ? f("Reset to Defaults?", "ডিফল্টে রিসেট করবেন?")
          : f("Delete Landmark?", "ল্যান্ডমার্ক মুছবেন?")}
      >
        <div className="space-y-4 py-1">
          <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
            {deleteConfirm === "reset"
              ? f("This will replace all current landmarks with the original 10 default pins. This cannot be undone.",
                  "এটি সকল বর্তমান ল্যান্ডমার্ক মুছে ডিফল্ট ১০টি পিন পুনরুদ্ধার করবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।")
              : f("Are you sure you want to permanently delete this landmark from the community map?",
                  "আপনি কি নিশ্চিতভাবে এই ল্যান্ডমার্কটি মুছতে চান?")}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2 rounded-xl text-sm font-bold border hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderColor: C.outlineVariant, color: C.onSurfaceVariant }}
            >
              {f("Cancel", "বাতিল")}
            </button>
            <button
              type="button"
              onClick={() => deleteConfirm === "reset" ? handleReset() : handleDelete(deleteConfirm)}
              disabled={saving || resetting}
              className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              {(saving || resetting) ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleteConfirm === "reset" ? f("Yes, Reset", "হ্যাঁ, রিসেট করুন") : f("Yes, Delete", "হ্যাঁ, মুছুন")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
