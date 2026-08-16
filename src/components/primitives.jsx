import React from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { C } from "../theme";
import { initials, avatarHue } from "../utils";

export function Btn({ children, variant = "primary", size = "md", icon: Icon, onClick, disabled, type = "button", full, className = "" }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]";
  const styles = {
    primary: { backgroundColor: C.primary, color: C.onPrimary },
    secondary: { backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer },
    outline: { backgroundColor: "transparent", color: C.primary, border: `1.5px solid ${C.outline}` },
    danger: { backgroundColor: C.error, color: "#fff" },
    ghost: { backgroundColor: "transparent", color: C.onSurfaceVariant },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={styles[variant]}
      className={`${base} ${sizes[size]} ${full ? "w-full" : ""} ${className}`}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.3} />}
      {children}
    </button>
  );
}

export function Card({ children, className = "", style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ backgroundColor: C.surface, border: `1px solid ${C.outlineVariant}`, ...style }}
      className={`rounded-2xl ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: C.surfaceContainerHigh, fg: C.onSurfaceVariant },
    success: { bg: "#d2e6c0", fg: C.primaryContainer },
    warning: { bg: C.goldContainer, fg: C.gold },
    danger: { bg: C.errorContainer, fg: C.onErrorContainer },
    error: { bg: C.errorContainer, fg: C.onErrorContainer },
    info: { bg: "#dbe6ff", fg: "#1e3a8a" },
    primary: { bg: C.primaryContainer, fg: "#ffffff" },
    secondary: { bg: C.secondaryContainer, fg: C.onSecondaryContainer },
  };
  const t = tones[tone] || tones.neutral;
  return <span style={{ backgroundColor: t.bg, color: t.fg }} className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide">{children}</span>;
}

export function Field({ label, children }) {
  return <label className="block mb-4"><span className="block text-xs font-semibold mb-1.5" style={{ color: C.onSurfaceVariant }}>{label}</span>{children}</label>;
}
export const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2";
export function inputStyle(focusRing = C.primary) {
  return { backgroundColor: C.surfaceContainerLow, border: `1.5px solid ${C.outlineVariant}`, color: C.onSurface };
}

export function Avatar({ name = "User", photoUrl, size = 36, className = "" }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover shrink-0 border border-black/10 select-none ${className}`}
      />
    );
  }
  const h = avatarHue(name);
  return (
    <div
      style={{ width: size, height: size, backgroundColor: `hsl(${h},38%,88%)`, color: `hsl(${h},45%,28%)`, fontSize: size * 0.38 }}
      className={`rounded-full flex items-center justify-center font-bold shrink-0 select-none ${className}`}
    >
      {initials(name)}
    </div>
  );
}

export function Empty({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div style={{ backgroundColor: C.surfaceContainer }} className="w-14 h-14 rounded-full flex items-center justify-center mb-3">
        <Icon size={24} style={{ color: C.outline }} />
      </div>
      <p className="font-semibold text-sm" style={{ color: C.onSurface }}>{title}</p>
      {subtitle && <p className="text-xs mt-1 max-w-xs" style={{ color: C.onSurfaceVariant }}>{subtitle}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = "max-w-md" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(20,25,15,0.45)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: C.surface }} className={`w-full ${width} rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto`}>
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b" style={{ backgroundColor: C.surface, borderColor: C.outlineVariant }}>
          <h3 className="font-bold text-base" style={{ color: C.onSurface }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:opacity-70" style={{ backgroundColor: C.surfaceContainer }}><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-bold text-lg" style={{ color: C.onSurface, fontFamily: "'Hanken Grotesk', sans-serif" }}>{children}</h2>
      {action}
    </div>
  );
}

export function Toasts({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} style={{ backgroundColor: t.type === "error" ? C.error : C.primary, color: "#fff" }}
          className="px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
          {t.type === "error" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export function StatMini({ icon: Icon, label, value, tone = "neutral", onClick }) {
  const tones = { warning: C.gold, success: C.primaryContainer, info: "#1e3a8a", neutral: C.onSurfaceVariant };
  return (
    <Card className="p-4 cursor-pointer" onClick={onClick}>
      <Icon size={18} style={{ color: tones[tone] }} />
      <p className="text-2xl font-extrabold mt-2 heading">{value}</p>
      <p className="text-xs font-medium" style={{ color: C.onSurfaceVariant }}>{label}</p>
    </Card>
  );
}
