// reset-passwords.mjs
// Run with: node scripts/reset-passwords.mjs
// Requires: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY in .env

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

const MEMBER_EMAILS = [
  "shaheen@kunjachaya.club",
  "khaled@kunjachaya.club",
  "zakaria@kunjachaya.club",
  "nurnabi@kunjachaya.club",
  "iqbal@kunjachaya.club",
  "aminur@kunjachaya.club",
  "afsar@kunjachaya.club",
  "kafil@kunjachaya.club",
  "azizur@kunjachaya.club",
  "mehdi@kunjachaya.club",
  "humayun@kunjachaya.club",
  "sourav@kunjachaya.club",
  "jewel@kunjachaya.club",
  "tanvir@kunjachaya.club",
  "farhana@kunjachaya.club",
  "kamal@kunjachaya.club",
  "sabbir@kunjachaya.club",
  "ruma@kunjachaya.club",
];

// Known UUIDs from auth.users (captured from Supabase dashboard)
const KNOWN_USERS = [
  { id: "242ea4d7-50da-437f-b7eb-e51f366516bf", email: "shaheen@kunjachaya.club" },
  { id: "64ae6844-7a74-4dc1-aba5-ec552615e720", email: "khaled@kunjachaya.club" },
  { id: "6415a505-1c68-41a7-9098-b130ef8d023c", email: "zakaria@kunjachaya.club" },
  { id: "7d83e9ed-347a-40bb-a654-e02bdf617b33", email: "nurnabi@kunjachaya.club" },
  { id: "28233936-93c5-43a1-b52c-bd238ccbe829", email: "iqbal@kunjachaya.club" },
  { id: "e5e36214-ae8a-4762-a0ba-9d8968daf568", email: "aminur@kunjachaya.club" },
  { id: "88e5eeaf-62fc-432c-b52a-4ed15e4dac22", email: "afsar@kunjachaya.club" },
  { id: "473e8da0-c3e8-4692-a8e5-11c9bd6f6995", email: "kafil@kunjachaya.club" },
  { id: "7604f0b8-2265-4351-a00f-c5d4884ab82a", email: "azizur@kunjachaya.club" },
  { id: "1a89a8a7-b39f-4cf7-8920-a1bb3a3a2167", email: "mehdi@kunjachaya.club" },
  { id: "352f9e27-b903-4453-8de0-536760d32491", email: "humayun@kunjachaya.club" },
  { id: "8ffa7ae0-85cf-4307-ada3-32f957aa6673", email: "sourav@kunjachaya.club" },
  { id: "cd77a957-83bf-4df7-a333-f651dbf6672a", email: "jewel@kunjachaya.club" },
  { id: "81019303-e8dd-466b-a17b-baa569b942d1", email: "tanvir@kunjachaya.club" },
  { id: "7697190c-ca58-4f73-a905-4e63cf017a68", email: "farhana@kunjachaya.club" },
  { id: "99f1c4c7-bbe1-4bfe-a235-d18d423a2c2b", email: "kamal@kunjachaya.club" },
  { id: "88113594-47f1-48ee-ad98-b6090831252f", email: "sabbir@kunjachaya.club" },
  { id: "812b42b6-531c-47c1-a456-d9a896fcb0bf", email: "ruma@kunjachaya.club" },
];

async function resetPasswords() {
  console.log(`Resetting passwords for ${KNOWN_USERS.length} members...`);
  console.log(`New password: ${DEFAULT_PASSWORD}\n`);

  let success = 0, failed = 0;

  for (const user of KNOWN_USERS) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password: DEFAULT_PASSWORD });
    if (error) {
      console.error(`FAILED: ${user.email} - ${error.message}`);
      failed++;
    } else {
      console.log(`OK: ${user.email}`);
      success++;
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}`);
  console.log(`All members can now log in with: ${DEFAULT_PASSWORD}`);
}

resetPasswords().catch(console.error);
