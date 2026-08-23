// recreate-members.mjs
// Recreates the 13 founding member auth accounts that were broken by raw SQL insertion.
// Run with: node scripts/recreate-members.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env manually
const envPath = resolve(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
const envVars = Object.fromEntries(
  envContent.split("\n")
    .filter(line => line.includes("=") && !line.startsWith("#"))
    .map(line => { const i = line.indexOf("="); return [line.slice(0, i).trim(), line.slice(i + 1).trim()]; })
);

const SUPABASE_URL = envVars["VITE_SUPABASE_URL"];
const SERVICE_KEY = envVars["VITE_SUPABASE_SERVICE_KEY"] || envVars["SUPABASE_SERVICE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_PASSWORD = "Member@2026";

// 13 members whose auth accounts were deleted — recreate with known profile UUIDs
const MEMBERS_TO_CREATE = [
  { id: "242ea4d7-50da-437f-b7eb-e51f366516bf", code: "001", email: "shaheen@kunjachaya.club",  name: "Manjur Morshed Shaheen" },
  { id: "e5e36214-ae8a-4762-a0ba-9d8968daf568", code: "002", email: "aminur@kunjachaya.club",   name: "Aminur Rahman" },
  { id: "6415a505-1c68-41a7-9098-b130ef8d023c", code: "003", email: "zakaria@kunjachaya.club",  name: "Zakaria Hasan" },
  { id: "88e5eeaf-62fc-432c-b52a-4ed15e4dac22", code: "004", email: "afsar@kunjachaya.club",    name: "Md. Nurul Afsar" },
  { id: "473e8da0-c3e8-4692-a8e5-11c9bd6f6995", code: "005", email: "kafil@kunjachaya.club",    name: "Kafil Uddin" },
  { id: "7604f0b8-2265-4351-a00f-c5d4884ab82a", code: "006", email: "azizur@kunjachaya.club",   name: "Md. Azizur Rahman" },
  { id: "1a89a8a7-b39f-4cf7-8920-a1bb3a3a2167", code: "007", email: "mehdi@kunjachaya.club",    name: "Mehdi Hasan Babu" },
  { id: "352f9e27-b903-4453-8de0-536760d32491", code: "008", email: "humayun@kunjachaya.club",  name: "Md. Humayungir Chowdhury" },
  { id: "8ffa7ae0-85cf-4307-ada3-32f957aa6673", code: "009", email: "sourav@kunjachaya.club",   name: "Sourav Ahmad Chowdhury" },
  { id: "cd77a957-83bf-4df7-a333-f651dbf6672a", code: "010", email: "jewel@kunjachaya.club",    name: "Md. Mosleh Uddin Khan Jewel" },
  { id: "64ae6844-7a74-4dc1-aba5-ec552615e720", code: "011", email: "khaled@kunjachaya.club",   name: "Khaled Mahmud" },
  { id: "7d83e9ed-347a-40bb-a654-e02bdf617b33", code: "014", email: "nurnabi@kunjachaya.club",  name: "Md. Nur Nabi" },
  { id: "28233936-93c5-43a1-b52c-bd238ccbe829", code: "013", email: "iqbal@kunjachaya.club",    name: "S. M. Iqbal Bahar" },
];

async function recreateMembers() {
  console.log(`\nRecreating ${MEMBERS_TO_CREATE.length} founding member accounts...`);
  console.log(`Default password: ${DEFAULT_PASSWORD}\n`);

  let success = 0, failed = 0;

  for (const member of MEMBERS_TO_CREATE) {
    // Create via admin API — this properly initializes the GoTrue internal state
    const { data, error } = await supabase.auth.admin.createUser({
      email: member.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,   // skip email confirmation
      user_metadata: { name: member.name },
    });

    if (error) {
      console.error(`FAILED: ${member.email} — ${error.message}`);
      failed++;
      continue;
    }

    const newUid = data.user.id;
    console.log(`CREATED: ${member.email} (new UID: ${newUid})`);

    // Re-link the profiles row to the new UID
    if (newUid !== member.id) {
      console.log(`  → Re-linking profile ${member.id} → ${newUid}`);
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ id: newUid })
        .eq("id", member.id);

      if (profileErr) {
        console.warn(`  ⚠ Profile re-link failed: ${profileErr.message}`);
      } else {
        console.log(`  ✓ Profile re-linked`);
      }
    }

    success++;
  }

  console.log(`\n✅ Done! Created: ${success}, Failed: ${failed}`);
  console.log(`\nAll members can now log in at kc-p2.vercel.app with:`);
  console.log(`Password: ${DEFAULT_PASSWORD}`);
}

recreateMembers().catch(console.error);
