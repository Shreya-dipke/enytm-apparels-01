
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

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.message
        ? data.message
        : `Request failed with status ${response.status}`
    );
  }

  return data;
}

export default api;
