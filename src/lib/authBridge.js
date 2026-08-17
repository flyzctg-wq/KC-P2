// src/lib/authBridge.js
//
// Same fix as the Firebase version's authBridge.js — credentials are
// verified by Supabase Auth (GoTrue), which hashes with bcrypt
// server-side, never by comparing a stored plaintext password. The
// profile object handed back never has a password field, on the
// client or in Postgres.

import { supabase } from "./supabase";
import { getAppBaseUrl } from "../utils";

export async function signUpResident({ name, email, password, phone, block, unit, bloodGroup, idNumber, status = "pending", memberClass = "New", invitedBy = null, inviteCode = null }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      // Always redirect to the live Vercel app — never localhost — even if the
      // Supabase dashboard Site URL is still set to localhost.
      emailRedirectTo: `${getAppBaseUrl()}/`,
      data: {
        name,
        phone: phone?.trim() || "",
        block,
        unit,
        blood_group: bloodGroup || "",
        id_number: idNumber || "",
      },
    },
  });
  if (error) throw new Error(error.message);

  const userId = data.user?.id || (await supabase.auth.getSession())?.data?.session?.user?.id;
  if (!userId) {
    throw new Error("Unable to create user session. Please check if email confirmation is enabled.");
  }

  const newProfile = {
    id: userId,
    name,
    email: email.trim(),
    phone: phone?.trim() || "",
    block,
    unit,
    role: "resident",
    post: null,
    status: status || "pending",
    memberClass: memberClass || "New",
    bloodGroup: bloodGroup || "",
    donor: false,
    joinedDate: new Date().toISOString(),
    invitedBy: invitedBy || null,
    inviteCode: inviteCode || null,
    permissions: {
      formDetails: {
        idType: "NID",
        idNumber: idNumber || "",
        dob: "",
        gender: "male",
        profession: "",
        education: "",
        religion: "Islam",
        houseNo: "",
        roadNo: "",
        area: "কুঞ্জছায়া আবাসিক এলাকা",
        floorNo: "",
        holdingNo: "",
        wardNo: "২নং জালালাবাদ",
        thana: "বায়েজীদ বোস্তামী",
        district: "চট্টগ্রাম",
        altPhone: "",
        fatherName: "",
        motherName: "",
        spouseName: "",
        photoUrl: "",
        pledgeAccepted: true,
      },
    },
  };

  // Attempt direct profiles table sync as well
  try {
    await supabase.from("profiles").upsert({
      id: userId,
      name,
      email: email.trim(),
      phone: phone?.trim() || "",
      block,
      unit,
      role: "resident",
      post: null,
      status: status || "pending",
      member_class: memberClass || "New",
      blood_group: bloodGroup || "",
      donor: false,
      permissions: newProfile.permissions,
    });
  } catch (err) {
    console.warn("Profile sync error on signup:", err);
  }

  return newProfile;
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error("Invalid email or password.");
  return data.user.id;
}

export async function signOutUser() {
  await supabase.auth.signOut();
}
