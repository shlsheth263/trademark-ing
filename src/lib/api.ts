import { supabase } from "@/integrations/supabase/client";
import { type SimilarMark, type Application } from "./mock-data";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const TRADEMARK_IMAGES_BUCKET = "trademark-images";

// Build public URL for a trademark image stored in the storage bucket
function getTrademarkImageUrl(filename: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${TRADEMARK_IMAGES_BUCKET}/${filename}`;
}

// Call real backend API for similarity check
export async function checkSimilarity(formData: FormData): Promise<SimilarMark[]> {
  const apiFormData = new FormData();
  const logoFile = formData.get("logo_image");
  if (logoFile) apiFormData.append("file", logoFile);

  const { data, error } = await supabase.functions.invoke("similarity-proxy", {
    body: apiFormData,
  });
  if (error) throw new Error("Similarity check failed");
  return (data.results || []).map((r: { filename: string; final_score: number }, i: number) => ({
    id: `result-${i}`,
    trademarkId: r.filename.replace(/\.\w+$/, ""),
    similarity: Math.round(r.final_score * 10) / 10,
    imageUrl: getTrademarkImageUrl(r.filename),
    name: r.filename,
  }));
}

// Call real backend API for explore similarity
export async function exploreSimilarity(formData: FormData): Promise<SimilarMark[]> {
  const apiFormData = new FormData();
  const logoFile = formData.get("logo_image");
  if (logoFile) apiFormData.append("file", logoFile);

  const { data, error } = await supabase.functions.invoke("similarity-proxy", {
    body: apiFormData,
  });
  if (error) throw new Error("Explore similarity failed");
  return (data.results || []).map((r: { filename: string; final_score: number }, i: number) => ({
    id: `explore-${i}`,
    trademarkId: r.filename.replace(/\.\w+$/, ""),
    similarity: Math.round(r.final_score * 10) / 10,
    imageUrl: getTrademarkImageUrl(r.filename),
    name: r.filename,
  }));
}

// Upload logo to storage
export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("application-logos")
    .upload(fileName, file, { contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("application-logos").getPublicUrl(fileName);
  return data.publicUrl;
}

// Submit application to DB
export async function submitApplication(data: {
  businessName: string;
  applicantName: string;
  contactNumber: string;
  email: string;
  category: string;
  logoText?: string;
  logoUrl: string;
}): Promise<{ applicationId: string }> {
  // Check if user is logged in to set user_id accordingly
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  const { data: result, error } = await supabase
    .from("applications")
    .insert({
      business_name: data.businessName,
      applicant_name: data.applicantName,
      contact_number: data.contactNumber,
      email: data.email,
      category: data.category,
      logo_text: data.logoText || "",
      logo_url: data.logoUrl,
      status: "submitted",
      user_id: userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { applicationId: result.id };
}

// Track application status (public, by email + id)
export async function getApplicationStatus(email: string, id: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapDbApp(data);
}

// Agent: get all applications, optionally filtered
export async function getApplications(status?: string): Promise<Application[]> {
  let query = supabase.from("applications").select("*").order("submitted_at", { ascending: false });
  if (status && status !== "all") {
    query = query.eq("status", status as "submitted" | "approved" | "rejected");
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapDbApp);
}

// Agent: get single application with similar marks
export async function getApplicationById(id: string): Promise<Application & { similarMarks: SimilarMark[] }> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  // Similar marks will be populated when the agent triggers a similarity check
  return { ...mapDbApp(data), similarMarks: [] };
}

// Agent: submit decision
export async function submitDecision(
  applicationId: string,
  decision: "approved" | "rejected",
  notes: string,
): Promise<void> {
  // Get current status for history
  const { data: current } = await supabase
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .single();

  const { data: { user } } = await supabase.auth.getUser();

  // Update application
  const { error: updateError } = await supabase
    .from("applications")
    .update({
      status: decision,
      agent_notes: notes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id || null,
    })
    .eq("id", applicationId);
  if (updateError) throw updateError;

  // Insert status history
  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    old_status: (current?.status as "submitted" | "approved" | "rejected") || "submitted",
    new_status: decision,
    notes,
    changed_by: user?.id || null,
  });
}

// Map DB row to Application type
function mapDbApp(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    businessName: row.business_name as string,
    applicantName: row.applicant_name as string,
    contactNumber: row.contact_number as string,
    email: row.email as string,
    category: row.category as string,
    logoText: (row.logo_text as string) || "",
    logoUrl: (row.logo_url as string) || "",
    submissionDate: new Date(row.submitted_at as string).toISOString().split("T")[0],
    status: row.status as "submitted" | "approved" | "rejected",
    agentNotes: (row.agent_notes as string) || "",
  };
}

// Re-export types
export type { SimilarMark, Application } from "./mock-data";
