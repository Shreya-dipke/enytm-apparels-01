const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "";
export const API = BASE_URL ? `${BASE_URL}/api` : "/api";

export async function api(path, options = {}) {
  const isAdmin = path.startsWith("/admin");
  const token = isAdmin ? localStorage.getItem("enytm-admin") : localStorage.getItem("enytm-token");
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try { res = await fetch(`${API}${path}`, { ...options, headers }); }
  catch { throw new Error("Unable to connect to ENYTM server. Please check that the server is running."); }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    if (isAdmin) localStorage.removeItem("enytm-admin");
    else { localStorage.removeItem("enytm-token"); localStorage.removeItem("enytm-user"); }
    throw new Error(data.message || "Your session has expired. Please login again.");
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status}). Please try again.`);
  return data;
}
