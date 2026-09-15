export const API_BASE = "http://localhost:8000/api";

export function getToken() {
  return localStorage.getItem("hiremind_token");
}
export function setToken(token) {
  localStorage.setItem("hiremind_token", token);
}
export function clearAuth() {
  localStorage.removeItem("hiremind_token");
  localStorage.removeItem("hiremind_user");
}
export function getUser() {
  const raw = localStorage.getItem("hiremind_user");
  return raw ? JSON.parse(raw) : null;
}
export function setUser(user) {
  localStorage.setItem("hiremind_user", JSON.stringify(user));
}

export async function apiRequest(path, { method = "GET", body = null, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isForm && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const errJson = await res.json();
      detail = errJson.detail || detail;
    } catch (_) {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function homeRouteForRole(role) {
  if (role === "recruiter") return "/recruiter";
  if (role === "admin") return "/admin";
  return "/candidate";
}
