import React, { useState } from "react";
import { Check, XCircle, Shield, Edit3, UserCheck, UserPlus, Send, Copy, MessageCircle, Phone, Mail, CheckCircle2, UserX, AlertTriangle, Trash2, Loader2, Eye, Printer, FileText, MapPin, Droplet, Award, Calendar, Briefcase, GraduationCap, Home, Camera, Building, ExternalLink, Heart } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Empty, Modal, SectionTitle } from "../../components/primitives";
import { C, BLOCKS, MEMBER_CLASSES, PERMISSION_KEYS, COMMITTEE_POSTS, POST_DEFAULT_PERMISSIONS } from "../../theme";
import { uid, nowISO, getAppBaseUrl, cleanPhone, fmtDate } from "../../utils";
import { supabase } from "../../lib/supabase";

export default function AdminMembers({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [tab, setTab] = useState("active");
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [kickOutTarget, setKickOutTarget] = useState(null);

  const isTopTier = session?.role === "admin" && (session?.post === "President" || session?.post === "General Secretary");
  const canManage = session?.role === "admin" && (session?.permissions?.canManageMembers || isTopTier);
  const pending = (db?.users || []).filter(u => u.status === "pending");
  const activeUsers = (db?.users || []).filter(u => u.status === "active");

  const isTopTierPost = (u) => u?.post === "President" || u?.post === "General Secretary";

  const canKickOutUser = (targetUser) => {
    if (!targetUser || targetUser.id === session?.id) return false;
    if (isTopTier && isTopTierPost(targetUser)) return false;
    if (isTopTier) return true;
    if (canManage) {
      if (isTopTierPost(targetUser)) return false;
      return targetUser.role !== "admin" || !targetUser.post;
    }
    return false;
  };

  const approve = (u) => {
    persist(d => logActivity({ ...d, users: (d.users || []).map(x => x.id === u.id ? { ...x, status: "active", memberClass: "General" } : x) }, session?.name, `Approved membership: ${u.name}`));
    toast(isBn ? `${u.name}-এর সদস্যপদ অনুমোদিত হয়েছে।` : `Approved membership for ${u.name}.`);
  };

  const reject = async (u) => {
    try {
      await supabase.from("profiles").delete().eq("id", u.id);
    } catch (e) {
      console.warn("Reject profile delete error:", e);
    }
    persist(d => logActivity({ ...d, users: (d.users || []).filter(x => x.id !== u.id) }, session?.name, `Rejected membership: ${u.name}`));
    toast(isBn ? `${u.name}-এর আবেদন বাতিল করা হয়েছে।` : `Rejected application for ${u.name}.`);
  };

  const confirmKickOut = async (u) => {
    try {
      await supabase.from("dues").delete().eq("resident_id", u.id);
      await supabase.from("tickets").delete().eq("resident_id", u.id);
      await supabase.from("notice_comments").delete().eq("user_id", u.id);
      await supabase.from("chat_messages").delete().eq("user_id", u.id);
      await supabase.from("event_rsvps").delete().eq("user_id", u.id);
      await supabase.from("agm_attendees").delete().eq("user_id", u.id);
      await supabase.from("agm_proxies").delete().eq("granter_id", u.id);
      await supabase.from("agm_proxies").delete().eq("grantee_id", u.id);
      await supabase.from("amendment_votes").delete().eq("voter_id", u.id);
      await supabase.from("budget_votes").delete().eq("voter_id", u.id);
      await supabase.from("nominations").delete().eq("user_id", u.id);
      await supabase.from("profiles").delete().eq("id", u.id);
    } catch (err) {
      console.warn("Cascade deletion warning on kick-out:", err);
    }

    persist(d => logActivity({
      ...d,
      users: (d.users || []).filter(x => x.id !== u.id),
      dues: (d.dues || []).filter(x => x.residentId !== u.id),
      tickets: (d.tickets || []).filter(x => x.residentId !== u.id),
    }, session?.name, `Removed member: ${u.name} (${u.phone || u.email || "No phone"}) [${u.memberClass || "Resident"}]`));
    toast(isBn ? `${u.name}-এর সদস্যপদ বাতিল ও বহিষ্কার করা হয়েছে।` : `${u.name} has been removed from club membership.`);
    setKickOutTarget(null);
    if (selectedUser?.id === u.id) setSelectedUser(null);
  };

  return (
    <div>
      <SectionTitle
        action={
          isTopTier ? (
            <Btn size="sm" icon={UserPlus} onClick={() => setInviteModal(true)}>
              {isBn ? "সদস্য আমন্ত্রণ পাঠান" : "Invite member"}
            </Btn>
          ) : null
        }
      >
        {isBn ? "সদস্য ব্যবস্থাপনা ও নিবন্ধন" : "Members"}
      </SectionTitle>

      {!canManage && (
        <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}>
          <Shield size={14} /> {isBn ? "শুধুমাত্র সাধারণ প্রোফাইল দর্শন — আপনার পূর্ণ নিয়ন্ত্রণের অনুমতি নেই।" : "Basic view-only mode — you lack member-management permissions."}
        </div>
      )}

      {/* Top-Tier Authority Banner */}
      <div className="mb-5 p-3 rounded-xl text-xs flex items-center justify-between gap-3 border" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-2">
          <Shield size={15} style={{ color: C.primary }} />
          <span>
            {isBn
              ? "সরাসরি সদস্য আমন্ত্রণ ও পূর্ণ ফর্ম-২ যাচাই সংবিধানের ধারা-১০ ও ১৭ অনুসারে সংরক্ষিত।"
              : "Direct member invitations and official Form-2 inspections are managed by authorized leadership (Articles 10 & 17)."}
          </span>
        </div>
        {isTopTier && (
          <Badge tone="success">{isBn ? "শীর্ষ নেতৃত্ব সক্রিয়" : "Top-Tier Active"}</Badge>
        )}
      </div>

      <div className="flex rounded-full p-1 mb-5 w-fit" style={{ backgroundColor: C.surfaceContainer }}>
        {[
          { key: "active", label: isBn ? "সক্রিয় সদস্য" : "Active Members", count: activeUsers.length },
          { key: "pending", label: isBn ? "অপেক্ষমাণ আবেদন" : "Pending", count: pending.length },
        ].map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
            style={tb.key === tab ? { backgroundColor: C.primary, color: "#fff" } : { color: C.onSurfaceVariant }}
          >
            {tb.label} ({tb.count})
          </button>
        ))}
      </div>

      {tab === "pending" ? (
        <div className="flex flex-col gap-2.5">
          {pending.map(u => (
            <Card key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={u.name} photoUrl={u.photoUrl} size={46} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm">{u.name}</p>
                    {u.invitedBy && (
                      <Badge tone="info">
                        {isBn ? `${u.invitedBy} কর্তৃক আমন্ত্রিত` : `Invited by ${u.invitedBy}`}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: C.onSurfaceVariant }}>
                    <span className="font-semibold">{u.email}</span> · {isBn ? "ফোন:" : "Phone:"} <span className="font-semibold">{u.phone || "—"}</span> · {isBn ? "ব্লক" : "Block"} {u.block}, {u.unit}
                  </p>
                </div>
              </div>
              {canManage && (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Btn size="sm" variant="outline" icon={XCircle} onClick={() => reject(u)}>{isBn ? "বাতিল" : "Reject"}</Btn>
                  <Btn size="sm" icon={Check} onClick={() => approve(u)}>{isBn ? "অনুমোদন" : "Approve"}</Btn>
                </div>
              )}
            </Card>
          ))}
          {pending.length === 0 && (
            <Empty
              icon={UserCheck}
              title={isBn ? "কোনো অপেক্ষমাণ আবেদন নেই" : "No pending approvals"}
              subtitle={isBn ? "নতুন নিবন্ধিত সদস্যদের আবেদন এখানে প্রদর্শিত হবে।" : "New registrations will appear here for review."}
            />
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3.5">
          {activeUsers.map(u => {
            const rawPhone = cleanPhone(u.phone);
            return (
              <Card
                key={u.id}
                className="p-4 flex items-center justify-between gap-3 hover:shadow-md transition-shadow border"
                style={{ borderColor: C.outlineVariant }}
              >
                <div
                  className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="relative shrink-0">
                    <Avatar name={u.name} photoUrl={u.photoUrl} size={48} />
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
                    <p className="text-xs truncate mt-0.5" style={{ color: C.onSurfaceVariant }}>
                      {u.phone ? <span className="font-semibold text-gray-700">{u.phone} · </span> : ""}
                      {isBn ? "ব্লক" : "Block"} <span className="font-semibold">{u.block}</span> ({u.unit})
                    </p>
                    <p className="text-[11px] truncate opacity-70" style={{ color: C.outline }}>
                      {u.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {rawPhone && (
                    <a
                      href={`https://wa.me/${rawPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title={isBn ? "হোয়াটসঅ্যাপ বার্তা" : "WhatsApp"}
                    >
                      <MessageCircle size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="p-2 rounded-lg hover:bg-black/5 text-xs font-semibold"
                    style={{ color: C.primary }}
                    title={canManage ? (isBn ? "সম্পূর্ণ প্রোফাইল ও নিয়ন্ত্রণ" : "Full Profile & Roles") : (isBn ? "প্রোফাইল দেখুন" : "View Profile")}
                  >
                    {canManage ? <Edit3 size={16} /> : <Eye size={16} />}
                  </button>
                  {canKickOutUser(u) && (
                    <button
                      onClick={() => setKickOutTarget(u)}
                      className="p-2 rounded-lg hover:bg-rose-50 text-xs font-semibold"
                      style={{ color: C.error }}
                      title={isBn ? "সদস্যপদ বাতিল / বহিষ্কার" : "Kick out"}
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Member Profile Modal (Basic View for all, Full View & Roles for Authorized Admins) */}
      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={canManage ? (isBn ? "সদস্য পূর্ণ প্রোফাইল ও প্রশাসনিক নিয়ন্ত্রণ" : "Full Member Profile & Management") : (isBn ? "সদস্য প্রোফাইল" : "Member Profile")}
        width="max-w-xl"
      >
        {selectedUser && (
          <MemberProfileInspector
            user={selectedUser}
            session={session}
            canManage={canManage}
            isTopTier={isTopTier}
            persist={persist}
            logActivity={logActivity}
            toast={toast}
            lang={lang}
            isBn={isBn}
            onClose={() => setSelectedUser(null)}
            onKickOut={() => setKickOutTarget(selectedUser)}
            canKickOut={canKickOutUser(selectedUser)}
          />
        )}
      </Modal>

      {/* Kick Out Confirmation Modal */}
      <Modal open={!!kickOutTarget} onClose={() => setKickOutTarget(null)} title={isBn ? "সদস্যপদ বাতিল / বহিষ্কার নিশ্চিতকরণ" : "Kick Out Member Confirmation"}>
        {kickOutTarget && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}>
              <AlertTriangle size={24} className="shrink-0 mt-0.5 text-rose-600" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm text-rose-800">
                  {isBn ? `আপনি কি ${kickOutTarget.name}-কে ক্লাব থেকে বহিষ্কার করতে চান?` : `Are you sure you want to remove ${kickOutTarget.name}?`}
                </p>
                <p className="leading-relaxed">
                  {isBn
                    ? "সদস্যপদ বাতিল করলে তিনি আর ক্লাবের অ্যাপে লগইন করতে পারবেন না এবং তার সমস্ত অ্যাক্সেস বন্ধ হয়ে যাবে।"
                    : "Removing this member will revoke their access to the Kunjachaya Club portal and delete their active membership status."}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl text-xs space-y-1.5 border" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
              <div className="flex justify-between"><span className="opacity-70">{isBn ? "নাম:" : "Name:"}</span> <span className="font-bold">{kickOutTarget.name}</span></div>
              <div className="flex justify-between"><span className="opacity-70">{isBn ? "ইমেইল:" : "Email:"}</span> <span className="font-semibold">{kickOutTarget.email}</span></div>
              <div className="flex justify-between"><span className="opacity-70">{isBn ? "মোবাইল:" : "Mobile:"}</span> <span className="font-semibold">{kickOutTarget.phone || "—"}</span></div>
              <div className="flex justify-between"><span className="opacity-70">{isBn ? "পদবী/শ্রেণি:" : "Post/Class:"}</span> <span className="font-semibold">{kickOutTarget.post || kickOutTarget.memberClass}</span></div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Btn full variant="outline" onClick={() => setKickOutTarget(null)}>
                {isBn ? "বাতিল করুন" : "Cancel"}
              </Btn>
              <Btn full variant="danger" icon={Trash2} onClick={() => confirmKickOut(kickOutTarget)}>
                {isBn ? "হ্যাঁ, বহিষ্কার করুন" : "Yes, Kick Out"}
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Official Invitation Modal */}
      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title={isBn ? "নতুন সদস্যকে অফিশিয়াল আমন্ত্রণ পাঠান" : "Invite New Member"} width="max-w-lg">
        <InviteMemberModal
          onClose={() => setInviteModal(false)}
          persist={persist}
          logActivity={logActivity}
          session={session}
          toast={toast}
          lang={lang}
          isBn={isBn}
        />
      </Modal>
    </div>
  );
}

/**
 * Unified Member Profile Inspector Component
 * - Basic Profile View: Available to all club members
 * - Full Official View (Form-2 Details & Admin Management): Available to Top-Tier & Authorized Admins
 */
function MemberProfileInspector({ user, session, canManage, isTopTier, persist, logActivity, toast, isBn, onClose, onKickOut, canKickOut }) {
  const [tab, setTab] = useState("basic"); // "basic" | "full" | "roles"

  // Role Editor state
  const [memberClass, setMemberClass] = useState(user.memberClass || "General");
  const [post, setPost] = useState(user.post || "");
  const [role, setRole] = useState(user.role || "resident");
  const [perms, setPerms] = useState(user.permissions || {});
  const [standingCouncil, setStandingCouncil] = useState(!!user.standingCouncil);

  const isTargetTopTier = user.post === "President" || user.post === "General Secretary";
  const rawPhone = cleanPhone(user.phone);

  const handlePostChange = (newPost) => {
    setPost(newPost);
    if (!newPost) return;
    setRole("admin");
    const defaults = POST_DEFAULT_PERMISSIONS[newPost] || {
      canManageMembers: false, canManageNotices: false, canManageFinancials: false, canManageComplaints: false, canDeleteItems: false
    };
    setPerms(prev => ({ ...prev, ...defaults }));
    if (newPost === "President" || newPost === "General Secretary") {
      setStandingCouncil(true);
    }
  };

  const permLabels = {
    canManageMembers: { en: "Approve & manage members (ধারা-১০)", bn: "সদস্য অনুমোদন ও ব্যবস্থাপনা (ধারা-১০)" },
    canManageNotices: { en: "Publish & manage notices", bn: "নোটিশ প্রকাশ ও পরিচালনা" },
    canManageFinancials: { en: "Manage dues & club financials (ধারা-১৭.৫)", bn: "চাঁদা ও আর্থিক ব্যবস্থাপনা (ধারা-১৭.৫)" },
    canManageComplaints: { en: "Resolve member complaints & support", bn: "সদস্য অভিযোগ ও সহায়তা নিষ্পত্তি" },
    canDeleteItems: { en: "Delete records & entries (Top-tier only)", bn: "রেকর্ড ও এন্ট্রি মুছে ফেলা (শীর্ষ নেতৃত্ব)" },
  };

  const saveRoles = () => {
    persist(d => logActivity({
      ...d,
      users: (d.users || []).map(u => u.id === user.id ? {
        ...u,
        memberClass,
        post: post || null,
        role,
        permissions: role === "admin" ? perms : {},
        standingCouncil: (post === "President" || post === "General Secretary" || memberClass === "Founding") ? true : standingCouncil,
      } : u)
    }, session?.name, `Updated role for ${user.name}`));
    toast(isBn ? `${user.name}-এর ভূমিকা ও পদবী সংরক্ষিত হয়েছে।` : `Updated role and permissions for ${user.name}.`);
    onClose();
  };

  return (
    <div className="space-y-4 py-1 max-h-[80vh] overflow-y-auto pr-1">
      {/* Header Profile Card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
        <Avatar name={user.name} photoUrl={user.photoUrl} size={64} className="border-2 border-white shadow-md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-lg heading leading-tight text-gray-900">{user.name}</h3>
            {user.post ? (
              <Badge tone="success">{user.post}</Badge>
            ) : (
              <Badge tone="neutral">{user.memberClass || "General Member"}</Badge>
            )}
            {user.standingCouncil && (
              <Badge tone="info">{isBn ? "স্থায়ী পরিষদ" : "Council"}</Badge>
            )}
          </div>
          {user.nameBn && (
            <p className="text-xs font-semibold text-emerald-800 mt-0.5">{user.nameBn}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            {isBn ? "ব্লক" : "Block"} <span className="font-bold text-gray-800">{user.block}</span> ({user.unit}) · {user.email}
          </p>
        </div>
      </div>

      {/* Tabs Switcher for Authorized Admins */}
      {canManage && (
        <div className="flex rounded-full p-1 border" style={{ backgroundColor: C.surfaceContainer, borderColor: C.outlineVariant }}>
          <button
            onClick={() => setTab("basic")}
            className="flex-1 py-1.5 rounded-full text-xs font-bold transition-all"
            style={tab === "basic" ? { backgroundColor: C.primary, color: "#fff" } : { color: C.onSurfaceVariant }}
          >
            {isBn ? "সাধারণ প্রোফাইল" : "Basic Profile"}
          </button>
          <button
            onClick={() => setTab("full")}
            className="flex-1 py-1.5 rounded-full text-xs font-bold transition-all"
            style={tab === "full" ? { backgroundColor: C.primary, color: "#fff" } : { color: C.onSurfaceVariant }}
          >
            {isBn ? "পূর্ণ ফরম-২ বিবরণ" : "Full Form-2 Info"}
          </button>
          <button
            onClick={() => setTab("roles")}
            className="flex-1 py-1.5 rounded-full text-xs font-bold transition-all"
            style={tab === "roles" ? { backgroundColor: C.primary, color: "#fff" } : { color: C.onSurfaceVariant }}
          >
            {isBn ? "পদবী ও অনুমতি" : "Roles & Authority"}
          </button>
        </div>
      )}

      {/* TAB 1: BASIC PROFILE VIEW (Accessible to all) */}
      {(!canManage || tab === "basic") && (
        <div className="space-y-3">
          {/* Quick Communication Buttons */}
          <div className="flex items-center gap-2">
            {rawPhone ? (
              <>
                <a
                  href={`tel:${user.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Phone size={14} /> {isBn ? "কল করুন" : "Call Phone"}
                </a>
                <a
                  href={`https://wa.me/${rawPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </>
            ) : null}
            {user.email && (
              <a
                href={`mailto:${user.email}?subject=${encodeURIComponent("Kunjachaya Club Communication")}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-colors border"
                style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant, color: C.onSurface }}
              >
                <Mail size={14} /> {isBn ? "ইমেইল" : "Email"}
              </a>
            )}
          </div>

          {/* Quick Details Table */}
          <div className="p-4 rounded-2xl space-y-2.5 text-xs border" style={{ backgroundColor: C.surface, borderColor: C.outlineVariant }}>
            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
              <span className="flex items-center gap-1.5 opacity-70"><Phone size={13} /> {isBn ? "মোবাইল ফোন:" : "Mobile Phone:"}</span>
              <span className="font-bold select-all text-gray-900">{user.phone || "—"}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
              <span className="flex items-center gap-1.5 opacity-70"><Mail size={13} /> {isBn ? "ইমেইল:" : "Email:"}</span>
              <span className="font-semibold select-all text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
              <span className="flex items-center gap-1.5 opacity-70"><MapPin size={13} /> {isBn ? "বাসা ও ইউনিট:" : "Residence & Unit:"}</span>
              <span className="font-semibold">{isBn ? `ব্লক ${user.block}, ইউনিট ${user.unit}` : `Block ${user.block}, Unit ${user.unit}`}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
              <span className="flex items-center gap-1.5 opacity-70"><Droplet size={13} /> {isBn ? "রক্তের গ্রুপ ও দাতা:" : "Blood Group & Donor:"}</span>
              <div className="flex items-center gap-1.5">
                {user.bloodGroup ? (
                  <span className="font-bold px-2 py-0.5 rounded-full text-white bg-rose-600">{user.bloodGroup}</span>
                ) : (
                  <span className="text-gray-400">{isBn ? "নির্ধারিত নয়" : "Not set"}</span>
                )}
                {user.donor && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {isBn ? "রক্তদাতা" : "Donor"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: C.outlineVariant }}>
              <span className="flex items-center gap-1.5 opacity-70"><Calendar size={13} /> {isBn ? "যোগদানের তারিখ:" : "Joined Date:"}</span>
              <span className="font-medium">{user.joinedDate ? fmtDate(user.joinedDate) : "March 2021"}</span>
            </div>
            {user.earnedBadges && user.earnedBadges.length > 0 && (
              <div className="py-1">
                <span className="flex items-center gap-1.5 opacity-70 mb-1.5"><Award size={13} /> {isBn ? "অর্জিত ব্যাজ:" : "Earned Badges:"}</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {user.earnedBadges.map(b => (
                    <Badge key={b} tone="warning">{b === "b_founder" ? (isBn ? "⭐ প্রতিষ্ঠাতা সদস্য" : "⭐ Founder") : b}</Badge>
                  ))}
                </div>
              </div>
            )}
            {user.bio && (
              <div className="pt-2">
                <p className="font-bold text-[11px] mb-1 opacity-75">{isBn ? "সংক্ষিপ্ত বিবরণ:" : "Bio & Interests:"}</p>
                <p className="p-2.5 rounded-xl bg-gray-50 text-gray-700 italic text-[11px] leading-relaxed border">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FULL FORM-2 DETAILS (Top-Tier & Authorized Only) */}
      {canManage && tab === "full" && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl space-y-3 text-xs border" style={{ backgroundColor: C.surface, borderColor: C.outlineVariant }}>
            <h4 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
              <FileText size={15} style={{ color: C.primary }} />
              {isBn ? "ফরম-২ অফিসিয়াল সংযুক্তি ও পরিচয়পত্র" : "Form-2 Official Identity & Verification"}
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "পরিচয়পত্রের ধরন" : "ID Document Type"}</p>
                <p className="font-bold text-gray-900">{user.idType || "NID"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "পরিচয়পত্র নম্বর (NID/Passport)" : "ID Document Number"}</p>
                <p className="font-bold text-gray-900 select-all">{user.idNumber || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "জন্ম তারিখ" : "Date of Birth"}</p>
                <p className="font-semibold text-gray-800">{user.dob || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "লিঙ্গ / ধর্ম" : "Gender / Religion"}</p>
                <p className="font-semibold text-gray-800">{user.gender || "male"} · {user.religion || "Islam"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "পেশা" : "Profession"}</p>
                <p className="font-semibold text-gray-800">{user.profession || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "শিক্ষাগত যোগ্যতা" : "Education"}</p>
                <p className="font-semibold text-gray-800">{user.education || "—"}</p>
              </div>
            </div>

            <h4 className="font-bold text-sm text-gray-900 border-b pb-2 pt-2 flex items-center gap-2">
              <Home size={15} style={{ color: C.primary }} />
              {isBn ? "পারিবারিক তথ্য ও অভিভাবক" : "Family & Guardian Information"}
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "পিতার নাম" : "Father's Name"}</p>
                <p className="font-semibold text-gray-800">{user.fatherName || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "মাতার নাম" : "Mother's Name"}</p>
                <p className="font-semibold text-gray-800">{user.motherName || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-gray-500">{isBn ? "স্বামীর/স্ত্রীর নাম" : "Spouse's Name"}</p>
                <p className="font-semibold text-gray-800">{user.spouseName || "—"}</p>
              </div>
            </div>

            <h4 className="font-bold text-sm text-gray-900 border-b pb-2 pt-2 flex items-center gap-2">
              <Building size={15} style={{ color: C.primary }} />
              {isBn ? "কুঞ্জছায়া আবাসিক পূর্ণ ঠিকানা" : "Residential Full Address"}
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "এলাকা ও ওয়ার্ড" : "Area & Ward"}</p>
                <p className="font-semibold text-gray-800">{user.area || "কুঞ্জছায়া আবাসিক এলাকা"} ({user.wardNo || "২নং জালালাবাদ"})</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "থানা ও জেলা" : "Thana & District"}</p>
                <p className="font-semibold text-gray-800">{user.thana || "বায়েজীদ বোস্তামী"}, {user.district || "চট্টগ্রাম"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "হোল্ডিং ও ফ্লোর নং" : "Holding & Floor"}</p>
                <p className="font-semibold text-gray-800">{user.holdingNo || "—"}, {user.floorNo || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">{isBn ? "বিকল্প যোগাযোগ নম্বর" : "Alternate Phone"}</p>
                <p className="font-semibold text-gray-800">{user.altPhone || "—"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Btn full variant="outline" icon={Printer} onClick={() => window.print()}>
              {isBn ? "প্রিন্ট ফরম-২" : "Print Form-2"}
            </Btn>
          </div>
        </div>
      )}

      {/* TAB 3: ROLES, POSTS & PERMISSIONS (Top-Tier & Authorized Only) */}
      {canManage && tab === "roles" && (
        <div className="space-y-4 pt-1">
          <Field label={isBn ? "সদস্য শ্রেণিবিভাগ (ধারা-৬)" : "Member Class (Article 6)"}>
            <select style={inputStyle()} className={inputCls} value={memberClass} onChange={e => setMemberClass(e.target.value)}>
              {MEMBER_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          {isTopTier ? (
            <>
              <Field label={isBn ? "অ্যাকাউন্ট ভূমিকা" : "Account Role"}>
                <select style={inputStyle()} className={inputCls} value={role} onChange={e => setRole(e.target.value)}>
                  <option value="resident">{isBn ? "সাধারণ সদস্য (Resident)" : "Resident"}</option>
                  <option value="admin">{isBn ? "কার্যনির্বাহী পরিষদ (EC / Admin)" : "Executive Committee (Admin)"}</option>
                </select>
              </Field>

              <Field label={isBn ? "কার্যনির্বাহী পরিষদের পদবী (ধারা-১৪)" : "Executive Committee Post (Article 14)"}>
                {isTargetTopTier ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow, color: C.primary }}>
                    <Shield size={14} style={{ color: C.primary }} />
                    <span>{post}</span>
                    <span className="ml-auto text-[10px] font-normal opacity-60">
                      {isBn ? "সংবিধান ধারা-১৪ — পদবী পরিবর্তন সংরক্ষিত" : "Article 14 — Post is protected"}
                    </span>
                  </div>
                ) : (
                  <select style={inputStyle()} className={inputCls} value={post} onChange={e => handlePostChange(e.target.value)}>
                    <option value="">{isBn ? "-- কোনো নির্বাহী পদ নেই --" : "-- No Executive Post --"}</option>
                    {COMMITTEE_POSTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                )}
              </Field>

              {role === "admin" && (
                <Field label={isBn ? "অনুমতি ম্যাট্রিক্স (ধারা-১৭)" : "Permission Matrix (Article 17)"}>
                  <div className="flex flex-col gap-2.5 p-3 rounded-xl border" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }}>
                    {PERMISSION_KEYS.map(pk => (
                      <label key={pk} className="flex items-start gap-2.5 text-xs font-semibold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!perms[pk]}
                          onChange={e => setPerms({ ...perms, [pk]: e.target.checked })}
                          className="mt-0.5 rounded"
                        />
                        <div>
                          <span style={{ color: C.onSurface }}>{isBn ? permLabels[pk]?.bn : permLabels[pk]?.en}</span>
                          <span className="block text-[10px] font-normal" style={{ color: C.onSurfaceVariant }}>{pk}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </Field>
              )}

              <Field label={isBn ? "স্থায়ী পরিষদ সদস্যপদ (ধারা-১৩খ)" : "Standing Council (Article 13b)"}>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={standingCouncil || post === "President" || post === "General Secretary" || memberClass === "Founding"}
                    disabled={post === "President" || post === "General Secretary" || memberClass === "Founding"}
                    onChange={e => setStandingCouncil(e.target.checked)}
                    className="rounded"
                  />
                  <span style={{ color: C.onSurface }}>
                    {isBn ? "সংবিধান সংশোধনী ও নির্বাচন তদারকির স্থায়ী পরিষদ আসন" : "Standing Council seat (Review & vote on amendments / elections)"}
                  </span>
                </label>
              </Field>
            </>
          ) : (
            <p className="text-xs p-3 rounded-xl border" style={{ borderColor: C.outlineVariant, color: C.outline, backgroundColor: C.surfaceContainerLow }}>
              {isBn
                ? "ধারা-১৭ অনুসারে শুধুমাত্র সভাপতি বা সাধারণ সম্পাদক কর্মকর্তা নিয়োগ, অনুমতি এবং স্থায়ী পরিষদ সদস্যপদ নির্ধারণ করতে পারেন।"
                : "Only the President or General Secretary may appoint officers and modify committee permissions (Article 17)."}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Btn full onClick={saveRoles}>{isBn ? "ভূমিকা ও পদবী সংরক্ষণ করুন" : "Save Changes"}</Btn>
            {canKickOut && (
              <Btn full variant="danger" icon={UserX} onClick={onKickOut}>
                {isBn ? "সদস্যপদ বাতিল / বহিষ্কার করুন" : "Kick Out Member"}
              </Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function InviteMemberModal({ onClose, persist, logActivity, session, toast, isBn = false }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [block, setBlock] = useState("A");
  const [unit, setUnit] = useState("");
  const [memberClass, setMemberClass] = useState("General");
  const [directApprove, setDirectApprove] = useState(true);
  const [note, setNote] = useState("");
  const [createdInvite, setCreatedInvite] = useState(null);

  const isTopTier = session?.role === "admin" && (session?.post === "President" || session?.post === "General Secretary");

  if (!isTopTier) {
    return (
      <div className="p-4 text-center">
        <Shield size={36} className="mx-auto mb-2 text-rose-500" />
        <p className="font-bold text-sm text-rose-600 mb-1">
          {isBn ? "অনুমতি সংরক্ষিত" : "Restricted Authority"}
        </p>
        <p className="text-xs text-slate-500">
          {isBn
            ? "সংবিধানের ধারা-১০ ও ১৭ অনুসারে শুধুমাত্র সভাপতি ও সাধারণ সম্পাদক সরাসরি সদস্য আমন্ত্রণ পাঠাতে পারেন।"
            : "Only the President and General Secretary can issue official member invitations."}
        </p>
      </div>
    );
  }

  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast(isBn ? "অনুগ্রহ করে নাম, ইমেইল এবং মোবাইল নম্বর পূরণ করুন।" : "Please provide name, email, and mobile phone.", "error");
      return;
    }

    const inviteCode = uid("kc_inv");
    const newUser = {
      id: uid("u"),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      block,
      unit: unit.trim() || `${block}-01`,
      role: "resident",
      post: null,
      status: directApprove ? "active" : "pending",
      memberClass,
      bloodGroup: "",
      donor: false,
      joinedDate: nowISO(),
      invitedBy: session?.name || "President",
      inviteCode,
      permissions: { formDetails: { pledgeAccepted: true } }
    };

    persist(d => logActivity({
      ...d,
      users: [newUser, ...(d.users || [])]
    }, session?.name, `Sent official invitation to ${name} (${email})`));

    const baseUrl = getAppBaseUrl();
    const link = `${baseUrl}/?invite=${inviteCode}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&block=${encodeURIComponent(block)}&unit=${encodeURIComponent(newUser.unit)}&phone=${encodeURIComponent(phone)}`;

    setCreatedInvite({
      name,
      email,
      phone,
      code: inviteCode,
      link
    });

    toast(isBn ? `${name}-এর জন্য আমন্ত্রণ লিঙ্ক প্রস্তুত হয়েছে!` : `Invitation created for ${name}!`);
  };

  return (
    <div className="space-y-4 py-1">
      {!createdInvite ? (
        <>
          <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
            {isBn
              ? "সভাপতির অফিশিয়াল ক্ষমতা দ্বারা সদস্যপদ আমন্ত্রণ। আমন্ত্রিত সদস্য সরাসরি যুক্ত হতে পারবেন।"
              : "Presidential authority invitation: the recipient can join directly with pre-filled details."}
          </p>

          <Field label={isBn ? "সদস্যের নাম (Name)" : "Full Name"}>
            <input
              style={inputStyle()}
              className={inputCls}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Tanvir Ahmed"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={isBn ? "ইমেইল (Email)" : "Email Address"}>
              <input
                type="email"
                style={inputStyle()}
                className={inputCls}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </Field>

            <Field label={isBn ? "মোবাইল নম্বর (Phone)" : "Mobile Phone"}>
              <input
                type="tel"
                style={inputStyle()}
                className={inputCls}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={isBn ? "ব্লক (Block)" : "Block"}>
              <select style={inputStyle()} className={inputCls} value={block} onChange={e => setBlock(e.target.value)}>
                {BLOCKS.map(b => <option key={b} value={b}>{isBn ? `ব্লক ${b}` : `Block ${b}`}</option>)}
              </select>
            </Field>

            <Field label={isBn ? "ইউনিট / ফ্ল্যাট (Unit)" : "Unit / Flat"}>
              <input
                style={inputStyle()}
                className={inputCls}
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. A-02"
              />
            </Field>
          </div>

          <Field label={isBn ? "সদস্য শ্রেণিবিভাগ (Member Class)" : "Member Class"}>
            <select style={inputStyle()} className={inputCls} value={memberClass} onChange={e => setMemberClass(e.target.value)}>
              {MEMBER_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <label className="flex items-center gap-2 text-xs font-semibold text-emerald-950 cursor-pointer">
              <input
                type="checkbox"
                checked={directApprove}
                onChange={e => setDirectApprove(e.target.checked)}
                className="rounded text-emerald-700"
              />
              <span>{isBn ? "সরাসরি সক্রিয় সদস্য হিসেবে অনুমোদন করুন (Skip Pending Queue)" : "Direct active approval (Skip pending review queue)"}</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Btn variant="outline" onClick={onClose}>{isBn ? "বাতিল" : "Cancel"}</Btn>
            <Btn icon={Send} onClick={handleSend}>{isBn ? "আমন্ত্রণ তৈরি করুন" : "Generate Invitation"}</Btn>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
            <h4 className="font-black text-base text-emerald-950">{isBn ? "আমন্ত্রণ সফলভাবে তৈরি হয়েছে!" : "Invitation Ready!"}</h4>
            <p className="text-xs text-emerald-800 mt-1">{createdInvite.name} ({createdInvite.phone})</p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border text-xs space-y-2">
            <p className="font-bold text-gray-700">{isBn ? "আমন্ত্রণ লিংক:" : "Direct Setup Link:"}</p>
            <p className="p-2 rounded bg-white border font-mono text-[11px] select-all break-all text-gray-800">{createdInvite.link}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <Btn
              variant="outline"
              icon={Copy}
              onClick={() => {
                navigator.clipboard.writeText(createdInvite.link);
                toast(isBn ? "আমন্ত্রণ লিংক কপি করা হয়েছে!" : "Link copied to clipboard!");
              }}
            >
              {isBn ? "লিংক কপি করুন" : "Copy Link"}
            </Btn>
            <a
              href={`https://wa.me/${cleanPhone(createdInvite.phone)}?text=${encodeURIComponent(`কুঞ্জছায়া ক্লাব-এর সদস্যপদ গ্রহণের জন্য অফিশিয়াল আমন্ত্রণ লিংক: ${createdInvite.link}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle size={15} /> {isBn ? "হোয়াটসঅ্যাপে পাঠান" : "Share on WhatsApp"}
            </a>
          </div>

          <Btn full onClick={onClose}>{isBn ? "সম্পন্ন" : "Done"}</Btn>
        </div>
      )}
    </div>
  );
}
