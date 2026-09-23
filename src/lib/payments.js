// src/lib/payments.js
//
// Dues payment initiation via PipraPay Edge Function checkout.

import { supabase } from "./supabase";

export async function startDuesPayment({ dueId, residentId, amount, month }) {
  // 15-second timeout guard to prevent hung payment requests
  const timeoutMs = 15000;
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Payment request timed out. Please check your network and try again.")), timeoutMs)
  );

  const invokePromise = supabase.functions.invoke("piprapay-checkout", {
    body: { dueId, residentId, amount, month },
  });

  const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

  if (error) throw new Error(error.message || "Could not start payment. Please try again.");
  if (!data?.checkoutUrl) throw new Error("Payment provider did not return a checkout link.");

  // URL security validation: enforce HTTPS protocol
  let parsedUrl;
  try {
    parsedUrl = new URL(data.checkoutUrl);
  } catch (_) {
    throw new Error("Invalid payment gateway URL received.");
  }

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Insecure payment gateway redirect blocked (HTTPS required).");
  }

  window.location.href = data.checkoutUrl;
}
