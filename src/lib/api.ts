import { BASE_URL } from "@/config/api";
import { mockSimilarMarks, mockApplications, type SimilarMark, type Application } from "./mock-data";

const USE_MOCK = true; // Toggle to false when real backend is available

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = sessionStorage.getItem("agent_token");
  const headers: HeadersInit = { ...options?.headers };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

export async function checkSimilarity(formData: FormData): Promise<SimilarMark[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000));
    return mockSimilarMarks;
  }
  return request("/api/check-similarity", { method: "POST", body: formData });
}

export async function submitApplication(data: Record<string, unknown>): Promise<{ applicationId: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    return { applicationId: `APP-${Date.now()}` };
  }
  return request("/api/submit-application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function exploreSimilarity(formData: FormData): Promise<SimilarMark[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000));
    return Array.from({ length: 20 }, (_, i) => ({
      id: `explore-${i}`,
      trademarkId: `TM-${String(2024100 + i)}`,
      similarity: Math.round((90 - i * 3.2) * 10) / 10,
      imageUrl: `https://placehold.co/200x200/1a365d/ffffff?text=E${i + 1}`,
      name: `Mark ${i + 1}`,
    }));
  }
  return request("/api/explore-similarity", { method: "POST", body: formData });
}

export async function getApplicationStatus(email: string, id: string): Promise<Application | null> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    return mockApplications.find((a) => a.id === id && a.email === email) || null;
  }
  return request(`/api/application-status?email=${encodeURIComponent(email)}&id=${encodeURIComponent(id)}`);
}

export async function agentLogin(userId: string, password: string): Promise<{ token: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    if (userId === "agent" && password === "password") {
      return { token: "mock-agent-token-123" };
    }
    throw new Error("Invalid credentials");
  }
  return request("/api/agent-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, password }),
  });
}

export async function getApplications(status?: string): Promise<Application[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    if (status && status !== "all") {
      return mockApplications.filter((a) => a.status === status);
    }
    return mockApplications;
  }
  return request(`/api/applications${status ? `?status=${status}` : ""}`);
}

export async function getApplicationById(id: string): Promise<Application & { similarMarks: SimilarMark[] }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    const app = mockApplications.find((a) => a.id === id);
    if (!app) throw new Error("Application not found");
    return { ...app, similarMarks: mockSimilarMarks };
  }
  return request(`/api/applications/${id}`);
}

export async function submitDecision(
  applicationId: string,
  decision: "approved" | "rejected",
  notes: string,
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return;
  }
  await request("/api/agent-decision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ applicationId, decision, notes }),
  });
}
