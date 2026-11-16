const base = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export const apiUrl = (path) => path.startsWith("/uploads/") ? base + path : path;

export async function api(path, options = {}, token = "") {
  const response = await fetch(base + path, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
