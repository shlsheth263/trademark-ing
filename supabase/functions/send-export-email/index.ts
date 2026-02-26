import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, format, reportType } = await req.json();

    if (!email || !format) {
      return new Response(
        JSON.stringify({ error: "Email and format are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formatLabel = format === "pdf" ? "PDF" : "Excel";
    const reportLabel = reportType || "Image Search Report";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background-color:#1a2b5f;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">TrademarkING</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#1a2b5f;font-size:20px;">Export Report Request Received</h2>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
              Your export request has been received and is being processed. You will receive your report shortly.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc;border-radius:6px;border:1px solid #e2e6ef;margin-bottom:24px;">
              <tr>
                <td style="padding:20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;width:140px;">Report Type</td>
                      <td style="padding:6px 0;color:#333;font-size:14px;font-weight:600;">${reportLabel}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#888;font-size:13px;">Export Format</td>
                      <td style="padding:6px 0;color:#333;font-size:14px;">${formatLabel}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">
              If you did not request this export, please disregard this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f8f9fc;padding:24px 40px;border-top:1px solid #e2e6ef;text-align:center;">
            <p style="margin:0 0 4px;color:#999;font-size:12px;">This is an automated message from TrademarkING.</p>
            <p style="margin:0;color:#999;font-size:12px;">Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TrademarkING <onboarding@resend.dev>",
        to: [email],
        subject: `Your ${reportLabel} (${formatLabel}) is being prepared`,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(
        JSON.stringify({ error: result.message || "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
