// Minimal API helper to use DRF token auth
const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export function setToken(token, persist = true) {
  // persist=true -> localStorage (remember me)
  // persist=false -> sessionStorage (current session only)
  if (token) {
    if (persist) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
    }
  } else {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
}

export function getToken() {
  // prefer localStorage (remembered) but fall back to sessionStorage
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export async function apiFetch(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  const token = getToken();
  if (token) headers['Authorization'] = `Token ${token}`;
  if (!headers['Content-Type'] && options.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(API_BASE + path, { ...options, headers });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null }; }
  catch (e) { return { ok: res.ok, status: res.status, data: text }; }
}

export async function obtainToken(identifier, password) {
  // identifier can be username or email. If it looks like an email, use the email endpoint.
  if (identifier && identifier.includes('@')) {
    // try email-based login first
    const res = await fetch(API_BASE + '/api/token-auth-email/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }
    // fallback: try username derived from the email local-part (useful for demo users like admin@... -> username 'admin')
    try {
      const usernameFallback = identifier.split('@')[0];
      const res2 = await fetch(API_BASE + '/api-token-auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(usernameFallback)}&password=${encodeURIComponent(password)}`
      });
      if (res2.ok) {
        const data2 = await res2.json();
        return { ok: true, data: data2 };
      }
      // return original email-endpoint error if fallback failed
      return { ok: false, status: res.status, data: await res.text() };
    } catch (e) {
      return { ok: false, status: res.status, data: await res.text() };
    }
  }

  const res = await fetch(API_BASE + '/api-token-auth/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`
  });
  if (!res.ok) return { ok: false, status: res.status, data: await res.text() };
  const data = await res.json();
  return { ok: true, data };
}

export async function fetchMe() {
  return apiFetch('/api/me/');
}

export default { apiFetch, obtainToken, fetchMe, setToken, getToken };

