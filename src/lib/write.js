// src/lib/write.js
//
// Every screen in App.jsx calls persist(d => ({ ...d, someKey: newValue })),
// handing back a new `db` object. This module diffs the previous db against
// the next one and issues targeted insert/update/delete calls per table.
//
// EXCLUDED from this generic engine, on purpose:
//   - `votes` — RLS blocks direct client writes entirely; casting a
//     vote goes through the cast_vote() RPC (called directly from
//     BallotView, not through persist()). See schema/03_cast_vote.sql.

import { supabase } from "./supabase";

const changed = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

export async function syncTable(table, prevArr = [], nextArr = [], toRow) {
  const prevById = new Map((prevArr || []).map(r => [r.id, r]));
  const nextById = new Map((nextArr || []).map(r => [r.id, r]));

  const inserts = [], updates = [];
  for (const [id, row] of nextById) {
    const before = prevById.get(id);
    if (!before) inserts.push(toRow(row));
    else if (changed(before, row)) updates.push({ id, row: toRow(row) });
  }
  const deletes = [...prevById.keys()].filter(id => !nextById.has(id));

  if (inserts.length) {
    const { error } = await supabase.from(table).insert(inserts);
    if (error) throw new Error(`Could not save to ${table}: ${error.message}`);
  }
  for (const u of updates) {
    const { error } = await supabase.from(table).update(u.row).eq("id", u.id);
    if (error) throw new Error(`Could not update ${table}: ${error.message}`);
  }
  if (deletes.length) {
    if (table === "profiles") {
      try {
        await supabase.from("dues").delete().in("resident_id", deletes);
        await supabase.from("tickets").delete().in("resident_id", deletes);
        await supabase.from("notice_comments").delete().in("user_id", deletes);
        await supabase.from("chat_messages").delete().in("user_id", deletes);
        await supabase.from("event_rsvps").delete().in("user_id", deletes);
        await supabase.from("agm_attendees").delete().in("user_id", deletes);
        await supabase.from("agm_proxies").delete().in("granter_id", deletes);
        await supabase.from("agm_proxies").delete().in("grantee_id", deletes);
        await supabase.from("amendment_votes").delete().in("voter_id", deletes);
        await supabase.from("budget_votes").delete().in("voter_id", deletes);
        await supabase.from("nominations").delete().in("user_id", deletes);
      } catch (fkErr) {
        console.warn("Child cleanup warning before profile delete:", fkErr);
      }
    }
    const { error } = await supabase.from(table).delete().in("id", deletes);
    if (error) throw new Error(`Could not delete from ${table}: ${error.message}`);
  }
}

/**
 * Safe fine-grained child synchronization:
 * Diffs existing rows against next rows to prevent destructive blind delete-all + insert,
 * protecting against multi-user RLS permission clashes and partial delete state.
 */
async function syncChildren(table, fkColumn, parentId, prevRows = [], nextRows = [], toRow, keyField = "id") {
  const prevById = new Map((prevRows || []).map(r => [r[keyField], r]));
  const nextById = new Map((nextRows || []).map(r => [r[keyField], r]));

  const inserts = [];
  const updates = [];

  for (const [key, row] of nextById) {
    const before = prevById.get(key);
    if (!before) {
      inserts.push({ ...toRow(row), [fkColumn]: parentId });
    } else if (changed(before, row)) {
      updates.push({ key, row: toRow(row) });
    }
  }

  const deletes = [...prevById.keys()].filter(k => !nextById.has(k));

  if (inserts.length) {
    const { error } = await supabase.from(table).insert(inserts);
    if (error) throw new Error(`Could not insert into ${table}: ${error.message}`);
  }

  for (const u of updates) {
    const { error } = await supabase.from(table).update(u.row).eq(fkColumn, parentId).eq(keyField, u.key);
    if (error) throw new Error(`Could not update ${table}: ${error.message}`);
  }

  if (deletes.length) {
    const { error } = await supabase.from(table).delete().eq(fkColumn, parentId).in(keyField, deletes);
    if (error) throw new Error(`Could not remove from ${table}: ${error.message}`);
  }
}

/**
 * Synchronize join tables (e.g. event_rsvps, agm_attendees) without dropping other members' records.
 */
async function syncSet(table, filterCol, filterVal, idCol, prevList = [], nextList = []) {
  const prevSet = new Set(prevList || []);
  const nextSet = new Set(nextList || []);

  const toAdd = [...nextSet].filter(x => !prevSet.has(x));
  const toRemove = [...prevSet].filter(x => !nextSet.has(x));

  if (toAdd.length) {
    const { error } = await supabase.from(table).insert(toAdd.map(val => ({ [filterCol]: filterVal, [idCol]: val })));
    if (error) throw new Error(`Could not add to ${table}: ${error.message}`);
  }

  if (toRemove.length) {
    const { error } = await supabase.from(table).delete().eq(filterCol, filterVal).in(idCol, toRemove);
    if (error) throw new Error(`Could not remove from ${table}: ${error.message}`);
  }
}

export async function syncChanges(prevDb = {}, nextDb = {}) {
  await syncTable("profiles", prevDb.users, nextDb.users, u => {
    const formDetails = {
      memberCode: u.memberCode || "",
      nameBn: u.nameBn || "",
      dob: u.dob || "",
      gender: u.gender || "male",
      profession: u.profession || "",
      education: u.education || "",
      religion: u.religion || "Islam",
      houseNo: u.houseNo || "",
      roadNo: u.roadNo || "",
      area: u.area || "কুঞ্জছায়া আবাসিক এলাকা",
      floorNo: u.floorNo || "",
      holdingNo: u.holdingNo || "",
      wardNo: u.wardNo || "২নং জালালাবাদ",
      thana: u.thana || "বায়েজীদ বোস্তামী",
      district: u.district || "চট্টগ্রাম",
      altPhone: u.altPhone || "",
      fatherName: u.fatherName || "",
      motherName: u.motherName || "",
      spouseName: u.spouseName || "",
      idType: u.idType || "NID",
      idNumber: u.idNumber || "",
      photoUrl: u.photoUrl || "",
      bio: u.bio || "",
      pledgeAccepted: u.pledgeAccepted ?? true,
    };
    return {
      id: u.id, name: u.name, email: u.email, phone: u.phone, block: u.block, unit: u.unit,
      member_class: u.memberClass, role: u.role, post: u.post, status: u.status,
      permissions: { ...(u.permissions || {}), memberCode: u.memberCode || u.permissions?.memberCode || "", formScanUrl: u.formScanUrl || u.permissions?.formScanUrl || "", formDetails },
      standing_council: !!u.standingCouncil,
      blood_group: u.bloodGroup, donor: !!u.donor, earned_badges: u.earnedBadges || [],
    };
  });

  await syncTable("notices", prevDb.notices, nextDb.notices, n => {
    let bodyWithMeta = n.body || "";
    if (n.isBulletin || n.bulletinExpiresAt || n.bulletinDurationHours) {
      const meta = {
        isBulletin: !!n.isBulletin,
        bulletinType: n.bulletinType || "quick",
        bulletinExpiresAt: n.bulletinExpiresAt || null,
        bulletinDurationHours: n.bulletinDurationHours || null,
      };
      bodyWithMeta = `${n.body || ""}\n<!--KC_BULLETIN:${JSON.stringify(meta)}-->`;
    }
    const isUUID = (str) => typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    return {
      id: n.id,
      title: n.title || "Notice",
      body: bodyWithMeta,
      category: n.category || "General",
      author_id: isUUID(n.authorId) ? n.authorId : null,
      author_name: n.authorName || "Kunjachaya Admin",
      likes: n.reactions?.like || [],
    };
  });

  // comments: sync fine-grained per-notice without deleting existing member comments
  for (const n of nextDb.notices || []) {
    const before = (prevDb.notices || []).find(x => x.id === n.id);
    if (!before || changed(before.comments, n.comments)) {
      await syncChildren(
        "notice_comments", "notice_id", n.id,
        before?.comments || [], n.comments || [],
        c => ({ id: c.id, user_id: c.userId, user_name: c.userName, text: c.text })
      );
    }
  }

  // Dues persistence with backward-compatible schema fallback
  try {
    await syncTable("dues", prevDb.dues, nextDb.dues, d => ({
      id: d.id, resident_id: d.residentId, month: d.month, amount: d.amount, status: d.status, paid_date: d.paidDate, ref: d.ref,
      charge_type: d.chargeType || "monthly", charge_title: d.chargeTitle || null, due_date: d.dueDate || null,
      method: d.method || null, discount: Number(d.discount) || 0,
      received_amount: d.receivedAmount != null ? Number(d.receivedAmount) : null,
      balance_due: d.balanceDue != null ? Number(d.balanceDue) : null,
      collected_by: d.collectedBy || null, note: d.note || null,
      resolution_no: d.resolutionNo || null, category: d.category || null,
    }));
  } catch (dueErr) {
    if (dueErr?.message && dueErr.message.includes("column") && dueErr.message.includes("does not exist")) {
      console.warn("Extended dues columns not yet in DB schema; falling back to core dues fields:", dueErr.message);
      await syncTable("dues", prevDb.dues, nextDb.dues, d => ({
        id: d.id, resident_id: d.residentId, month: d.month, amount: d.amount, status: d.status, paid_date: d.paidDate, ref: d.ref,
      }));
    } else {
      throw dueErr;
    }
  }

  // Expenses synchronization
  if (nextDb.expenses || prevDb.expenses) {
    try {
      await syncTable("expenses", prevDb.expenses || [], nextDb.expenses || [], exp => ({
        id: exp.id,
        title: exp.title,
        category: exp.category,
        amount: Number(exp.amount),
        voucher_no: exp.voucherNo || exp.voucher_no,
        payee: exp.payee,
        approved_by: exp.approvedBy || exp.approved_by,
        date: exp.date || new Date().toISOString(),
      }));
    } catch (expErr) {
      if (expErr?.message && expErr.message.includes("relation") && expErr.message.includes("does not exist")) {
        console.warn("Expenses table not yet created in Supabase. Run 20260923_audit_resilience_fixes.sql migration to persist.");
      } else {
        throw expErr;
      }
    }
  }

  // Letters synchronization
  if (nextDb.letters || prevDb.letters) {
    try {
      await syncTable("letters", prevDb.letters || [], nextDb.letters || [], letRow => ({
        id: letRow.id,
        memo_no: letRow.memoNo || letRow.memo_no,
        subject: letRow.subject,
        recipient: letRow.recipient,
        body: letRow.body,
        letter_type: letRow.letterType || letRow.letter_type || "general",
        signatory_left_title: letRow.signatoryLeftTitle || letRow.signatory_left_title || null,
        signatory_left_name: letRow.signatoryLeftName || letRow.signatory_left_name || null,
        signatory_right_title: letRow.signatoryRightTitle || letRow.signatory_right_title || null,
        signatory_right_name: letRow.signatoryRightName || letRow.signatory_right_name || null,
        issued_by: letRow.issuedBy || letRow.issued_by || "Admin",
      }));
    } catch (letErr) {
      if (letErr?.message && letErr.message.includes("relation") && letErr.message.includes("does not exist")) {
        console.warn("Letters table not yet created in Supabase. Run 20260923_audit_resilience_fixes.sql migration to persist.");
      } else {
        throw letErr;
      }
    }
  }

  await syncTable("elections", prevDb.elections, nextDb.elections, e => ({
    id: e.id, title: e.title, status: e.status, positions: e.positions, start_date: e.startDate, end_date: e.endDate,
  }));
  for (const e of nextDb.elections || []) {
    const before = (prevDb.elections || []).find(x => x.id === e.id);
    if (!before || changed(before.candidates, e.candidates)) {
      await syncChildren(
        "candidates", "election_id", e.id,
        before?.candidates || [], e.candidates || [],
        c => ({ id: c.id, name: c.name, position: c.position, block: c.block, manifesto: c.manifesto })
      );
    }
    if (!before || changed(before.nominations, e.nominations)) {
      await syncChildren(
        "nominations", "election_id", e.id,
        before?.nominations || [], e.nominations || [],
        n => ({ id: n.id, user_id: n.userId, user_name: n.userName, position: n.position, manifesto: n.manifesto, status: n.status })
      );
    }
  }

  // Cache ticket attachments locally
  (nextDb.tickets || []).forEach(t => {
    if (t.attachments && Array.isArray(t.attachments) && t.attachments.length > 0) {
      try {
        localStorage.setItem(`kc_ticket_att_${t.id}`, JSON.stringify(t.attachments));
      } catch (_) {}
    }
  });

  await syncTable("tickets", prevDb.tickets, nextDb.tickets, t => {
    let fullDescription = t.description || "";
    if (t.attachments && Array.isArray(t.attachments) && t.attachments.length > 0) {
      if (!fullDescription.includes("<!--KC_ATTACHMENTS-->")) {
        fullDescription = `${fullDescription}\n\n<!--KC_ATTACHMENTS-->${JSON.stringify(t.attachments)}<!--/KC_ATTACHMENTS-->`;
      }
    }
    return {
      id: t.id,
      resident_id: t.residentId,
      resident_name: t.residentName,
      subject: t.subject,
      category: t.category,
      description: fullDescription,
      status: t.status,
      response: t.response,
    };
  });

  // activity is append-only
  const prevActivityIds = new Set((prevDb.activity || []).map(a => a.id));
  const newActivity = (nextDb.activity || []).filter(a => !prevActivityIds.has(a.id));
  if (newActivity.length) {
    const { error } = await supabase.from("activity").insert(newActivity.map(a => ({ id: a.id, actor: a.actor, action: a.action })));
    if (error) console.warn("Activity log insert warning:", error.message);
  }

  await syncTable("emergency_contacts", prevDb.emergencyContacts, nextDb.emergencyContacts, c => ({
    id: c.id, name: c.name, role: c.role, phone: c.phone, category: c.category,
  }));

  await syncTable("agm_events", prevDb.agmEvents, nextDb.agmEvents, ev => ({
    id: ev.id, title: ev.title, date: ev.date, status: ev.status, agenda: ev.agenda, minutes: ev.minutes,
  }));
  for (const ev of nextDb.agmEvents || []) {
    const before = (prevDb.agmEvents || []).find(x => x.id === ev.id);
    if (!before || changed(before.resolutions, ev.resolutions)) {
      await syncChildren(
        "agm_resolutions", "agm_event_id", ev.id,
        before?.resolutions || [], ev.resolutions || [],
        r => ({ id: r.id, title: r.title, description: r.description, votes_for: r.votesFor, votes_against: r.votesAgainst })
      );
    }
    if (!before || changed(before.attendees, ev.attendees)) {
      await syncSet("agm_attendees", "agm_event_id", ev.id, "user_id", before?.attendees || [], ev.attendees || []);
    }
    if (!before || changed(before.proxies, ev.proxies)) {
      await syncChildren(
        "agm_proxies", "agm_event_id", ev.id,
        before?.proxies || [], ev.proxies || [],
        p => ({ granter_id: p.granterId, grantee_id: p.granteeId }),
        "granterId"
      );
    }
  }

  await syncTable("amendments", prevDb.amendments, nextDb.amendments, a => ({
    id: a.id, title: a.title, article_ref: a.articleRef, current_text: a.currentText, proposed_text: a.proposedText,
    proposer_id: a.proposerId, proposer_name: a.proposerName, status: a.status,
  }));
  for (const a of nextDb.amendments || []) {
    const before = (prevDb.amendments || []).find(x => x.id === a.id);
    if (!before || changed(before.councilVotes, a.councilVotes)) {
      await syncChildren(
        "amendment_votes", "amendment_id", a.id,
        before?.councilVotes || [], a.councilVotes || [],
        v => ({ voter_id: v.voterId, choice: v.choice }),
        "voterId"
      );
    }
  }

  await syncTable("budget_items", prevDb.budgetItems, nextDb.budgetItems, b => ({
    id: b.id, category: b.category, description: b.description, amount: b.amount, proposed_by: b.proposedBy, status: b.status,
  }));
  for (const b of nextDb.budgetItems || []) {
    const before = (prevDb.budgetItems || []).find(x => x.id === b.id);
    if (!before || changed(before.councilVotes, b.councilVotes)) {
      await syncChildren(
        "budget_votes", "budget_item_id", b.id,
        before?.councilVotes || [], b.councilVotes || [],
        v => ({ voter_id: v.voterId, choice: v.choice }),
        "voterId"
      );
    }
  }

  await syncTable("chat_messages", prevDb.chatMessages, nextDb.chatMessages, m => ({
    id: m.id, channel: m.channel, user_id: m.userId, user_name: m.userName, text: m.text,
  }));

  await syncTable("handover_checklist", prevDb.handoverChecklist, nextDb.handoverChecklist, h => ({
    id: h.id, item: h.item, category: h.category, done: h.done, done_by: h.doneBy, done_date: h.doneDate,
  }));

  await syncTable("events", prevDb.events, nextDb.events, ev => ({
    id: ev.id, title: ev.title, description: ev.description, date: ev.date, location: ev.location,
  }));
  for (const ev of nextDb.events || []) {
    const before = (prevDb.events || []).find(x => x.id === ev.id);
    if (!before || changed(before.rsvps, ev.rsvps)) {
      await syncSet("event_rsvps", "event_id", ev.id, "user_id", before?.rsvps || [], ev.rsvps || []);
    }
  }

  await syncTable("inductions", prevDb.inductions, nextDb.inductions, i => ({
    id: i.id, name: i.name, position: i.position, date: i.date, election_title: i.electionTitle,
  }));
}
