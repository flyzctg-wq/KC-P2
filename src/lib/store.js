// src/lib/store.js
//
// Read and realtime sync engine for Kunjachaya Club (Postgres backend).
// Maintains backward-compatible camelCase object shape across all screens.

import { supabase } from "./supabase";

/* ============================== CACHE & RESILIENCE ============================== */

let lastDbSnapshot = null;

/* ============================== READ ============================== */

export async function fetchAll() {
  const parseTable = (result, previous = []) => {
    if (result.status === "fulfilled" && !result.value?.error && Array.isArray(result.value?.data)) {
      return result.value.data;
    }
    if (result.status === "rejected" || result.value?.error) {
      console.warn("Read query error:", result.reason || result.value?.error);
    }
    return previous || [];
  };

  const prev = lastDbSnapshot || {};

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
    // Order chat newest first with limit to avoid PostgREST 1000-row ascending cap truncation
    supabase.from("chat_messages").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("handover_checklist").select("*"),
    supabase.from("events").select("*"),
    supabase.from("event_rsvps").select("*"),
    supabase.from("inductions").select("*"),
    supabase.from("app_config").select("*").eq("key", "kc_modules").maybeSingle(),
    supabase.from("expenses").select("*").order("date", { ascending: false }),
    supabase.from("letters").select("*").order("created_at", { ascending: false }),
  ]);

  const [
    rProfiles, rNotices, rComments,
    rDues, rElections, rCandidates, rNominations, rVotes,
    rTickets, rActivity, rEmergencyContacts,
    rAgmEvents, rAgmResolutions, rAgmAttendees, rAgmProxies,
    rAmendments, rAmendmentVotes,
    rBudgetItems, rBudgetVotes,
    rChatMessages, rHandoverChecklist,
    rEvents, rEventRsvps, rInductions,
    rAppConfig,
    rExpenses, rLetters,
  ] = results;

  const profiles = parseTable(rProfiles, prev.rawProfiles);
  const notices = parseTable(rNotices, prev.rawNotices);
  const comments = parseTable(rComments, prev.rawComments);
  const dues = parseTable(rDues, prev.rawDues);
  const elections = parseTable(rElections, prev.rawElections);
  const candidates = parseTable(rCandidates, prev.rawCandidates);
  const nominations = parseTable(rNominations, prev.rawNominations);
  const votes = parseTable(rVotes, prev.rawVotes);
  const tickets = parseTable(rTickets, prev.rawTickets);
  const activity = parseTable(rActivity, prev.rawActivity);
  const emergencyContacts = parseTable(rEmergencyContacts, prev.rawEmergencyContacts);
  const agmEvents = parseTable(rAgmEvents, prev.rawAgmEvents);
  const agmResolutions = parseTable(rAgmResolutions, prev.rawAgmResolutions);
  const agmAttendees = parseTable(rAgmAttendees, prev.rawAgmAttendees);
  const agmProxies = parseTable(rAgmProxies, prev.rawAgmProxies);
  const amendments = parseTable(rAmendments, prev.rawAmendments);
  const amendmentVotes = parseTable(rAmendmentVotes, prev.rawAmendmentVotes);
  const budgetItems = parseTable(rBudgetItems, prev.rawBudgetItems);
  const budgetVotes = parseTable(rBudgetVotes, prev.rawBudgetVotes);
  const chatMessages = parseTable(rChatMessages, prev.rawChatMessages);
  const handoverChecklist = parseTable(rHandoverChecklist, prev.rawHandoverChecklist);
  const events = parseTable(rEvents, prev.rawEvents);
  const eventRsvps = parseTable(rEventRsvps, prev.rawEventRsvps);
  const inductions = parseTable(rInductions, prev.rawInductions);
  const expenses = parseTable(rExpenses, prev.rawExpenses);
  const letters = parseTable(rLetters, prev.rawLetters);

  // app_config uses .maybeSingle()
  let moduleFlags = null;
  if (rAppConfig.status === "fulfilled" && !rAppConfig.value?.error) {
    const rawVal = rAppConfig.value?.data;
    moduleFlags = (rawVal && !Array.isArray(rawVal))
      ? rawVal?.value
      : (Array.isArray(rawVal) && rawVal[0]?.value) || null;
  } else if (prev.moduleFlags) {
    moduleFlags = prev.moduleFlags;
  }

  // Preserve raw tables for resilient fallbacks
  lastDbSnapshot = {
    rawProfiles: profiles, rawNotices: notices, rawComments: comments,
    rawDues: dues, rawElections: elections, rawCandidates: candidates, rawNominations: nominations, rawVotes: votes,
    rawTickets: tickets, rawActivity: activity, rawEmergencyContacts: emergencyContacts,
    rawAgmEvents: agmEvents, rawAgmResolutions: agmResolutions, rawAgmAttendees: agmAttendees, rawAgmProxies: agmProxies,
    rawAmendments: amendments, rawAmendmentVotes: amendmentVotes,
    rawBudgetItems: budgetItems, rawBudgetVotes: budgetVotes,
    rawChatMessages: chatMessages, rawHandoverChecklist: handoverChecklist,
    rawEvents: events, rawEventRsvps: eventRsvps, rawInductions: inductions,
    rawExpenses: expenses, rawLetters: letters,
    moduleFlags,
  };

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
        memberCode: form.memberCode || form.member_code || p.permissions?.memberCode || "",
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
        formScanUrl: p.permissions?.formScanUrl || "",
      };
    }),
    notices: (notices || []).map(n => {
      let body = n.body || "";
      let isBulletin = false;
      let bulletinType = "quick";
      let bulletinExpiresAt = null;
      let bulletinDurationHours = null;

      if (typeof body === "string" && body.includes("<!--KC_BULLETIN:")) {
        const match = body.match(/<!--KC_BULLETIN:([\s\S]*?)-->/);
        if (match) {
          try {
            const meta = JSON.parse(match[1]);
            isBulletin = !!meta.isBulletin;
            bulletinType = meta.bulletinType || meta.type || "quick";
            bulletinExpiresAt = meta.bulletinExpiresAt || meta.expiresAt || null;
            bulletinDurationHours = meta.bulletinDurationHours || meta.durationHours || null;
          } catch (_) {}
          body = body.replace(/<!--KC_BULLETIN:[\s\S]*?-->/, "").trim();
        }
      }

      return {
        id: n.id, title: n.title, body, category: n.category,
        authorId: n.author_id, authorName: n.author_name, date: n.created_at,
        reactions: { like: n.likes || [] },
        comments: (commentsByNotice[n.id] || []).map(c => ({ id: c.id, userId: c.user_id, userName: c.user_name, text: c.text, date: c.created_at })),
        isBulletin,
        bulletinType,
        bulletinExpiresAt,
        bulletinDurationHours,
      };
    }),
    dues: (dues || []).map(d => ({
      id: d.id,
      residentId: d.resident_id,
      month: d.month,
      amount: Number(d.amount),
      status: d.status,
      paidDate: d.paid_date,
      ref: d.ref,
      chargeType: d.charge_type || "monthly",
      chargeTitle: d.charge_title || null,
      dueDate: d.due_date || null,
      method: d.method || null,
      discount: Number(d.discount) || 0,
      receivedAmount: d.received_amount != null ? Number(d.received_amount) : null,
      balanceDue: d.balance_due != null ? Number(d.balance_due) : null,
      collectedBy: d.collected_by || null,
      note: d.note || null,
      resolutionNo: d.resolution_no || null,
      category: d.category || null,
    })),
    elections: (elections || []).map(e => ({
      id: e.id, title: e.title, status: e.status, positions: e.positions || [],
      startDate: e.start_date, endDate: e.end_date,
      candidates: (candidatesByElection[e.id] || []).map(c => ({ id: c.id, name: c.name, position: c.position, block: c.block, manifesto: c.manifesto })),
      nominations: (nominationsByElection[e.id] || []).map(n => ({ id: n.id, userId: n.user_id, userName: n.user_name, position: n.position, manifesto: n.manifesto, status: n.status })),
    })),
    votes: (votes || []).map(v => ({ id: v.id, electionId: v.election_id, position: v.position, candidateId: v.candidate_id, voterId: v.voter_id, timestamp: v.created_at })),
    tickets: (tickets || []).map(t => {
      let desc = t.description || "";
      let atts = t.attachments || [];

      if (typeof desc === "string" && desc.includes("<!--KC_ATTACHMENTS-->")) {
        const match = desc.match(/<!--KC_ATTACHMENTS-->([\s\S]*?)<!--\/KC_ATTACHMENTS-->/);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            if (Array.isArray(parsed) && parsed.length > 0) {
              atts = parsed;
            }
          } catch (_) {}
          desc = desc.replace(/<!--KC_ATTACHMENTS-->[\s\S]*?<!--\/KC_ATTACHMENTS-->/, "").trim();
        }
      }

      if ((!atts || atts.length === 0) && typeof t.attachments === "string") {
        try { atts = JSON.parse(t.attachments); } catch (_) {}
      }

      if (!Array.isArray(atts) || atts.length === 0) {
        try {
          const cached = localStorage.getItem(`kc_ticket_att_${t.id}`);
          if (cached) atts = JSON.parse(cached);
        } catch (_) {}
      }

      return {
        id: t.id,
        residentId: t.resident_id,
        residentName: t.resident_name,
        subject: t.subject,
        category: t.category,
        description: desc,
        attachments: Array.isArray(atts) ? atts : [],
        status: t.status,
        response: t.response,
        date: t.created_at,
      };
    }),
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
    // Reverse newest 200 messages in memory so they render in chronological order
    chatMessages: (chatMessages || []).map(m => ({ id: m.id, channel: m.channel, userId: m.user_id, userName: m.user_name, text: m.text, date: m.created_at })).reverse(),
    handoverChecklist: (handoverChecklist || []).map(h => ({ id: h.id, item: h.item, category: h.category, done: h.done, doneBy: h.done_by, doneDate: h.done_date })),
    events: (events || []).map(ev => ({ id: ev.id, title: ev.title, description: ev.description, date: ev.date, location: ev.location, rsvps: (rsvpsByEvent[ev.id] || []).map(r => r.user_id) })),
    inductions: (inductions || []).map(i => ({ id: i.id, name: i.name, position: i.position, date: i.date, electionTitle: i.election_title })),
    expenses: (expenses || []).map(exp => ({
      id: exp.id,
      title: exp.title,
      category: exp.category,
      amount: Number(exp.amount),
      voucherNo: exp.voucher_no || exp.voucherNo,
      payee: exp.payee,
      approvedBy: exp.approved_by || exp.approvedBy,
      date: exp.date,
    })),
    letters: (letters || []).map(l => ({
      id: l.id,
      memoNo: l.memo_no || l.memoNo,
      subject: l.subject,
      recipient: l.recipient,
      body: l.body,
      letterType: l.letter_type || l.letterType || "general",
      signatoryLeftTitle: l.signatory_left_title || l.signatoryLeftTitle,
      signatoryLeftName: l.signatory_left_name || l.signatoryLeftName,
      signatoryRightTitle: l.signatory_right_title || l.signatoryRightTitle,
      signatoryRightName: l.signatory_right_name || l.signatoryRightName,
      issuedBy: l.issued_by || l.issuedBy,
      createdAt: l.created_at,
    })),
    moduleFlags,
  };
}

export async function loadDB() {
  return fetchAll();
}

export async function saveDB() {
  return fetchAll();
}

/* ============================== REALTIME ============================== */

const WATCHED_TABLES = [
  "profiles", "notices", "notice_comments", "dues", "elections", "candidates", "nominations", "votes",
  "tickets", "activity", "emergency_contacts", "agm_events", "agm_resolutions", "agm_attendees", "agm_proxies",
  "amendments", "amendment_votes", "budget_items", "budget_votes", "chat_messages", "handover_checklist",
  "events", "event_rsvps", "inductions", "app_config", "expenses", "letters"
];

export function subscribeDB(onChange) {
  let debounceTimer = null;
  const debouncedFetch = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const fresh = await fetchAll();
        onChange(fresh);
      } catch (err) {
        console.warn("Realtime sync fetch failed:", err);
      }
    }, 450);
  };

  const channel = supabase.channel("kc-realtime");
  WATCHED_TABLES.forEach(table => {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
      debouncedFetch();
    });
  });

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      debouncedFetch();
    }
  });

  // Reconnection and visibility recovery listeners
  const onOnline = () => debouncedFetch();
  const onVisibility = () => {
    if (document.visibilityState === "visible") debouncedFetch();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
  }

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (typeof window !== "undefined") {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
    }
    supabase.removeChannel(channel);
  };
}
