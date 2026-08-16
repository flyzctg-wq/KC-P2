// src/lib/authBridge.js
//
// Same fix as the Firebase version's authBridge.js — credentials are
// verified by Supabase Auth (GoTrue), which hashes with bcrypt
// server-side, never by comparing a stored plaintext password. The
// profile object handed back never has a password field, on the
// client or in Postgres.

import { supabase } from "./supabase";

export async function signUpResident({ name, email, password, phone, block, unit }) {
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) throw new Error(error.message);
  return {
    id: data.user.id,
    name, email: email.trim(), phone, block, unit,
    role: "resident", post: null, status: "pending",
    memberClass: "New", joinedDate: new Date().toISOString(), permissions: {},
  };
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error("Invalid email or password.");
  return data.user.id;
}

export async function signOutUser() {
  await supabase.auth.signOut();
}
