export async function apiRequest(path, { token, refresh, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include"
  });

  if (response.status === 401 && refresh) {
    const nextToken = await refresh();
    if (nextToken) {
      return apiRequest(path, { token: nextToken, ...options });
    }
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}
