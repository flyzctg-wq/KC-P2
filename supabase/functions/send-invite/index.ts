// supabase/functions/send-invite/index.ts
// Sends a branded HTML invitation email via Gmail SMTP
// Invoke: supabase.functions.invoke('send-invite', { body: { email, name, inviteLink, invitedBy, block, unit, memberClass } })

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, inviteLink, invitedBy, block, unit, memberClass } = await req.json();

    if (!email || !name || !inviteLink) {
      return new Response(JSON.stringify({ error: "Missing required fields: email, name, inviteLink" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SMTP credentials stored in Supabase project secrets
    const smtpHost   = Deno.env.get("SMTP_HOST")     ?? "smtp.gmail.com";
    const smtpPort   = Number(Deno.env.get("SMTP_PORT") ?? "465");
    const smtpUser   = Deno.env.get("SMTP_USER")     ?? "";
    const smtpPass   = Deno.env.get("SMTP_PASS")     ?? "";
    const senderName = Deno.env.get("SMTP_FROM_NAME") ?? "Kunjachaya Club";

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: { username: smtpUser, password: smtpPass },
      },
    });

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8f9fa;">
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;">

  <div style="background:linear-gradient(135deg,#1a472a 0%,#2d6a4f 100%);border-radius:12px 12px 0 0;padding:32px 24px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">🏡 কুঞ্জছায়া ক্লাব</h1>
    <p style="color:#a8d5b5;margin:6px 0 0;font-size:13px;">Kunjachaya Residential Club — Official Invitation</p>
  </div>

  <div style="background:#ffffff;padding:36px 32px;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;">
    <div style="background:#f0faf4;border:1px solid #a8d5b5;border-radius:8px;padding:14px 18px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;color:#1a472a;font-weight:bold;font-size:15px;">🎉 আপনাকে স্বাগতম! You are officially invited!</p>
    </div>

    <h2 style="color:#1a472a;font-size:20px;margin:0 0 8px;">Dear ${name},</h2>
    <p style="color:#444;line-height:1.7;margin:0 0 8px;">
      <strong>${invitedBy}</strong> has officially invited you to join the <strong>Kunjachaya Club</strong> residential management platform.
    </p>

    <table style="background:#f8f9fa;border-radius:8px;padding:14px 18px;margin:16px 0;width:100%;border-collapse:collapse;font-size:13px;color:#555;">
      ${block ? `<tr><td style="padding:4px 8px;font-weight:bold;color:#1a472a;">Block</td><td style="padding:4px 8px;">${block}</td></tr>` : ""}
      ${unit ? `<tr><td style="padding:4px 8px;font-weight:bold;color:#1a472a;">Unit</td><td style="padding:4px 8px;">${unit}</td></tr>` : ""}
      ${memberClass ? `<tr><td style="padding:4px 8px;font-weight:bold;color:#1a472a;">Membership Class</td><td style="padding:4px 8px;">${memberClass}</td></tr>` : ""}
    </table>

    <p style="color:#444;line-height:1.7;margin:0 0 24px;">
      Click the button below to set your password and activate your account immediately — no additional approval required.
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${inviteLink}"
         style="background:#1a472a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
        🔑 Accept Invitation &amp; Set Password
      </a>
    </div>

    <p style="color:#aaa;font-size:12px;line-height:1.6;margin:20px 0 0;word-break:break-all;">
      Or copy this link: <a href="${inviteLink}" style="color:#2d6a4f;">${inviteLink}</a>
    </p>

    <p style="color:#888;font-size:13px;line-height:1.6;margin:16px 0 0;">
      If you were not expecting this invitation, you can safely ignore this email.
    </p>
  </div>

  <div style="background:#f0f4f0;border-radius:0 0 12px 12px;padding:20px 24px;text-align:center;border:1px solid #e0e0e0;border-top:none;">
    <p style="color:#888;font-size:12px;margin:0;">
      কুঞ্জছায়া আবাসিক এলাকা, চট্টগ্রাম<br>
      <a href="https://kc-p2.vercel.app" style="color:#2d6a4f;text-decoration:none;">kc-p2.vercel.app</a>
    </p>
  </div>

</div>
</body>
</html>`;

    await client.send({
      from: `${senderName} <${smtpUser}>`,
      to: email,
      subject: `You've been officially invited to Kunjachaya Club`,
      html: htmlBody,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true, sent_to: email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-invite error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
