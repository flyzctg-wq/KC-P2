// src/lib/store.js
//
// Replaces the single-Firestore-document store with real Postgres
// tables (see ../../kunjachaya-supabase/schema/), while keeping the
// exact same `db` object shape (db.users, db.notices, db.dues, ...)
// every existing screen already reads — so none of the ~40 screens in
// App.jsx needed to be rewritten to migrate backends.
//
// fetchAll() reads every table and reshapes rows (snake_case columns,
// separate child tables) back into the camelCase, nested shape the app
// expects (e.g. notices.reactions.like, elections.candidates).
//
// Deliberate simplicity tradeoff: realtime updates trigger a full
// fetchAll() rather than an incremental per-row patch. That's more
// reads than a fully optimized version, but it's correct and simple to
// reason about — worth revisiting only if this app grows to a size
// where that read volume actually matters.

import { supabase } from "./supabase";

/* ============================== READ ============================== */

async function fetchAll() {
  // RLS returns empty arrays (not errors) for unauthenticated callers.
  // We use individual try-catch per table to avoid one failure blocking
  // the whole load, and normalise every result to an array.
  const safe = (result) => Array.isArray(result?.data) ? result.data : [];

  const results = await Promise.allSettled([
    supabase.from("profiles").select("*"),
    supabase.from("notices").select("*").order("created_at", { ascending: false }),
    supabase.from("notice_comments").select("*").order("created_at"),
    supabase.from("dues").select("*"),
    supabase.from("elections").select("*"),
    supabase.from("candidates").select("*"),
    supabase.from("nominations").select("*"),
    supabase.from("votes").select("*"),
    supabase.from("tickets").select("*").order("created_at", { ascending: false }),
    supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(150),
    supabase.from("emergency_contacts").select("*"),
    supabase.from("agm_events").select("*"),
    supabase.from("agm_resolutions").select("*"),
    supabase.from("agm_attendees").select("*"),
    supabase.from("agm_proxies").select("*"),
    supabase.from("amendments").select("*"),
    supabase.from("amendment_votes").select("*"),
    supabase.from("budget_items").select("*"),
    supabase.from("budget_votes").select("*"),
    supabase.from("chat_messages").select("*").order("created_at"),
    supabase.from("handover_checklist").select("*"),
    supabase.from("events").select("*"),
    supabase.from("event_rsvps").select("*"),
    supabase.from("inductions").select("*"),
  ]);

  const [
    profiles, notices, comments,
    dues, elections, candidates, nominations, votes,
    tickets, activity, emergencyContacts,
    agmEvents, agmResolutions, agmAttendees, agmProxies,
    amendments, amendmentVotes,
    budgetItems, budgetVotes,
    chatMessages, handoverChecklist,
    events, eventRsvps, inductions,
  ] = results.map(r => r.status === "fulfilled" ? (r.value?.data ?? []) : []);

  const by = (rows, fk) => {
    const map = {};
    (rows || []).forEach(r => { (map[r[fk]] ??= []).push(r); });
    return map;
  };
  const commentsByNotice = by(comments, "notice_id");
  const candidatesByElection = by(candidates, "election_id");
  const nominationsByElection = by(nominations, "election_id");
  const resolutionsByAgm = by(agmResolutions, "agm_event_id");
  const attendeesByAgm = by(agmAttendees, "agm_event_id");
  const proxiesByAgm = by(agmProxies, "agm_event_id");
  const votesByAmendment = by(amendmentVotes, "amendment_id");
  const votesByBudget = by(budgetVotes, "budget_item_id");
  const rsvpsByEvent = by(eventRsvps, "event_id");

  return {
    users: (profiles || []).map(p => {
      const form = p.permissions?.formDetails || {};
      return {
        id: p.id, name: p.name, email: p.email, phone: p.phone, block: p.block, unit: p.unit,
        memberClass: p.member_class, role: p.role, post: p.post, status: p.status,
        permissions: p.permissions || {}, standingCouncil: p.standing_council,
        bloodGroup: p.blood_group, donor: p.donor, earnedBadges: p.earned_badges || [],
        joinedDate: p.joined_date,
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
    }),
    notices: (notices || []).map(n => ({
      id: n.id, title: n.title, body: n.body, category: n.category,
      authorId: n.author_id, authorName: n.author_name, date: n.created_at,
      reactions: { like: n.likes || [] },
      comments: (commentsByNotice[n.id] || []).map(c => ({ id: c.id, userId: c.user_id, userName: c.user_name, text: c.text, date: c.created_at })),
    })),
    dues: (dues || []).map(d => ({ id: d.id, residentId: d.resident_id, month: d.month, amount: Number(d.amount), status: d.status, paidDate: d.paid_date, ref: d.ref })),
    elections: (elections || []).map(e => ({
      id: e.id, title: e.title, status: e.status, positions: e.positions,
      startDate: e.start_date, endDate: e.end_date,
      candidates: (candidatesByElection[e.id] || []).map(c => ({ id: c.id, name: c.name, position: c.position, block: c.block, manifesto: c.manifesto })),
      nominations: (nominationsByElection[e.id] || []).map(n => ({ id: n.id, userId: n.user_id, userName: n.user_name, position: n.position, manifesto: n.manifesto, status: n.status })),
    })),
    votes: (votes || []).map(v => ({ id: v.id, electionId: v.election_id, position: v.position, candidateId: v.candidate_id, voterId: v.voter_id, timestamp: v.created_at })),
    tickets: (tickets || []).map(t => ({ id: t.id, residentId: t.resident_id, residentName: t.resident_name, subject: t.subject, category: t.category, description: t.description, status: t.status, response: t.response, date: t.created_at })),
    activity: (activity || []).map(a => ({ id: a.id, actor: a.actor, action: a.action, date: a.created_at })).reverse(),
    emergencyContacts: (emergencyContacts || []).map(c => ({ id: c.id, name: c.name, role: c.role, phone: c.phone, category: c.category })),
    agmEvents: (agmEvents || []).map(ev => ({
      id: ev.id, title: ev.title, date: ev.date, status: ev.status, agenda: ev.agenda || [], minutes: ev.minutes || "",
      resolutions: (resolutionsByAgm[ev.id] || []).map(r => ({ id: r.id, title: r.title, description: r.description, votesFor: r.votes_for || [], votesAgainst: r.votes_against || [] })),
      attendees: (attendeesByAgm[ev.id] || []).map(a => a.user_id),
      proxies: (proxiesByAgm[ev.id] || []).map(p => ({ granterId: p.granter_id, granteeId: p.grantee_id })),
    })),
    amendments: (amendments || []).map(a => ({
      id: a.id, title: a.title, articleRef: a.article_ref, currentText: a.current_text, proposedText: a.proposed_text,
      proposerId: a.proposer_id, proposerName: a.proposer_name, status: a.status,
      councilVotes: (votesByAmendment[a.id] || []).map(v => ({ voterId: v.voter_id, choice: v.choice })),
    })),
    budgetItems: (budgetItems || []).map(b => ({
      id: b.id, category: b.category, description: b.description, amount: Number(b.amount), proposedBy: b.proposed_by, status: b.status,
      councilVotes: (votesByBudget[b.id] || []).map(v => ({ voterId: v.voter_id, choice: v.choice })),
    })),
    chatMessages: (chatMessages || []).map(m => ({ id: m.id, channel: m.channel, userId: m.user_id, userName: m.user_name, text: m.text, date: m.created_at })),
    handoverChecklist: (handoverChecklist || []).map(h => ({ id: h.id, item: h.item, category: h.category, done: h.done, doneBy: h.done_by, doneDate: h.done_date })),
    events: (events || []).map(ev => ({ id: ev.id, title: ev.title, description: ev.description, date: ev.date, location: ev.location, rsvps: (rsvpsByEvent[ev.id] || []).map(r => r.user_id) })),
    inductions: (inductions || []).map(i => ({ id: i.id, name: i.name, position: i.position, date: i.date, electionTitle: i.election_title })),
  };
}

export async function loadDB() {
  return fetchAll();
}
// Kept for API-compatibility with the old Firestore version's
// loadDB/saveDB pair — saveDB isn't used for reading Postgres (writes
// go through the targeted functions in write.js instead), but
// App.jsx's bootstrap effect calls it once if loadDB() looks empty.
export async function saveDB() { return fetchAll(); }

/* ============================== REALTIME ============================== */

const WATCHED_TABLES = [
  "profiles", "notices", "notice_comments", "dues", "elections", "candidates", "nominations", "votes",
  "tickets", "activity", "emergency_contacts", "agm_events", "agm_resolutions", "agm_attendees", "agm_proxies",
  "amendments", "amendment_votes", "budget_items", "budget_votes", "chat_messages", "handover_checklist",
  "events", "event_rsvps", "inductions",
];

export function subscribeDB(onChange) {
  const channel = supabase.channel("kc-realtime");
  WATCHED_TABLES.forEach(table => {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, async () => {
      onChange(await fetchAll());
    });
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}
