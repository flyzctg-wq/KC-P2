import React, { useState } from "react";
import { ToggleLeft, ToggleRight, ShieldAlert, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, Badge, SectionTitle } from "../../components/primitives";
import { C } from "../../theme";
import { MODULE_META, MODULE_NAV_KEYS, DEFAULT_MODULE_FLAGS } from "../../lib/moduleConfig";
import { supabase } from "../../lib/supabase";

export default function AdminModules({ session, moduleFlags: rawFlags, lang, toast }) {
  const isBn = lang === "bn";
  const moduleFlags = rawFlags ?? DEFAULT_MODULE_FLAGS;

  const isSuperAdmin = session?.role === "admin" &&
    (session?.post === "President" || session?.post === "General Secretary");

  // Local optimistic state while saving
  const [saving, setSaving] = useState(null); // key of the module currently being saved

  const handleToggle = async (modKey) => {
    if (!isSuperAdmin || saving) return;
    const currentVal = moduleFlags[modKey] !== false; // default true
    const newVal = !currentVal;

    setSaving(modKey);
    try {
      const newFlags = { ...moduleFlags, [modKey]: newVal };

      const { error } = await supabase
        .from("app_config")
        .upsert({ key: "kc_modules", value: newFlags, updated_at: new Date().toISOString() });

      if (error) throw error;

      toast(
        isBn
          ? `${MODULE_META[modKey]?.[isBn ? "labelBn" : "labelEn"] || modKey} ${newVal ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে।`
          : `${MODULE_META[modKey]?.labelEn || modKey} ${newVal ? "enabled" : "disabled"} — changes will propagate to all users.`,
        newVal ? "success" : "info"
      );
    } catch (err) {
      toast(err?.message || "Failed to update module flags", "error");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <SectionTitle>
        {isBn ? "অ্যাপ মডিউল নিয়ন্ত্রণ" : "App Module Controls"}
      </SectionTitle>

      {/* Access notice for non-super-admins */}
      {!isSuperAdmin && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl border mb-5 text-sm"
          style={{ backgroundColor: `${C.tertiary}15`, borderColor: `${C.tertiary}40`, color: C.onSurface }}
        >
          <ShieldAlert size={18} className="shrink-0 mt-0.5" style={{ color: C.tertiary }} />
          <p>
            {isBn
              ? "শুধুমাত্র সভাপতি ও সাধারণ সম্পাদক মডিউল টগল করতে পারবেন। আপনি শুধু বর্তমান অবস্থা দেখতে পারছেন।"
              : "Only the President or General Secretary can toggle modules. You are viewing the current state in read-only mode."}
          </p>
        </div>
      )}

      {/* Info card */}
      <Card className="p-4 mb-5 border text-sm" style={{ borderColor: C.outlineVariant }}>
        <p style={{ color: C.onSurfaceVariant }}>
          {isBn
            ? "কোনো মডিউল নিষ্ক্রিয় করলে সেটি সকল সাধারণ সদস্যের নেভিগেশন থেকে তৎক্ষণাৎ সরিয়ে দেওয়া হবে। অ্যাডমিনরা সবসময় সব মডিউল দেখতে পারবেন।"
            : "Disabling a module immediately hides it from all regular members' navigation. Admins always retain access to all modules regardless of toggle state."}
        </p>
      </Card>

      {/* Module toggle grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {Object.entries(MODULE_META).map(([modKey, meta]) => {
          const Icon = meta.icon;
          const enabled = moduleFlags[modKey] !== false;
          const isSaving = saving === modKey;
          const navKeys = MODULE_NAV_KEYS[modKey] || [];

          return (
            <Card
              key={modKey}
              className="p-4 border flex items-start gap-3 transition-all"
              style={{
                borderColor: enabled ? C.outlineVariant : `${C.error}40`,
                backgroundColor: enabled ? C.surface : `${C.error}08`,
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: enabled ? `${C.primary}18` : `${C.error}15`,
                }}
              >
                <Icon size={20} style={{ color: enabled ? C.primary : C.error }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm" style={{ color: C.onSurface }}>
                    {isBn ? meta.labelBn : meta.labelEn}
                  </p>
                  {enabled ? (
                    <Badge tone="success">
                      <CheckCircle2 size={11} className="inline mr-0.5" />
                      {isBn ? "চালু" : "ON"}
                    </Badge>
                  ) : (
                    <Badge tone="error">
                      <XCircle size={11} className="inline mr-0.5" />
                      {isBn ? "বন্ধ" : "OFF"}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] mt-0.5 font-mono" style={{ color: C.outline }}>
                  {navKeys.join(", ")}
                </p>
              </div>

              {/* Toggle button */}
              {isSuperAdmin && (
                <button
                  onClick={() => handleToggle(modKey)}
                  disabled={!!saving}
                  className="shrink-0 p-1 rounded-xl transition-colors disabled:opacity-60"
                  title={enabled
                    ? (isBn ? "মডিউল বন্ধ করুন" : "Disable module")
                    : (isBn ? "মডিউল চালু করুন" : "Enable module")}
                  aria-label={`Toggle ${meta.labelEn}`}
                >
                  {isSaving ? (
                    <Loader2 size={28} className="animate-spin" style={{ color: C.primary }} />
                  ) : enabled ? (
                    <ToggleRight size={32} style={{ color: C.primary }} />
                  ) : (
                    <ToggleLeft size={32} style={{ color: C.outline }} />
                  )}
                </button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-xs text-center mt-6" style={{ color: C.outline }}>
        {isBn
          ? "পরিবর্তনগুলো রিয়েলটাইমে সকল সংযুক্ত ব্যবহারকারীদের কাছে প্রেরণ করা হয়।"
          : "Changes propagate in real-time to all connected users via Supabase Realtime."}
      </p>
    </div>
  );
}
