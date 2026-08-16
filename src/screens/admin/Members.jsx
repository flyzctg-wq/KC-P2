import React, { useState } from "react";
import { Check, XCircle, Shield, Edit3, UserCheck } from "lucide-react";
import { Btn, Card, Badge, Field, inputCls, inputStyle, Avatar, Empty, Modal, SectionTitle } from "../../components/primitives";
import { C, MEMBER_CLASSES, PERMISSION_KEYS, COMMITTEE_POSTS, POST_DEFAULT_PERMISSIONS } from "../../theme";

export default function AdminMembers({ session, db, persist, toast, logActivity, lang = "en", t = {} }) {
  const isBn = lang === "bn";
  const [tab, setTab] = useState("pending");
  const [roleModal, setRoleModal] = useState(null);
  const isTopTier = session.role === "admin" && (session.post === "President" || session.post === "General Secretary");
  const canManage = session.role === "admin" && (session.permissions?.canManageMembers || isTopTier);
  const pending = db.users.filter(u => u.status === "pending");
  const activeUsers = db.users.filter(u => u.status === "active");

  const approve = (u) => {
    persist(d => logActivity({ ...d, users: d.users.map(x => x.id === u.id ? { ...x, status: "active", memberClass: "General" } : x) }, session.name, `Approved membership: ${u.name}`));
    toast(isBn ? `${u.name}-এর সদস্যপদ অনুমোদিত হয়েছে।` : `Approved membership for ${u.name}.`);
  };
  const reject = (u) => {
    persist(d => logActivity({ ...d, users: d.users.filter(x => x.id !== u.id) }, session.name, `Rejected membership: ${u.name}`));
    toast(isBn ? `${u.name}-এর আবেদন বাতিল করা হয়েছে।` : `Rejected application for ${u.name}.`);
  };

  return (
    <div>
      <SectionTitle>{isBn ? "সদস্য ব্যবস্থাপনা" : "Members"}</SectionTitle>
      {!canManage && (
        <div className="mb-4 p-3 rounded-xl text-xs flex items-center gap-2" style={{ backgroundColor: C.errorContainer, color: C.onErrorContainer }}>
          <Shield size={14} /> {isBn ? "শুধুমাত্র দর্শন — আপনার canManageMembers অনুমতি নেই।" : "View-only — you lack canManageMembers permission."}
        </div>
      )}
      <div className="flex rounded-full p-1 mb-5 w-fit" style={{ backgroundColor: C.surfaceContainer }}>
        {[
          { key: "pending", label: isBn ? "অপেক্ষমাণ" : "Pending", count: pending.length },
          { key: "active", label: isBn ? "সক্রিয়" : "Active", count: activeUsers.length },
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
            <Card key={u.id} className="p-4 flex items-center gap-3">
              <Avatar name={u.name} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{u.name}</p>
                <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
                  {u.email} · {isBn ? "ব্লক" : "Block"} {u.block}, {u.unit} · {u.phone}
                </p>
              </div>
              {canManage && (
                <div className="flex gap-2 shrink-0">
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
              subtitle={isBn ? "নতুন নিবন্ধন এখানে প্রদর্শিত হবে।" : "New registrations will appear here."}
            />
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {activeUsers.map(u => (
            <Card
              key={u.id}
              className="p-4 flex items-center gap-3 cursor-pointer"
              onClick={() => canManage && setRoleModal(u)}
            >
              <Avatar name={u.name} photoUrl={u.photoUrl} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate">{u.name}</p>
                <p className="text-xs truncate" style={{ color: C.onSurfaceVariant }}>
                  {isBn ? "ব্লক" : "Block"} {u.block} · {u.memberClass}
                </p>
                {u.post && <Badge tone="success">{u.post}</Badge>}
              </div>
              {canManage && <Edit3 size={14} style={{ color: C.outline }} />}
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title={isBn ? "সদস্য তথ্য সম্পাদনা" : "Manage member"}>
        {roleModal && <RoleEditor user={roleModal} onClose={() => setRoleModal(null)} persist={persist} logActivity={logActivity} session={session} toast={toast} lang={lang} isBn={isBn} />}
      </Modal>
    </div>
  );
}

export function RoleEditor({ user, onClose, persist, logActivity, session, toast, isBn = false }) {
  const [memberClass, setMemberClass] = useState(user.memberClass);
  const [post, setPost] = useState(user.post || "");
  const [role, setRole] = useState(user.role);
  const [perms, setPerms] = useState(user.permissions || {});
  const [standingCouncil, setStandingCouncil] = useState(!!user.standingCouncil);
  const isTopTier = session.post === "President" || session.post === "General Secretary";

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
            <select style={inputStyle()} className={inputCls} value={post} onChange={e => handlePostChange(e.target.value)}>
              <option value="">{isBn ? "-- কোনো নির্বাহী পদ নেই --" : "-- No Executive Post --"}</option>
              {COMMITTEE_POSTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
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

      <Btn full onClick={save}>{isBn ? "সংরক্ষণ করুন" : "Save changes"}</Btn>
    </div>
  );
}
