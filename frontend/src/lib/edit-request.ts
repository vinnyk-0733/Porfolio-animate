// The password stays in browser memory and is sent only to this site's save API.
// Encoding supports Unicode passwords in an HTTP header; HTTPS protects transit.
export function sendEditRequest(url: string, password: string, init: RequestInit = {}): Promise<Response> {
  const target = new URL(url, window.location.origin);
  if (target.origin !== window.location.origin || !target.pathname.startsWith("/api/")) {
    throw new Error("Edits must be saved to this website.");
  }
  const headers = new Headers(init.headers);
  headers.set("x-edit-password", btoa(String.fromCharCode(...new TextEncoder().encode(password))));
  return fetch(target.pathname + target.search, {
    ...init,
    headers,
    credentials: "omit",
    redirect: "error",
    cache: "no-store",
  });
}
