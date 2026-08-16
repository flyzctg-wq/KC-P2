// src/lib/payments.js
//
// Replaces the demo "instant pay" button with a real checkout flow.
// The client never talks to PipraPay directly (that needs a secret API
// key it must never see) — it calls the piprapay-checkout Edge
// Function, which returns a checkout URL to redirect to. The due only
// actually gets marked "paid" later, by piprapay-webhook, once
// PipraPay confirms the charge — see kunjachaya-supabase/functions/.
//
// This can't be tested from this sandbox (no live Supabase project,
// no PipraPay credentials) — it's written to the same contract the
// Edge Function expects, verified by reading, not by running.

import { supabase } from "./supabase";

export async function startDuesPayment({ dueId, residentId, amount, month }) {
  const { data, error } = await supabase.functions.invoke("piprapay-checkout", {
    body: { dueId, residentId, amount, month },
  });
  if (error) throw new Error(error.message || "Could not start payment. Please try again.");
  if (!data?.checkoutUrl) throw new Error("Payment provider did not return a checkout link.");
  window.location.href = data.checkoutUrl; // resident completes payment on PipraPay's page
}
