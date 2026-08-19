import React, { useState } from "react";
import { Search, Phone, Mail, MessageCircle, Eye, Droplet, Award, Calendar, ShieldCheck, MapPin, Briefcase, User, FileText, Home, Building, Printer, Shield } from "lucide-react";
import { Card, Badge, Btn, inputCls, inputStyle, Avatar, Empty, Modal, SectionTitle } from "../components/primitives";
import { C, BLOCKS, BADGE_CATALOG, BADGE_ICONS } from "../theme";
import { cleanPhone, fmtDate } from "../utils";

export default function Directory({ session = {}, db = {}, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [q, setQ] = useState("");
  const [block, setBlock] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);

  const isTopTier = session?.role === "admin" && (session?.post === "President" || session?.post === "General Secretary");
  const canManage = session?.role === "admin" && (session?.permissions?.canManageMembers || isTopTier);

  const active = (db?.users || []).filter(u => u.status === "active");
  const query = q.trim().toLowerCase();

  const filtered = active.filter(u => {
    const matchesBlock = block === "All" || u.block === block;
    const matchesSearch = !query ||
      (u.name || "").toLowerCase().includes(query) ||
      (u.nameBn || "").toLowerCase().includes(query) ||
      (u.unit || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query) ||
      (u.phone || "").toLowerCase().includes(query) ||
      (u.post || "").toLowerCase().includes(query) ||
      (u.memberClass || "").toLowerCase().includes(query);
    return matchesBlock && matchesSearch;
  });

  return (
    <div>
      <SectionTitle>{isBn ? "সদস্য ডিরেক্টরি" : "Member Directory"}</SectionTitle>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.outline }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={isBn ? "নাম, ইউনিট, মোবাইল নম্বর বা পদবী দিয়ে অনুসন্ধান…" : "Search by name, unit, phone or post…"}
            style={inputStyle()}
            className={inputCls + " pl-9"}
          />
        </div>
        <select
          value={block}
          onChange={e => setBlock(e.target.value)}
          style={inputStyle()}
          className={inputCls + " sm:w-44"}
        >
          <option value="All">{isBn ? "সকল ব্লক (All Blocks)" : "All blocks"}</option>
          {BLOCKS.map(b => <option key={b} value={b}>{isBn ? `ব্লক ${b}` : `Block ${b}`}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between mb-3 text-xs" style={{ color: C.outline }}>
        <span>{filtered.length} {isBn ? "জন সক্রিয় সদস্য তালিকাভুক্ত" : "active residents listed"}</span>
        {block !== "All" && <span className="font-semibold">{isBn ? `ব্লক ${block}` : `Block ${block}`}</span>}
      </div>

      {/* Members Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map(u => {
          const phoneFormatted = cleanPhone(u.phone);
          return (
            <Card
              key={u.id}
              className="p-4 flex flex-col justify-between gap-3 hover:shadow-md transition-shadow border"
              style={{ borderColor: C.outlineVariant }}
            >
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <Avatar name={u.name} photoUrl={u.photoUrl} size={50} />
                  {u.bloodGroup && (
                    <span
                      className="absolute -bottom-1 -right-1 text-[9px] font-extrabold px-1 rounded-full text-white bg-rose-600 shadow-sm"
                      title={isBn ? `রক্তের গ্রুপ: ${u.bloodGroup}` : `Blood Group: ${u.bloodGroup}`}
                    >
                      {u.bloodGroup}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-extrabold text-sm truncate text-gray-900">{u.name}</p>
                    {u.post ? (
                      <Badge tone="success">{u.post}</Badge>
                    ) : (
                      <Badge tone="neutral">{u.memberClass || "Resident"}</Badge>
                    )}
                  </div>
                  {u.nameBn && (
                    <p className="text-[11px] font-medium text-emerald-800 truncate">{u.nameBn}</p>
                  )}

                  <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
                    {isBn ? "ব্লক" : "Block"} <span className="font-semibold">{u.block}</span> · {isBn ? "ইউনিট" : "Unit"} <span className="font-semibold">{u.unit}</span>
                  </p>

                  <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                    <Phone size={12} style={{ color: C.primary }} className="shrink-0" />
                    <span className="font-semibold select-all text-gray-800">{u.phone || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: C.outlineVariant }}>
                {phoneFormatted ? (
                  <>
                    <a
                      href={`tel:${phoneFormatted}`}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors"
                      style={{ backgroundColor: C.primaryContainer, color: "#fff" }}
                      title={isBn ? "কল করুন" : "Call Phone"}
                    >
                      <Phone size={13} /> {isBn ? "কল" : "Call"}
                    </a>
                    <a
                      href={`https://wa.me/${phoneFormatted}?text=${encodeURIComponent(isBn ? `আসসালামু আলাইকুম ${u.name}, কুঞ্জছায়া ক্লাব থেকে যোগাযোগ করছি।` : `Hello ${u.name}, reaching out from Kunjachaya Club.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                      title={isBn ? "হোয়াটসঅ্যাপ বার্তা পাঠান" : "WhatsApp Chat"}
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  </>
                ) : (
                  <a
                    href={`mailto:${u.email}?subject=${encodeURIComponent("Kunjachaya Club Message")}`}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors"
                    style={{ backgroundColor: C.surfaceContainer, color: C.onSurface }}
                  >
                    <Mail size={13} /> {isBn ? "ইমেইল" : "Email"}
                  </a>
                )}

                <button
                  onClick={() => setSelectedUser(u)}
                  className="p-1.5 rounded-xl border hover:bg-black/5 text-xs font-semibold shrink-0"
                  style={{ borderColor: C.outlineVariant, color: C.onSurfaceVariant }}
                  title={isBn ? "প্রোফাইল দেখুন" : "View Profile"}
                >
                  <Eye size={15} />
                </button>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full">
            <Empty
              icon={Search}
              title={isBn ? "কোনো সদস্য পাওয়া যায়নি" : "No members found"}
              subtitle={isBn ? "ভিন্ন নাম, ইউনিট, মোবাইল নম্বর বা ব্লক ফিল্টার দিয়ে চেষ্টা করুন।" : "Try searching with a different name, unit, phone or block."}
            />
          </div>
        )}
      </div>

      {/* Member Details Profile View Modal */}
      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={canManage ? (isBn ? "সদস্য পূর্ণ প্রোফাইল (Official View)" : "Member Full Profile") : (isBn ? "সদস্য প্রোফাইল (Basic View)" : "Member Profile")}
        width="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-4 py-1 max-h-[80vh] overflow-y-auto pr-1">
            {/* Header Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
              <Avatar name={selectedUser.name} photoUrl={selectedUser.photoUrl} size={60} className="border-2 border-white shadow-md" />
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-base heading leading-tight text-gray-900">{selectedUser.name}</h3>
                {selectedUser.nameBn && (
                  <p className="text-xs font-medium text-emerald-800">{selectedUser.nameBn}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  {selectedUser.post ? (
                    <Badge tone="success">{selectedUser.post}</Badge>
                  ) : (
                    <Badge tone="neutral">{selectedUser.memberClass || "General"}</Badge>
                  )}
                  {selectedUser.standingCouncil && (
                    <Badge tone="info">{isBn ? "স্থায়ী পরিষদ" : "Council"}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Profile Details (Visible to all) */}
            <div className="p-3.5 rounded-2xl space-y-2 text-xs border" style={{ backgroundColor: C.surface, borderColor: C.outlineVariant }}>
              <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
                <span className="flex items-center gap-1.5 opacity-70"><Phone size={13} /> {isBn ? "মোবাইল ফোন:" : "Mobile Phone:"}</span>
                <span className="font-bold select-all text-gray-900">{selectedUser.phone || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
                <span className="flex items-center gap-1.5 opacity-70"><Mail size={13} /> {isBn ? "ইমেইল অ্যাড্রেস:" : "Email Address:"}</span>
                <span className="font-semibold select-all text-gray-900">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
                <span className="flex items-center gap-1.5 opacity-70"><MapPin size={13} /> {isBn ? "বাসা ও ইউনিট:" : "Block & Unit:"}</span>
                <span className="font-semibold">{isBn ? `ব্লক ${selectedUser.block}, ইউনিট ${selectedUser.unit}` : `Block ${selectedUser.block}, Unit ${selectedUser.unit}`}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
                <span className="flex items-center gap-1.5 opacity-70"><Droplet size={13} /> {isBn ? "রক্তের গ্রুপ:" : "Blood Group:"}</span>
                <div className="flex items-center gap-1.5">
                  {selectedUser.bloodGroup ? (
                    <span className="font-bold px-2 py-0.5 rounded-full text-white bg-rose-600">{selectedUser.bloodGroup}</span>
                  ) : (
                    <span className="text-gray-400">{isBn ? "নির্ধারিত নয়" : "Not set"}</span>
                  )}
                  {selectedUser.donor && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {isBn ? "রক্তদাতা" : "Donor"}
                    </span>
                  )}
                </div>
              </div>
              {selectedUser.profession && (
                <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
                  <span className="flex items-center gap-1.5 opacity-70"><Briefcase size={13} /> {isBn ? "পেশা:" : "Profession:"}</span>
                  <span className="font-semibold">{selectedUser.profession}</span>
                </div>
              )}
              {selectedUser.joinedDate && (
                <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
                  <span className="flex items-center gap-1.5 opacity-70"><Calendar size={13} /> {isBn ? "যোগদানের তারিখ:" : "Joined Date:"}</span>
                  <span className="font-semibold">{fmtDate(selectedUser.joinedDate)}</span>
                </div>
              )}
              {selectedUser.earnedBadges && selectedUser.earnedBadges.length > 0 && (
                <div className="py-1">
                  <span className="flex items-center gap-1.5 opacity-70 mb-1"><Award size={13} /> {isBn ? "অর্জিত ব্যাজ:" : "Earned Badges:"}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedUser.earnedBadges.map(b => (
                      <Badge key={b} tone="warning">{b === "b_founder" ? (isBn ? "⭐ প্রতিষ্ঠাতা সদস্য" : "⭐ Founder") : b}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedUser.bio && (
                <div className="pt-2">
                  <p className="font-bold text-[11px] mb-1 opacity-75">{isBn ? "সংক্ষিপ্ত বিবরণ:" : "Bio:"}</p>
                  <p className="p-2 rounded-xl bg-gray-50 text-gray-700 italic text-[11px] leading-relaxed border">{selectedUser.bio}</p>
                </div>
              )}
            </div>

            {/* FULL FORM-2 VERIFICATION SECTION (Exclusively for Top-Tier & Authorized Committee) */}
            {canManage && (
              <div className="p-3.5 rounded-2xl space-y-3 text-xs border bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Shield size={14} style={{ color: C.primary }} />
                    {isBn ? "ফরম-২ অফিশিয়াল রেকর্ড (অনুমোদিত নেতৃত্ব দর্শন)" : "Form-2 Official Record (Admin View)"}
                  </h4>
                  <Badge tone="success">{isBn ? "যাচাইকৃত" : "Verified"}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-500 block">{isBn ? "পরিচয়পত্র (ID Type & No):" : "ID Type & No:"}</span>
                    <span className="font-bold select-all text-gray-900">{selectedUser.idType || "NID"}: {selectedUser.idNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">{isBn ? "জন্ম তারিখ ও লিঙ্গ:" : "DOB & Gender:"}</span>
                    <span className="font-semibold text-gray-800">{selectedUser.dob || "—"} ({selectedUser.gender || "male"})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">{isBn ? "পিতা / মাতার নাম:" : "Father / Mother:"}</span>
                    <span className="font-semibold text-gray-800">{selectedUser.fatherName || "—"} / {selectedUser.motherName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">{isBn ? "শিক্ষা / ধর্ম:" : "Education / Religion:"}</span>
                    <span className="font-semibold text-gray-800">{selectedUser.education || "—"} · {selectedUser.religion || "Islam"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-gray-500 block">{isBn ? "কুঞ্জছায়া পূর্ণ ঠিকানা:" : "Full Address:"}</span>
                    <span className="font-semibold text-gray-800">{selectedUser.area || "কুঞ্জছায়া আবাসিক এলাকা"}, {selectedUser.thana || "বায়েজীদ বোস্তামী"}, {selectedUser.district || "চট্টগ্রাম"}</span>
                  </div>
                </div>

                <div className="pt-1 flex gap-2">
                  <Btn full size="sm" variant="outline" icon={Printer} onClick={() => window.print()}>
                    {isBn ? "প্রিন্ট ফরম-২" : "Print Form 2 Document"}
                  </Btn>
                  {(selectedUser.permissions?.formScanUrl || selectedUser.formScanUrl) && (
                    <a
                      href={selectedUser.permissions?.formScanUrl || selectedUser.formScanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {isBn ? "হার্ডকপি স্ক্যান" : "View Scan"}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Direct Contact Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {selectedUser.phone ? (
                <>
                  <a
                    href={`tel:${cleanPhone(selectedUser.phone)}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-colors"
                    style={{ backgroundColor: C.primary }}
                  >
                    <Phone size={15} /> {isBn ? "সরাসরি কল" : "Call Phone"}
                  </a>
                  <a
                    href={`https://wa.me/${cleanPhone(selectedUser.phone)}?text=${encodeURIComponent(isBn ? `আসসালামু আলাইকুম ${selectedUser.name}, কুঞ্জছায়া ক্লাব থেকে যোগাযোগ করছি।` : `Hello ${selectedUser.name}, contacting you from Kunjachaya Club.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                </>
              ) : (
                <a
                  href={`mailto:${selectedUser.email}?subject=${encodeURIComponent("Kunjachaya Club Official Communication")}`}
                  className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors"
                >
                  <Mail size={15} /> {isBn ? "ইমেইল পাঠান" : "Send Email"}
                </a>
              )}
            </div>

            <Btn full variant="outline" onClick={() => setSelectedUser(null)}>
              {isBn ? "বন্ধ করুন" : "Close"}
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
