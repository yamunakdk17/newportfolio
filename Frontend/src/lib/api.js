const base = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export function imageUrl(path) {
  if (typeof path !== "string" || !path.trim() || /^blob:|^data:/i.test(path)) return "";
  const value = path.trim();
  if (/^(https?:)?\/\//i.test(value)) return value;
  return `${base}/${value.replace(/^\/+/, "")}`;
}

export const apiUrl = imageUrl;

export async function api(path, options = {}, token = "") {
  let response;
  try {
    const savedToken = path.startsWith("/api/admin/")
      ? sessionStorage.getItem("admin-token") || ""
      : "";
    response = await fetch(base + path, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token || savedToken ? { Authorization: "Bearer " + (token || savedToken) } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Unable to reach the portfolio server. Check that the backend is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path.startsWith("/api/admin/")) {
      try {
        sessionStorage.removeItem("admin-token");
      } catch {
        /* Storage may be unavailable; the current request remains rejected. */
      }
    }
    const message = typeof data.error === "string" ? data.error : "";
    const error = new Error(response.status >= 500
      ? "The request could not be completed. Please try again later."
      : message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}
