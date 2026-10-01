function resolveApiBase() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
  let clean = envUrl.trim().replace(/\/+$/, "");
  if (!clean.endsWith("/api")) {
    clean = clean + "/api";
  }
  return clean;
}

const API_BASE = resolveApiBase();

export async function fetchAPI(endpoint, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("resumeiq_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(errorData.detail || "API request failed");
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data) => fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) => fetchAPI("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => fetchAPI("/auth/me"),
  logout: () => fetchAPI("/auth/logout", { method: "POST" }),

  // Resumes
  getResumes: () => fetchAPI("/resumes"),
  getResume: (id) => fetchAPI(`/resumes/${id}`),
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("resumeiq_token") : null;
    const response = await fetch(`${API_BASE}/resumes/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    return response.json();
  },
  deleteResume: (id) => fetchAPI(`/resumes/${id}`, { method: "DELETE" }),

  // Candidates
  getCandidates: () => fetchAPI("/candidates"),
  getCandidate: (id) => fetchAPI(`/candidates/${id}`),
  deleteCandidate: (id) => fetchAPI(`/candidates/${id}`, { method: "DELETE" }),
  clearCandidates: () => fetchAPI(`/candidates/clear`, { method: "DELETE" }),
  getCandidateSuitability: (id) => fetchAPI(`/candidates/${id}/suitability`),
  exportCandidate: (id, format = "json") => `${API_BASE}/candidates/${id}/export?format=${format}`,

  // Jobs
  getJobs: () => fetchAPI("/jobs"),
  getJob: (id) => fetchAPI(`/jobs/${id}`),
  createJob: (data) => fetchAPI("/jobs", { method: "POST", body: JSON.stringify(data) }),
  analyzeJob: (id) => fetchAPI(`/jobs/${id}/analyze`, { method: "POST" }),
  updateJob: (id, data) => fetchAPI(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  screenJob: (id) => fetchAPI(`/jobs/${id}/screen`, { method: "POST" }),
  deleteJob: (id) => fetchAPI(`/jobs/${id}`, { method: "DELETE" }),

  // Match & Ranking
  matchCandidates: (data) => fetchAPI("/match", { method: "POST", body: JSON.stringify(data) }),
  getMatch: (id) => fetchAPI(`/match/${id}`),
  screenResumeAgainstJob: (data) => fetchAPI('/match/screen-resume', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics & Assistant
  getAnalytics: () => fetchAPI("/analytics"),
  searchCandidates: (query, min_score = 0) => fetchAPI("/search", { method: "POST", body: JSON.stringify({ query, min_score }) }),
  askAIAssistant: (query) => fetchAPI("/ai/analyze", { method: "POST", body: JSON.stringify({ query }) }),
  getModelEvaluation: () => fetchAPI("/evaluation"),
  getHistory: () => fetchAPI("/history"),
  getSettings: () => fetchAPI("/settings")
};
