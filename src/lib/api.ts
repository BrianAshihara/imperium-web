const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? `Request failed: ${res.status}`);
  }

  return json;
}

export const api = {
  request,
  get: <T>(path: string, query?: Record<string, string>) => {
    const qs = query ? `?${new URLSearchParams(query)}` : "";
    return request<T>(`${path}${qs}`, { method: "GET" });
  },
  post: <T>(path: string, body?: Record<string, unknown>) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: Record<string, unknown>) =>
    request(path, { method: "PUT", body: JSON.stringify(body ?? {}) }) as Promise<T>,
  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
  setToken(token: string) {
    localStorage.setItem("token", token);
  },
  removeToken() {
    localStorage.removeItem("token");
  },
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  requestId: string;
};
