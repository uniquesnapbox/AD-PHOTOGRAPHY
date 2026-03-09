export const ADMIN_STORAGE_KEY = "ad_admin_auth";
export const ADMIN_AUTH_EVENT = "ad-admin-auth-changed";

function notifyAdminAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
  }
}

export function getStoredAdminAuth() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ? parsed : null;
  } catch {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    return null;
  }
}

export function getStoredAdminToken() {
  return getStoredAdminAuth()?.token || "";
}

export function clearStoredAdminAuth() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  notifyAdminAuthChanged();
}

export function setStoredAdminAuth(value) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(value));
  notifyAdminAuthChanged();
}
