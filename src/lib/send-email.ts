import { supabase } from "@/integrations/supabase/client";

/**
 * Send an email via the send-export-email edge function
 * which proxies to the EC2 /send-email API.
 */
export async function sendEmail(params: {
  receiver_email: string;
  subject: string;
  body: string;
}): Promise<void> {
  const { error } = await supabase.functions.invoke("send-export-email", {
    body: params,
  });
  if (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
