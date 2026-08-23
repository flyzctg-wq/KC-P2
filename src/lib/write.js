// src/lib/write.js
//
// Every screen in App.jsx calls persist(d => ({ ...d, someKey: newValue })),
// same as the Firestore-blob version — it hands back a whole new `db`
// object. This module is what makes that still work against real
// Postgres tables: it diffs the previous db against the next one and
// issues targeted insert/update/delete calls per table, instead of
// overwriting one JSON blob.
//
// EXCLUDED from this generic engine, on purpose:
//   - `votes` — RLS blocks direct client writes entirely; casting a
//     vote goes through the cast_vote() RPC (called directly from
//     BallotView, not through persist()). See schema/03_cast_vote.sql.
// This keeps the one operation that most needs database-level
// atomicity (exactly one vote per resident per position) from ever
// being reachable through this generic bulk-diff path.

import { supabase } from "./supabase";

const changed = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

async function syncTable(table, prevArr = [], nextArr = [], toRow) {
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
    // Previously this only logged to the console and swallowed the
    // failure — the caller (App.jsx's persist()) had already updated
    // local UI state optimistically, so a blocked insert (e.g. an RLS
    // policy rejecting it) looked like it worked right up until the
    // next refresh silently dropped it. Throwing here lets persist()'s
    // .catch() actually show the user a toast instead of nothing.
    if (error) throw new Error(`Could not save to ${table}: ${error.message}`);
  }
  for (const u of updates) {
    const { error } = await supabase.from(table).update(u.row).eq("id", u.id);
    if (error) throw new Error(`Could not update ${table}: ${error.message}`);
  }
  if (deletes.length) {
    // If deleting from profiles, clean up referencing child tables first to avoid FK constraint errors
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

/** For a parent's nested child array (e.g. election.candidates): only
 * re-synced when the parent row changed, using delete-all + reinsert —
 * simpler and safe at this app's scale, vs. fine-grained child diffing. */
async function replaceChildren(table, fkColumn, parentId, rows) {
  await supabase.from(table).delete().eq(fkColumn, parentId);
  if (rows.length) await supabase.from(table).insert(rows.map(r => ({ ...r, [fkColumn]: parentId })));
}

export async function syncChanges(prevDb, nextDb) {
  await syncTable("profiles", prevDb.users, nextDb.users, u => {
    const formDetails = {
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
      permissions: { ...(u.permissions || {}), formScanUrl: u.formScanUrl || u.permissions?.formScanUrl || "", formDetails },
      standing_council: !!u.standingCouncil,
      blood_group: u.bloodGroup, donor: !!u.donor, earned_badges: u.earnedBadges || [],
    };
  });

  await syncTable("notices", prevDb.notices, nextDb.notices, n => ({
    id: n.id, title: n.title, body: n.body, category: n.category,
    author_id: n.authorId, author_name: n.authorName, likes: n.reactions?.like || [],
  }));
  // comments are a child table — resync per-notice when that notice's comment list changed
  for (const n of nextDb.notices || []) {
    const before = (prevDb.notices || []).find(x => x.id === n.id);
    if (!before || changed(before.comments, n.comments)) {
      await replaceChildren("notice_comments", "notice_id", n.id, (n.comments || []).map(c => ({ id: c.id, user_id: c.userId, user_name: c.userName, text: c.text })));
    }
  }

  await syncTable("dues", prevDb.dues, nextDb.dues, d => ({
    id: d.id, resident_id: d.residentId, month: d.month, amount: d.amount, status: d.status, paid_date: d.paidDate, ref: d.ref,
  }));

  await syncTable("elections", prevDb.elections, nextDb.elections, e => ({
    id: e.id, title: e.title, status: e.status, positions: e.positions, start_date: e.startDate, end_date: e.endDate,
  }));
  for (const e of nextDb.elections || []) {
    const before = (prevDb.elections || []).find(x => x.id === e.id);
    if (!before || changed(before.candidates, e.candidates)) {
      await replaceChildren("candidates", "election_id", e.id, (e.candidates || []).map(c => ({ id: c.id, name: c.name, position: c.position, block: c.block, manifesto: c.manifesto })));
    }
    if (!before || changed(before.nominations, e.nominations)) {
      await replaceChildren("nominations", "election_id", e.id, (e.nominations || []).map(n => ({ id: n.id, user_id: n.userId, user_name: n.userName, position: n.position, manifesto: n.manifesto, status: n.status })));
    }
  }
  // votes intentionally NOT synced here — see file header.

  // Cache ticket attachments locally so they persist instantly across views
  (nextDb.tickets || []).forEach(t => {
    if (t.attachments && Array.isArray(t.attachments) && t.attachments.length > 0) {
      try {
        localStorage.setItem(`kc_ticket_att_${t.id}`, JSON.stringify(t.attachments));
      } catch (_) {}
    }
  });

  await syncTable("tickets", prevDb.tickets, nextDb.tickets, t => {
    const row = {
      id: t.id, resident_id: t.residentId, resident_name: t.residentName, subject: t.subject,
      category: t.category, description: t.description, status: t.status, response: t.response,
    };
    if (t.attachments && Array.isArray(t.attachments)) {
      row.attachments = t.attachments;
    }
    return row;
  });

  // activity is append-only — only ever insert new entries, never diff/delete
  const prevActivityIds = new Set((prevDb.activity || []).map(a => a.id));
  const newActivity = (nextDb.activity || []).filter(a => !prevActivityIds.has(a.id));
  if (newActivity.length) await supabase.from("activity").insert(newActivity.map(a => ({ id: a.id, actor: a.actor, action: a.action })));

  await syncTable("emergency_contacts", prevDb.emergencyContacts, nextDb.emergencyContacts, c => ({
    id: c.id, name: c.name, role: c.role, phone: c.phone, category: c.category,
  }));

  await syncTable("agm_events", prevDb.agmEvents, nextDb.agmEvents, ev => ({
    id: ev.id, title: ev.title, date: ev.date, status: ev.status, agenda: ev.agenda, minutes: ev.minutes,
  }));
  for (const ev of nextDb.agmEvents || []) {
    const before = (prevDb.agmEvents || []).find(x => x.id === ev.id);
    if (!before || changed(before.resolutions, ev.resolutions)) {
      await replaceChildren("agm_resolutions", "agm_event_id", ev.id, (ev.resolutions || []).map(r => ({ id: r.id, title: r.title, description: r.description, votes_for: r.votesFor, votes_against: r.votesAgainst })));
    }
    if (!before || changed(before.attendees, ev.attendees)) {
      await replaceChildren("agm_attendees", "agm_event_id", ev.id, (ev.attendees || []).map(userId => ({ user_id: userId })));
    }
    if (!before || changed(before.proxies, ev.proxies)) {
      await replaceChildren("agm_proxies", "agm_event_id", ev.id, (ev.proxies || []).map(p => ({ granter_id: p.granterId, grantee_id: p.granteeId })));
    }
  }

  await syncTable("amendments", prevDb.amendments, nextDb.amendments, a => ({
    id: a.id, title: a.title, article_ref: a.articleRef, current_text: a.currentText, proposed_text: a.proposedText,
    proposer_id: a.proposerId, proposer_name: a.proposerName, status: a.status,
  }));
  for (const a of nextDb.amendments || []) {
    const before = (prevDb.amendments || []).find(x => x.id === a.id);
    if (!before || changed(before.councilVotes, a.councilVotes)) {
      await supabase.from("amendment_votes").delete().eq("amendment_id", a.id);
      if (a.councilVotes?.length) await supabase.from("amendment_votes").insert(a.councilVotes.map(v => ({ amendment_id: a.id, voter_id: v.voterId, choice: v.choice })));
    }
  }

  await syncTable("budget_items", prevDb.budgetItems, nextDb.budgetItems, b => ({
    id: b.id, category: b.category, description: b.description, amount: b.amount, proposed_by: b.proposedBy, status: b.status,
  }));
  for (const b of nextDb.budgetItems || []) {
    const before = (prevDb.budgetItems || []).find(x => x.id === b.id);
    if (!before || changed(before.councilVotes, b.councilVotes)) {
      await supabase.from("budget_votes").delete().eq("budget_item_id", b.id);
      if (b.councilVotes?.length) await supabase.from("budget_votes").insert(b.councilVotes.map(v => ({ budget_item_id: b.id, voter_id: v.voterId, choice: v.choice })));
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
      await replaceChildren("event_rsvps", "event_id", ev.id, (ev.rsvps || []).map(userId => ({ user_id: userId })));
    }
  }

  await syncTable("inductions", prevDb.inductions, nextDb.inductions, i => ({
    id: i.id, name: i.name, position: i.position, date: i.date, election_title: i.electionTitle,
  }));
}
