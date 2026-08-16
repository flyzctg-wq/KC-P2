import React, { useState } from "react";
import { Check, CheckCircle2, Phone, Eye, EyeOff, Send, Globe, KeyRound, Loader2 } from "lucide-react";
import { Btn, Field, inputCls, inputStyle, Modal } from "../components/primitives";
import { C, BLOCKS, LOGO_MARK, LOGO_FULL } from "../theme";

export default function AuthScreen({ db, lang, setLang, t, authMode, setAuthMode, login, register }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPw, setShowPw] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [reg, setReg] = useState({ name: "", email: "", phone: "", block: "A", unit: "" });
  const [forgot, setForgot] = useState(false); const [resetEmail, setResetEmail] = useState(""); const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      await login(email, password);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-1/2 relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[280px] lg:min-h-screen" style={{ backgroundColor: C.primary }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, #fff 0, transparent 45%), radial-gradient(circle at 80% 70%, #fff 0, transparent 40%)"
        }} />
        <div className="relative flex items-center gap-2">
          <div style={{ backgroundColor: "rgba(255,255,255,0.14)" }} className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5"><img src={LOGO_MARK} alt="Kunjachaya Club" className="w-full h-full object-contain" /></div>
          <span className="font-bold text-white text-lg heading">Kunjachaya Club</span>
        </div>
        <div className="relative hidden lg:block">
          <img src={LOGO_FULL} alt="Kunjachaya Club" className="w-28 mb-6 opacity-95" />
          <h1 className="text-white text-4xl xl:text-5xl font-extrabold leading-tight heading">Community,<br />governed<br />together.</h1>
          <p className="text-white/70 mt-4 max-w-sm text-sm">Directory, notices, dues, elections and support — one place for every resident and every committee.</p>
        </div>
        <p className="relative text-white/50 text-xs hidden lg:block">Est. constitutional community platform · Articles 10–31</p>
      </div>

      <div className="lg:w-1/2 flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex justify-end mb-4">
            <button onClick={() => setLang(l => l === "en" ? "bn" : "en")} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ color: C.onSurfaceVariant, backgroundColor: C.surfaceContainer }}>
              <Globe size={13} /> {lang === "en" ? "বাংলা" : "English"}
            </button>
          </div>
          <div className="flex rounded-full p-1 mb-7" style={{ backgroundColor: C.surfaceContainer }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setAuthMode(m)} className="flex-1 py-2 rounded-full text-sm font-bold transition-colors"
                style={m === authMode ? { backgroundColor: C.primary, color: "#fff" } : { color: C.onSurfaceVariant }}>
                {m === "login" ? t.login : t.register}
              </button>
            ))}
          </div>

          {authMode === "login" ? (
            <div>
              <h2 className="text-2xl font-extrabold mb-1 heading">Welcome back</h2>
              <p className="text-sm mb-6" style={{ color: C.onSurfaceVariant }}>Log in to your resident or committee account.</p>
              <Field label="Email"><input style={inputStyle()} className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@kunjachaya.club" onKeyDown={e => e.key === "Enter" && handleLogin()} /></Field>
              <Field label="Password">
                <div className="relative">
                  <input style={inputStyle()} className={inputCls + " pr-10"} type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.outline }}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </Field>
              <button type="button" onClick={() => { setForgot(true); setResetSent(false); setResetEmail(email); }} className="text-xs font-semibold mb-4 block" style={{ color: C.primary }}>Forgot password?</button>
              <Btn full onClick={handleLogin} disabled={loggingIn}>
                {loggingIn ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : "Log in"}
              </Btn>
              <div className="mt-5 p-3 rounded-xl text-xs leading-relaxed" style={{ backgroundColor: C.surfaceContainerLow, color: C.onSurfaceVariant }}>
                <p className="font-semibold mb-1" style={{ color: C.onSurface }}>New here?</p>
                Create an account above, or ask a committee member for an invite. Demo credentials are documented in the project README for local testing only — never shown in a deployed build.
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-extrabold mb-1 heading">Join the club</h2>
              <p className="text-sm mb-6" style={{ color: C.onSurfaceVariant }}>New accounts require committee approval (Article 10).</p>
              <Field label="Full name"><input style={inputStyle()} className={inputCls} value={reg.name} onChange={e => setReg({ ...reg, name: e.target.value })} /></Field>
              <Field label="Email"><input style={inputStyle()} className={inputCls} value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })} /></Field>
              <Field label="Password"><input style={inputStyle()} className={inputCls} type="password" value={reg.password} onChange={e => setReg({ ...reg, password: e.target.value })} /></Field>
              <Field label="Phone"><input style={inputStyle()} className={inputCls} value={reg.phone} onChange={e => setReg({ ...reg, phone: e.target.value })} placeholder="+880 1XXX-XXXXXX" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Block"><select style={inputStyle()} className={inputCls} value={reg.block} onChange={e => setReg({ ...reg, block: e.target.value })}>{BLOCKS.map(b => <option key={b}>{b}</option>)}</select></Field>
                <Field label="Unit no."><input style={inputStyle()} className={inputCls} value={reg.unit} onChange={e => setReg({ ...reg, unit: e.target.value })} placeholder={`${reg.block}-01`} /></Field>
              </div>
              <Btn full onClick={() => register(reg)} disabled={!reg.name || !reg.email || !reg.password}>Create account</Btn>
            </div>
          )}
        </div>
      </div>
      <Modal open={forgot} onClose={() => setForgot(false)} title="Reset password">
        {resetSent ? (
          <div className="text-center py-4">
            <CheckCircle2 size={32} style={{ color: C.primary }} className="mx-auto mb-3" />
            <p className="text-sm font-semibold mb-1">Check your email</p>
            <p className="text-xs" style={{ color: C.onSurfaceVariant }}>If an account exists for {resetEmail}, a reset link has been sent.</p>
          </div>
        ) : (
          <div>
            <p className="text-xs mb-4" style={{ color: C.onSurfaceVariant }}>Enter your account email and we'll send a reset link.</p>
            <Field label="Email"><input style={inputStyle()} className={inputCls} value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@kunjachaya.club" /></Field>
            <Btn full icon={KeyRound} onClick={() => setResetSent(true)} disabled={!resetEmail.trim()}>Send reset link</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
