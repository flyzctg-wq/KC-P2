import React, { useState } from "react";
import { Check, XCircle, Shield, Edit3, UserCheck, UserPlus, Send, Copy, MessageCircle, Phone, Mail, CheckCircle2, UserX, AlertTriangle, Trash2 } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Empty, Modal, SectionTitle } from "../../components/primitives";
import { C, BLOCKS, MEMBER_CLASSES, PERMISSION_KEYS, COMMITTEE_POSTS, POST_DEFAULT_PERMISSIONS } from "../../theme";
import { uid, nowISO, getAppBaseUrl, cleanPhone } from "../../utils";

export default function AdminMembers({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [tab, setTab] = useState("pending");
  const [roleModal, setRoleModal] = useState(null);
  const [inviteModal, setInviteModal] = useState(false);
  const [kickOutTarget, setKickOutTarget] = useState(null);

  const isTopTier = session.role === "admin" && (session.post === "President" || session.post === "General Secretary");
  const canManage = session.role === "admin" && (session.permissions?.canManageMembers || isTopTier);
  const pending = db.users.filter(u => u.status === "pending");
  const activeUsers = db.users.filter(u => u.status === "active");

  // A user is "top-tier" if they hold the President or General Secretary post
  const isTopTierPost = (u) => u?.post === "President" || u?.post === "General Secretary";

  const canKickOutUser = (targetUser) => {
    if (!targetUser || targetUser.id === session.id) return false;
    // Top-tier leaders cannot kick each other (mutual protection)
    if (isTopTier && isTopTierPost(targetUser)) return false;
    // Top-tier can kick anyone else
    if (isTopTier) return true;
    // Admins with canManageMembers can only kick non-officer residents
    if (canManage) {
      if (isTopTierPost(targetUser)) return false;
      return targetUser.role !== "admin" || !targetUser.post;
    }
    return false;
  };

  const approve = (u) => {
    persist(d => logActivity({ ...d, users: d.users.map(x => x.id === u.id ? { ...x, status: "active", memberClass: "General" } : x) }, session.name, `Approved membership: ${u.name}`));
    toast(isBn ? `${u.name}-এর সদস্যপদ অনুমোদিত হয়েছে।` : `Approved membership for ${u.name}.`);
  };

  const reject = (u) => {
    persist(d => logActivity({ ...d, users: d.users.filter(x => x.id !== u.id) }, session.name, `Rejected membership: ${u.name}`));
    toast(isBn ? `${u.name}-এর আবেদন বাতিল করা হয়েছে।` : `Rejected application for ${u.name}.`);
  };

  const confirmKickOut = (u) => {
    persist(d => logActivity({
      ...d,
      users: d.users.filter(x => x.id !== u.id)
    }, session.name, `Kicked out member: ${u.name} (${u.phone || u.email || "No phone"}) [${u.memberClass || "Resident"}]`));
    toast(isBn ? `${u.name}-এর সদস্যপদ বাতিল ও বহিষ্কার করা হয়েছে।` : `${u.name} has been removed from club membership.`);
    setKickOutTarget(null);
    if (roleModal?.id === u.id) setRoleModal(null);
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
          <Shield size={14} /> {isBn ? "শুধুমাত্র দর্শন — আপনার canManageMembers অনুমতি নেই।" : "View-only — you lack canManageMembers permission."}
        </div>
      )}

      {/* Top-Tier Authority Banner */}
      <div className="mb-5 p-3 rounded-xl text-xs flex items-center justify-between gap-3 border" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
        <div className="flex items-center gap-2">
          <Shield size={15} style={{ color: C.primary }} />
          <span>
            {isBn
              ? "সরাসরি সদস্য আমন্ত্রণ ও নির্বাহী নিয়োগের ক্ষমতা সংবিধানের ধারা-১০ ও ১৭ অনুসারে শুধুমাত্র সভাপতি ও সাধারণ সম্পাদকের জন্য সংরক্ষিত।"
              : "Direct member invitations and officer appointments are restricted to the President & General Secretary (Articles 10 & 17)."}
          </span>
        </div>
        {isTopTier && (
          <Badge tone="success">{isBn ? "শীর্ষ নেতৃত্ব সক্রিয়" : "Top-Tier Active"}</Badge>
        )}
      </div>

      <div className="flex rounded-full p-1 mb-5 w-fit" style={{ backgroundColor: C.surfaceContainer }}>
        {[
          { key: "pending", label: isBn ? "অপেক্ষমাণ আবেদন" : "Pending", count: pending.length },
          { key: "active", label: isBn ? "সক্রিয় সদস্য" : "Active", count: activeUsers.length },
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
                <Avatar name={u.name} photoUrl={u.photoUrl} size={44} />
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
              subtitle={isBn ? "নতুন ইমেইল বা ফোন নম্বরের নিবন্ধন এখানে অনুমোদনের জন্য প্রদর্শিত হবে।" : "New registrations will appear here for review."}
            />
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {activeUsers.map(u => (
            <Card
              key={u.id}
              className="p-4 flex items-center justify-between gap-3"
            >
              <div
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                onClick={() => canManage && setRoleModal(u)}
              >
                <Avatar name={u.name} photoUrl={u.photoUrl} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-sm truncate">{u.name}</p>
                    {u.post && <Badge tone="success">{u.post}</Badge>}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: C.onSurfaceVariant }}>
                    {u.phone ? <span className="font-medium">{u.phone} · </span> : ""}{isBn ? "ব্লক" : "Block"} {u.block} ({u.unit}) · {u.memberClass}
                  </p>
                  <p className="text-[11px] truncate opacity-70" style={{ color: C.outline }}>
                    {u.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {canManage && (
                  <button
                    onClick={() => setRoleModal(u)}
                    className="p-2 rounded-lg hover:bg-black/5 text-xs font-semibold"
                    style={{ color: C.primary }}
                    title={isBn ? "সম্পাদনা" : "Manage"}
                  >
                    <Edit3 size={16} />
                  </button>
                )}
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
          ))}
        </div>
      )}

      {/* Role Editor Modal */}
      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title={isBn ? "সদস্য তথ্য ও পদবী সম্পাদনা" : "Manage member"}>
        {roleModal && (
          <RoleEditor
            user={roleModal}
            onClose={() => setRoleModal(null)}
            persist={persist}
            logActivity={logActivity}
            session={session}
            toast={toast}
            lang={lang}
            isBn={isBn}
            onKickOut={() => setKickOutTarget(roleModal)}
            canKickOut={canKickOutUser(roleModal)}
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

      {/* President / General Secretary Exclusive Invitation Modal */}
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

export function RoleEditor({ user, onClose, persist, logActivity, session, toast, isBn = false, onKickOut, canKickOut = false }) {
  const [memberClass, setMemberClass] = useState(user.memberClass);
  const [post, setPost] = useState(user.post || "");
  const [role, setRole] = useState(user.role);
  const [perms, setPerms] = useState(user.permissions || {});
  const [standingCouncil, setStandingCouncil] = useState(!!user.standingCouncil);
  const isTopTier = session.post === "President" || session.post === "General Secretary";
  // Target is the other top-tier leader — their post is immutable (mutual protection)
  const isTargetTopTier = user.post === "President" || user.post === "General Secretary";

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

  const save = () => {
    persist(d => logActivity({
      ...d,
      users: d.users.map(u => u.id === user.id ? {
        ...u,
        memberClass,
        post: post || null,
        role,
        permissions: role === "admin" ? perms : {},
        standingCouncil: (post === "President" || post === "General Secretary" || memberClass === "Founding") ? true : standingCouncil,
      } : u)
    }, session.name, `Updated role for ${user.name}`));
    toast(isBn ? `${user.name}-এর ভূমিকা ও পদবী সংরক্ষিত হয়েছে।` : `Updated role and permissions for ${user.name}.`);
    onClose();
  };

  return (
    <div className="space-y-4">
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
              // President / General Secretary post is locked — cannot be changed by the other top-tier leader
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow, color: C.primary }}>
                <Shield size={14} style={{ color: C.primary }} />
                <span>{post}</span>
                <span className="ml-auto text-[10px] font-normal opacity-60">
                  {isBn ? "সংবিধান ধারা-১৪ — পদবী পরিবর্তন সংরক্ষিত" : "Article 14 — Post is protected & immutable"}
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
            : "Only the President or General Secretary may appoint officers and modify committee permissions (Article 17 / Workflow §1)."}
        </p>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Btn full onClick={save}>{isBn ? "সংরক্ষণ করুন" : "Save changes"}</Btn>
        {canKickOut && (
          <Btn full variant="danger" icon={UserX} onClick={onKickOut}>
            {isBn ? "সদস্যপদ বাতিল / বহিষ্কার করুন" : "Kick Out Member"}
          </Btn>
        )}
      </div>
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

  const isTopTier = session.role === "admin" && (session.post === "President" || session.post === "General Secretary");

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

  const handleSend = () => {
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
      invitedBy: `${session.name} (${session.post})`,
      inviteCode,
      permissions: {},
    };

    persist(d => logActivity({
      ...d,
      users: [...d.users.filter(u => u.email.toLowerCase() !== email.trim().toLowerCase()), newUser]
    }, session.name, `Issued official invitation to ${name} (${phone}) as ${memberClass}`));

    toast(isBn ? `${name}-এর জন্য অফিশিয়াল আমন্ত্রণ সফলভাবে তৈরি হয়েছে!` : `Official invitation created for ${name}!`);

    const baseUrl = getAppBaseUrl();
    const inviteLink = `${baseUrl}/?invite=${inviteCode}&email=${encodeURIComponent(email.trim())}`;
    const inviteText = isBn
      ? `সম্মানিত ${name},\nকুঞ্জছায়া ক্লাবের সভাপতি/সাধারণ সম্পাদকের পক্ষ থেকে আপনাকে ক্লাবের প্ল্যাটফর্মে যোগদানের সাদর আমন্ত্রণ জানানো হচ্ছে।\nসদস্যপদ শ্রেণি: ${memberClass}\nব্লক: ${block}, ইউনিট: ${unit}\n\nআপনার অ্যাকাউন্টে লগইন/অ্যাক্সেস করতে নিচের লিংকে ক্লিক করুন:\n${inviteLink}`
      : `Dear ${name},\nYou have been officially invited by the ${session.post} to join Kunjachaya Club.\nMembership Class: ${memberClass}\nBlock: ${block}, Unit: ${unit}\n\nAccess your account here:\n${inviteLink}`;

    setCreatedInvite({
      inviteCode,
      inviteLink,
      inviteText,
      name,
      email,
      phone: cleanPhone(phone),
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    toast(isBn ? "ক্লিপবোর্ডে কপি করা হয়েছে!" : "Copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      {!createdInvite ? (
        <>
          <div className="p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.secondaryContainer, color: C.onSecondaryContainer }}>
            <Shield size={16} className="shrink-0" />
            <span>
              {isBn
                ? `আপনি ${session.post} হিসেবে এই সদস্যকে সরাসরি আমন্ত্রণ ও প্রাক-অনুমোদন প্রদান করছেন।`
                : `Issuing official invitation as ${session.post}.`}
            </span>
          </div>

          <Field label={isBn ? "সদস্যের পুরো নাম (Full Name)" : "Full Name"}>
            <input
              style={inputStyle()}
              className={inputCls}
              placeholder={isBn ? "যেমন: মোহাম্মদ রফিকুল ইসলাম" : "e.g. Rafiqul Islam"}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={isBn ? "ইমেইল অ্যাড্রেস" : "Email"}>
              <input
                style={inputStyle()}
                className={inputCls}
                type="email"
                placeholder="rafiq@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Field>
            <Field label={isBn ? "মোবাইল ফোন নম্বর" : "Mobile Phone"}>
              <input
                style={inputStyle()}
                className={inputCls}
                type="tel"
                placeholder="018XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={isBn ? "ব্লক (Block)" : "Block"}>
              <select style={inputStyle()} className={inputCls} value={block} onChange={e => setBlock(e.target.value)}>
                {BLOCKS.map(b => <option key={b} value={b}>{isBn ? `ব্লক ${b}` : `Block ${b}`}</option>)}
              </select>
            </Field>
            <Field label={isBn ? "ফ্ল্যাট / ইউনিট নং" : "Unit / Flat"}>
              <input
                style={inputStyle()}
                className={inputCls}
                placeholder={isBn ? "যেমন: A-401" : "e.g. A-401"}
                value={unit}
                onChange={e => setUnit(e.target.value)}
              />
            </Field>
          </div>

          <Field label={isBn ? "সদস্যপদ শ্রেণি (ধারা-৬)" : "Membership Class (Article 6)"}>
            <select style={inputStyle()} className={inputCls} value={memberClass} onChange={e => setMemberClass(e.target.value)}>
              {MEMBER_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <div className="p-3 rounded-xl border" style={{ borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }}>
            <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={directApprove}
                onChange={e => setDirectApprove(e.target.checked)}
                className="rounded"
              />
              <div>
                <span style={{ color: C.onSurface }}>
                  {isBn ? "সরাসরি সক্রিয় অনুমোদন (Direct Pre-Approval)" : "Direct Pre-Approval"}
                </span>
                <span className="block text-[10px] font-normal" style={{ color: C.onSurfaceVariant }}>
                  {isBn ? "সদস্যকে অপেক্ষমাণ না রেখে সাথে সাথে পূর্ণ সদস্য সুবিধা প্রদান করুন" : "Grants active membership immediately without waiting in pending queue"}
                </span>
              </div>
            </label>
          </div>

          <Btn full icon={Send} onClick={handleSend} disabled={!name.trim() || !email.trim() || !phone.trim()}>
            {isBn ? "আমন্ত্রণ তৈরি ও লিংক তৈরি করুন" : "Generate & Issue Invitation"}
          </Btn>
        </>
      ) : (
        <div className="space-y-4 text-center py-2">
          <CheckCircle2 size={44} style={{ color: C.primary }} className="mx-auto animate-bounce" />
          <div>
            <h3 className="font-extrabold text-base heading">
              {isBn ? "আমন্ত্রণ সফলভাবে প্রস্তুত!" : "Invitation Ready!"}
            </h3>
            <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>
              {isBn
                ? `${createdInvite.name}-এর জন্য অফিশিয়াল আমন্ত্রণ লিংক তৈরি করা হয়েছে। নিচের মাধ্যমে পাঠাতে পারেন:`
                : `Official invitation link generated for ${createdInvite.name}. Share via:`}
            </p>
          </div>

          {/* Invitation Message Box */}
          <div className="p-3 rounded-xl text-left text-xs whitespace-pre-wrap border max-h-40 overflow-y-auto" style={{ backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }}>
            {createdInvite.inviteText}
          </div>

          {/* Action Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Btn
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={() => copyToClipboard(createdInvite.inviteText)}
            >
              {isBn ? "বার্তা কপি করুন" : "Copy Message"}
            </Btn>

            <Btn
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={() => copyToClipboard(createdInvite.inviteLink)}
            >
              {isBn ? "শুধুমাত্র লিংক কপি" : "Copy Link"}
            </Btn>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/${createdInvite.phone}?text=${encodeURIComponent(createdInvite.inviteText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>

            <a
              href={`mailto:${createdInvite.email}?subject=${encodeURIComponent("Kunjachaya Club - Official Membership Invitation")}&body=${encodeURIComponent(createdInvite.inviteText)}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors"
            >
              <Mail size={15} /> {isBn ? "ইমেইল পাঠান" : "Send Email"}
            </a>
          </div>

          <Btn full variant="outline" onClick={onClose}>
            {isBn ? "সম্পন্ন / বন্ধ করুন" : "Done / Close"}
          </Btn>
        </div>
      )}
    </div>
  );
}

