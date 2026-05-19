/** Shared JWT helpers for localStorage session (client-side expiry/format only). */

export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/** True if token is missing, malformed, or past exp (with optional leeway seconds). */
export function isStoredTokenExpired(leewaySeconds = 0): boolean {
  const token = getStoredToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now + leewaySeconds;
  } catch {
    return true;
  }
}

export function isStoredTokenUsable(): boolean {
  return getStoredToken() !== null && !isStoredTokenExpired();
}
