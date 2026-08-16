import React, { useState } from "react";
import { Shield, FileText } from "lucide-react";
import { Card, SectionTitle } from "../components/primitives";
import { C } from "../theme";
import { hasStoredConsent, storeConsent, loadAnalytics } from "../lib/analytics";

function Section({ title, children }) {
  return (
    <Card className="p-4 mb-3">
      <h3 className="font-bold text-sm mb-1.5">{title}</h3>
      <p className="text-sm" style={{ color: C.onSurfaceVariant }}>{children}</p>
    </Card>
  );
}

export default function Legal({ lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [consent, setConsent] = useState(hasStoredConsent());

  const toggle = () => {
    const next = !consent;
    setConsent(next);
    storeConsent(next);
    if (next) loadAnalytics();
    else window.location.reload();
  };

  return (
    <div className="max-w-2xl">
      <SectionTitle>{isBn ? "গোপনীয়তা নীতি ও ব্যবহারের শর্তাবলী" : "Privacy & Terms"}</SectionTitle>

      <Card className="p-4 mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-sm">{isBn ? "অ্যানালিটিক্স ট্র্যাকিং সম্মতি" : "Analytics consent"}</p>
          <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
            {isBn ? `বর্তমান অবস্থা: ${consent ? "অনুমোদিত" : "বাতিলকৃত"}` : `Currently: ${consent ? "Accepted" : "Declined"}`}
          </p>
        </div>
        <button
          onClick={toggle}
          className="px-4 py-2 rounded-full text-xs font-bold transition-all"
          style={{ backgroundColor: consent ? C.errorContainer : C.primary, color: consent ? C.onErrorContainer : "#fff" }}
        >
          {consent ? (isBn ? "সম্মতি প্রত্যাহার করুন" : "Revoke consent") : (isBn ? "অ্যানালিটিক্স গ্রহণ করুন" : "Accept analytics")}
        </button>
      </Card>

      <div className="flex items-center gap-2 mb-3">
        <Shield size={16} style={{ color: C.primary }} />
        <h3 className="font-bold text-sm">{isBn ? "গোপনীয়তা নীতিমালা (Privacy Policy)" : "Privacy Policy"}</h3>
      </div>
      <Section title={isBn ? "আমরা কী তথ্য সংগ্রহ করি" : "What we collect"}>
        {isBn ? "কুঞ্জছায়া ক্লাব অ্যাপে নিবন্ধনকারী সদস্যদের নাম, ফোন নম্বর, ফ্ল্যাট/ইউনিট নম্বর, রক্তের গ্রুপ, চাঁদা পরিশোধ রেকর্ড এবং নির্বাচন ভোট সংরক্ষিত থাকে।" : "Member name, phone, block/unit, blood group, dues history, and voting records (anonymized)."}
      </Section>
      <Section title={isBn ? "তথ্যের ব্যবহার ও সুরক্ষা" : "How we use it"}>
        {isBn ? "শুধুমাত্র ক্লাবের অভ্যন্তরীণ পরিচালনা, নোটিশ প্রদান, জরুরি হটলাইন এবং গণতান্ত্রিক ভোটাধিকার পরিচালনার উদ্দেশ্যে তথ্য ব্যবহৃত হয়।" : "Used strictly for club operations, notice delivery, emergency contacts, and democratic election administration."}
      </Section>
      <Section title={isBn ? "কার কার অ্যাক্সেস রয়েছে" : "Who can see it"}>
        {isBn ? "সক্রিয় সদস্যরা সাধারণ ডিরেক্টরি দেখতে পারেন; কার্যনির্বাহী পরিষদ ও কোষাধ্যক্ষ আর্থিক হিসাব ও চাঁদার বিস্তারিত তদারকি করেন।" : "Active members can view the directory; Executive Committee officers manage financial and moderation records."}
      </Section>

      <div className="flex items-center gap-2 mb-3 mt-6">
        <FileText size={16} style={{ color: C.primary }} />
        <h3 className="font-bold text-sm">{isBn ? "ব্যবহারের নিয়ম ও শর্তাবলী" : "Terms of Use"}</h3>
      </div>
      <Section title={isBn ? "সদস্যতার যোগ্যতা" : "Eligibility"}>
        {isBn ? "সংবিধানের ধারা-৬ ও ধারা-৭ অনুসারে কুঞ্জছায়া আবাসিক এলাকার বৈধ বাসিন্দা ও অনুমোদিত সদস্যগণ এই প্ল্যাটফর্ম ব্যবহার করতে পারবেন।" : "Eligible residents of Kunjachhaya per Article 6 & 7 of the ratified constitution."}
      </Section>
      <Section title={isBn ? "দায়িত্বশীল আচরণ ও শৃঙ্খলা" : "Acceptable use"}>
        {isBn ? "ফোরাম ও নোটিশ বোর্ডে অশালীন বক্তব্য, রাজনৈতিক প্রচারণা বা বিশৃঙ্খলা সৃষ্টিকারী যেকোনো আচরণ সদস্যপদ বাতিলের কারণ হতে পারে (ধারা-৮)।" : "Respectful community conduct across notices, chat, and elections adhering to constitutional guidelines."}
      </Section>

      <p className="text-[11px] mt-4 text-center" style={{ color: C.outline }}>
        {isBn ? "কুঞ্জছায়া ক্লাব চট্টগ্রামের অনুমোদিত সংবিধান ও আইনানুগ কাঠামোর আওতাধীন।" : "Governed by the ratified constitution of Kunjachhaya Club, Chattogram."}
      </p>
    </div>
  );
}
