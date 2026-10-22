const API_BASE = "/api/v1";

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: async (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(err.detail || "Login failed");
    }
    return res.json() as Promise<{ access_token: string }>;
  },

  me: () => apiFetch("/auth/me"),
};

export const projectsApi = {
  list: () => apiFetch("/projects"),
  create: (data: { name: string; description?: string }) =>
    apiFetch("/projects", { method: "POST", body: JSON.stringify(data) }),
  get: (id: number) => apiFetch(`/projects/${id}`),
  createConfig: (projectId: number, data: any) =>
    apiFetch(`/projects/${projectId}/configurations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  confirmConfig: (projectId: number, configId: number) =>
    apiFetch(`/projects/${projectId}/configurations/${configId}/confirm`, {
      method: "POST",
    }),
};
