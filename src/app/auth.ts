// Credentials & authenticated fetch helpers for the FlareDrive SPA.
//
// Why this exists: the WebDAV backend (functions/webdav/[[path]].ts) guards every
// method with Basic auth. The browser's native 401 auth prompt only fires for
// top-level navigations, NOT for fetch/XHR/img/sub-resource requests — so the SPA's
// fetch calls just failed with "Failed to fetch". We carry the credentials ourselves
// and inject the Authorization header on every WebDAV request (fetch, XHR upload,
// thumbnail <img>, download). A 401 anywhere broadcasts a global event so the App
// can surface the login dialog regardless of which call hit it.

const STORAGE_KEY = "flaredrive-credentials";
export const AUTH_REQUIRED_EVENT = "flaredrive:auth-required";

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthRequiredError";
  }
}

export interface Credentials {
  user: string;
  pass: string;
}

export function getCredentials(): Credentials | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { user, pass } = JSON.parse(raw);
    if (!user || !pass) return null;
    return { user, pass };
  } catch {
    return null;
  }
}

export function saveCredentials(user: string, pass: string) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user, pass }));
}

export function clearCredentials() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function basicAuthHeader(): string | null {
  const c = getCredentials();
  if (!c) return null;
  return "Basic " + btoa(`${c.user}:${c.pass}`);
}

/** Merge an Authorization header into a RequestInit (does not mutate the caller's headers). */
function withAuth(init: RequestInit = {}): RequestInit {
  const auth = basicAuthHeader();
  if (!auth) return init;
  const headers = new Headers(init.headers || undefined);
  headers.set("Authorization", auth);
  return { ...init, headers };
}

/** Report a 401 globally so any call site (img, download, fetch) triggers the login dialog. */
function reportAuthRequired() {
  clearCredentials();
  window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT));
}

/** fetch wrapper that injects Basic auth and turns 401 into AuthRequiredError. */
export async function authFetch(
  url: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, withAuth(init));
  if (res.status === 401) {
    reportAuthRequired();
    throw new AuthRequiredError();
  }
  return res;
}

/** Fetch a WebDAV resource as a blob URL (for <img> thumbnails and downloads). */
export async function fetchAuthBlobUrl(path: string): Promise<string> {
  const res = await authFetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
