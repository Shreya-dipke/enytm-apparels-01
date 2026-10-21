
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function api(path, options = {}) {
  const isAdmin = path.startsWith("/admin");

  const token = isAdmin
    ? localStorage.getItem("enytm-admin")
    : localStorage.getItem("enytm-token");

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] ??= "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const endpoint = `${API_BASE}/api${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.message
        ? data.message
        : `Request failed with status ${response.status}`
    );
  }

  // If the server returned HTML (e.g. 404/200 rewrite to index.html on SPA hosting like Vercel),
  // treat it as an error so that callers fall back to fallback data instead of crashing on raw HTML strings.
  if (typeof data === "string" && (data.includes("<!DOCTYPE") || data.includes("<!doctype") || data.includes("<html"))) {
    throw new Error("Received HTML page instead of API response");
  }

  return data;
}

export default api;
