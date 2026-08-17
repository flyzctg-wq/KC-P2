import React, { useState, useEffect, useCallback } from "react";
import { loadDB, saveDB, subscribeDB } from "./lib/store";
import { syncChanges } from "./lib/write";
import { signUpResident, signInWithPassword, signOutUser } from "./lib/authBridge";
import { supabase } from "./lib/supabase";
import { Loader2 } from "lucide-react";
import { C, STR, LOGO_MARK } from "./theme";
import { uid, nowISO } from "./utils";
import { Toasts } from "./components/primitives";
import ConsentBanner from "./components/ConsentBanner";
import { hasStoredConsent, loadAnalytics, trackEvent } from "./lib/analytics";
import AuthScreen from "./components/AuthScreen";
import Shell from "./components/Shell";
import Router from "./Router";
import SplashIntro from "./components/SplashIntro";

export default function App() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null); // current user object
  const [view, setView] = useState("home");
  const [lang, setLang] = useState("en");
  const [navOpen, setNavOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [authMode, setAuthMode] = useState("login");
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem("kc_splash_done"));
  const t = STR[lang];

  const toast = useCallback((msg, type = "success") => {
    const id = uid("t");
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 3200);
  }, []);

  useEffect(() => {
    // inject fonts
    const l1 = document.createElement("link"); l1.rel = "stylesheet";
    l1.href = "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(l1);

    // If consent was already granted in a previous session, resume
    // analytics silently — don't show the banner again every visit.
    if (hasStoredConsent()) loadAnalytics();

    // Show the login screen immediately with an empty db — RLS means
    // unauthenticated fetches return empty arrays anyway. Real data
    // loads after login via subscribeDB / persist.
    const emptyDb = {
      users: [], notices: [], dues: [], elections: [], votes: [],
      tickets: [], activity: [], emergencyContacts: [], agmEvents: [],
      amendments: [], budgetItems: [], chatMessages: [], handoverChecklist: [],
      events: [], inductions: [],
    };
    setDb(emptyDb);
    setLoading(false);

    let unsub = null;
    (async () => {
      try {
        // Auto-restore active Supabase auth session if present in localStorage
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession?.user) {
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sbSession.user.id)
            .single();
          if (profileRow && profileRow.status === "active") {
            const form = profileRow.permissions?.formDetails || {};
            const u = {
              id: profileRow.id, name: profileRow.name, email: profileRow.email,
              phone: profileRow.phone, block: profileRow.block, unit: profileRow.unit,
              memberClass: profileRow.member_class, role: profileRow.role,
              post: profileRow.post, status: profileRow.status,
              permissions: profileRow.permissions || {},
              standingCouncil: profileRow.standing_council,
              bloodGroup: profileRow.blood_group, donor: profileRow.donor,
              earnedBadges: profileRow.earned_badges || [],
              joinedDate: profileRow.joined_date,
              nameBn: form.nameBn || "",
              dob: form.dob || "",
              gender: form.gender || "male",
              profession: form.profession || "",
              education: form.education || "",
              religion: form.religion || "Islam",
              houseNo: form.houseNo || "",
              roadNo: form.roadNo || "",
              area: form.area || "কুঞ্জছায়া আবাসিক এলাকা",
              floorNo: form.floorNo || "",
              holdingNo: form.holdingNo || "",
              wardNo: form.wardNo || "২নং জালালাবাদ",
              thana: form.thana || "বায়েজীদ বোস্তামী",
              district: form.district || "চট্টগ্রাম",
              altPhone: form.altPhone || "",
              fatherName: form.fatherName || "",
              motherName: form.motherName || "",
              spouseName: form.spouseName || "",
              idType: form.idType || "NID",
              idNumber: form.idNumber || "",
              photoUrl: form.photoUrl || "",
              bio: form.bio || "",
              pledgeAccepted: form.pledgeAccepted ?? true,
            };
            setSession(u);
            setView(prev => prev === "home" ? (u.role === "admin" ? "a-dashboard" : "r-home") : prev);
          }
        }
      } catch (e) {
        console.warn("Session restore skipped:", e);
      }

      const d = await loadDB();
      setDb(d);
      unsub = subscribeDB((fresh) => setDb(fresh));
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  const persist = useCallback((updater) => {
    setDb(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      syncChanges(prev, next).catch(err => {
        console.error("Sync failed:", err);
        toast("Some changes couldn't be saved — check your connection.", "error");
      });
      return next;
    });
  }, [toast]);

  const logActivity = (dbObj, actor, action) => ({
    ...dbObj, activity: [...(dbObj.activity || []), { id: uid("act"), actor, action, date: nowISO() }],
  });

  // Credentials are verified by Supabase Auth — never compared as
  // plaintext against a stored password. Profile fields the rest of the
  // app reads (role, permissions, memberClass, etc.) live in the
  // `profiles` table, keyed by the Supabase Auth user id.
  const login = async (email, password) => {
    try {
      const uidMatch = await signInWithPassword(email, password);
      // Fetch this user's own profile directly — RLS always allows
      // auth.uid() = id so this works even before the full db loads.
      const { data: profileRow, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uidMatch)
        .single();
      if (profileErr || !profileRow) {
        toast("No profile found for this account. Contact an admin.", "error");
        return;
      }
      const form = profileRow.permissions?.formDetails || {};
      const u = {
        id: profileRow.id, name: profileRow.name, email: profileRow.email,
        phone: profileRow.phone, block: profileRow.block, unit: profileRow.unit,
        memberClass: profileRow.member_class, role: profileRow.role,
        post: profileRow.post, status: profileRow.status,
        permissions: profileRow.permissions || {},
        standingCouncil: profileRow.standing_council,
        bloodGroup: profileRow.blood_group, donor: profileRow.donor,
        earnedBadges: profileRow.earned_badges || [],
        joinedDate: profileRow.joined_date,
        nameBn: form.nameBn || "",
        dob: form.dob || "",
        gender: form.gender || "male",
        profession: form.profession || "",
        education: form.education || "",
        religion: form.religion || "Islam",
        houseNo: form.houseNo || "",
        roadNo: form.roadNo || "",
        area: form.area || "কুঞ্জছায়া আবাসিক এলাকা",
        floorNo: form.floorNo || "",
        holdingNo: form.holdingNo || "",
        wardNo: form.wardNo || "২নং জালালাবাদ",
        thana: form.thana || "বায়েজীদ বোস্তামী",
        district: form.district || "চট্টগ্রাম",
        altPhone: form.altPhone || "",
        fatherName: form.fatherName || "",
        motherName: form.motherName || "",
        spouseName: form.spouseName || "",
        idType: form.idType || "NID",
        idNumber: form.idNumber || "",
        photoUrl: form.photoUrl || "",
        bio: form.bio || "",
        pledgeAccepted: form.pledgeAccepted ?? true,
      };
      if (u.status === "pending") {
        toast(lang === "bn" ? "আপনার অ্যাকাউন্টটি অপেক্ষমাণ রয়েছে। সভাপতি / সাধারণ সম্পাদকের অনুমোদনের পর লগইন করতে পারবেন।" : "Your account is pending admin approval (Article 10).", "error");
        return;
      }
      // Load full DB in background after profile is confirmed
      loadDB().then(d => setDb(d));
      setSession(u); setView(u.role === "admin" ? "a-dashboard" : "r-home");
      toast(lang === "bn" ? `স্বাগতম, ${u.name.split(" ")[0]}!` : `Welcome back, ${u.name.split(" ")[0]}!`);
      trackEvent("login", { role: u.role });
    } catch (e) {
      toast(e.message || (lang === "bn" ? "ভুল ইমেইল বা পাসওয়ার্ড।" : "Invalid email or password."), "error");
    }
  };

  const register = async (fields) => {
    const emailNorm = fields.email?.trim().toLowerCase();
    const existingUser = db?.users?.find(u => u.email?.toLowerCase() === emailNorm);

    try {
      const newUser = await signUpResident({
        ...fields,
        name: fields.name?.trim() || existingUser?.name || "",
        phone: fields.phone?.trim() || existingUser?.phone || "",
        block: fields.block || existingUser?.block || "A",
        unit: fields.unit?.trim() || existingUser?.unit || "",
        status: existingUser?.status || "pending",
        memberClass: existingUser?.memberClass || "New",
        invitedBy: existingUser?.invitedBy || null,
        inviteCode: existingUser?.inviteCode || null,
      });

      setDb(prev => ({
        ...prev,
        users: [
          ...(prev.users || []).filter(u => u.email?.toLowerCase() !== emailNorm && u.id !== existingUser?.id),
          newUser
        ]
      }));

      if (newUser.status === "active") {
        toast(
          lang === "bn"
            ? "আমন্ত্রিত সক্রিয় সদস্যপদ সম্পন্ন হয়েছে! অনুগ্রহ করে এখন লগইন করুন।"
            : "Official invitation setup complete! You have active membership. Please log in."
        );
      } else {
        toast(
          lang === "bn"
            ? "নিবন্ধন সম্পন্ন হয়েছে! সভাপতি / সাধারণ সম্পাদকের অনুমোদনের পর লগইন করতে পারবেন।"
            : "Registration submitted! Await admin approval before logging in."
        );
      }
      setAuthMode("login");
    } catch (e) {
      const msg = e.message || "";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("unique constraint")) {
        toast(
          lang === "bn"
            ? "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে পাসওয়ার্ড দিয়ে লগইন করুন।"
            : "An account with this email is already registered. Please log in with your password.",
          "error"
        );
        setAuthMode("login");
      } else {
        toast(msg || (lang === "bn" ? "অ্যাকাউন্ট তৈরি করা যায়নি।" : "Could not create account."), "error");
      }
    }
  };

  const logout = () => { signOutUser(); setSession(null); setView("home"); toast("Logged out."); };

  if (loading || !db) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{
        backgroundColor: C.primary, fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden"
      }}>
        <style>{`
          @keyframes kc-float-up {
            0%   { transform: translateY(0) scale(1);   opacity: 0.18; }
            50%  { transform: translateY(-40vh) scale(1.15); opacity: 0.10; }
            100% { transform: translateY(-80vh) scale(0.8);  opacity: 0; }
          }
          @keyframes kc-pulse-ring {
            0%   { transform: scale(1);   opacity: 0.5; }
            70%  { transform: scale(1.45); opacity: 0; }
            100% { transform: scale(1.45); opacity: 0; }
          }
          @keyframes kc-logo-breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
          }
          .kc-splash-orb {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.13);
            animation: kc-float-up linear infinite;
            pointer-events: none;
          }
          .kc-pulse-ring {
            position: absolute;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.35);
            animation: kc-pulse-ring 2s ease-out infinite;
          }
          .kc-logo-wrap {
            animation: kc-logo-breathe 2.8s ease-in-out infinite;
          }
        `}</style>

        {/* Floating orb particles */}
        {[
          { size: 80, left: "8%",  delay: "0s",    dur: "7s"  },
          { size: 50, left: "22%", delay: "1.2s",  dur: "9s"  },
          { size: 110,left: "40%", delay: "0.5s",  dur: "11s" },
          { size: 60, left: "58%", delay: "2s",    dur: "8s"  },
          { size: 90, left: "75%", delay: "0.8s",  dur: "10s" },
          { size: 45, left: "88%", delay: "1.7s",  dur: "6.5s"},
        ].map((o, i) => (
          <div key={i} className="kc-splash-orb" style={{
            width: o.size, height: o.size, left: o.left, bottom: "-10%",
            animationDelay: o.delay, animationDuration: o.dur,
          }} />
        ))}

        {/* Pulse rings behind logo */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="kc-pulse-ring" style={{ width: 100, height: 100, animationDelay: "0s" }} />
          <div className="kc-pulse-ring" style={{ width: 100, height: 100, animationDelay: "0.7s" }} />
          <div className="kc-logo-wrap" style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            width: 80, height: 80, borderRadius: 20,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 14,
            position: "relative", zIndex: 1,
          }}>
            <img src={LOGO_MARK} alt="Kunjachaya Club" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        </div>

        <Loader2 className="animate-spin" color="#fff" size={22} style={{ position: "relative", zIndex: 1 }} />
        <p style={{ color: "#fff", position: "relative", zIndex: 1 }} className="text-sm font-medium opacity-80">
          Loading Kunjachaya Club…
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: C.background, color: C.onSurface, position: "relative" }} className="min-h-screen">
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform: translateY(-6px);} to {opacity:1; transform:none;} }
        * { font-family: 'Inter', sans-serif; }
        .heading { font-family: 'Hanken Grotesk', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height:6px; }
        ::-webkit-scrollbar-thumb { background: ${C.outlineVariant}; border-radius: 10px; }

        @keyframes kc-bg-drift {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(18px, -22px) scale(1.08); }
          66%  { transform: translate(-12px, 14px) scale(0.96); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes kc-bg-drift2 {
          0%   { transform: translate(0, 0) scale(1); }
          40%  { transform: translate(-20px, 18px) scale(1.05); }
          75%  { transform: translate(10px, -10px) scale(0.98); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .kc-bg-blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(70px);
        }
      `}</style>

      {/* Subtle ambient background blobs — fixed position so they don't scroll */}
      <div className="kc-bg-blob" style={{
        width: 340, height: 340,
        top: -80, left: -80,
        background: `radial-gradient(circle, ${C.primary}22 0%, transparent 70%)`,
        animation: "kc-bg-drift 18s ease-in-out infinite",
      }} />
      <div className="kc-bg-blob" style={{
        width: 280, height: 280,
        bottom: -60, right: -60,
        background: `radial-gradient(circle, ${C.secondary || "#2e7d32"}1a 0%, transparent 70%)`,
        animation: "kc-bg-drift2 22s ease-in-out infinite",
      }} />
      <div className="kc-bg-blob" style={{
        width: 200, height: 200,
        top: "40%", right: "5%",
        background: `radial-gradient(circle, ${C.primary}15 0%, transparent 70%)`,
        animation: "kc-bg-drift 28s ease-in-out infinite reverse",
      }} />

      <Toasts toasts={toasts} />
      <ConsentBanner />
      {showSplash && (
        <SplashIntro
          lang={lang}
          onFinish={() => {
            sessionStorage.setItem("kc_splash_done", "1");
            setShowSplash(false);
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        {!session ? (
          <AuthScreen db={db} lang={lang} setLang={setLang} t={t} authMode={authMode} setAuthMode={setAuthMode} login={login} register={register} />
        ) : (
          <Shell session={session} view={view} setView={setView} logout={logout} lang={lang} setLang={setLang} t={t}
            navOpen={navOpen} setNavOpen={setNavOpen}>
            <Router session={session} db={db} persist={persist} view={view} setView={setView} toast={toast} logActivity={logActivity} setSession={setSession} lang={lang} t={t} />
          </Shell>
        )}
      </div>
    </div>
  );
}

