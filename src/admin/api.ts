/**
 * Klijent za PHP API admina (public/admin/api/*.php).
 * Lokalni razvoj: NEXT_PUBLIC_ADMIN_API=http://localhost:8080/admin/api (PHP server) + dev_origin u configu.
 */
export const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API ?? "/admin/api";

let csrf = "";
let onUnauthorized: () => void = () => {};

export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: Record<string, unknown> | null,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_BASE + path, {
      credentials: "include",
      cache: "no-store",
      ...init,
      headers: { "X-CSRF-Token": csrf, ...(init.headers ?? {}) },
    });
  } catch {
    throw new ApiError("Nema veze sa serverom. Provjerite internet i pokušajte ponovo.", 0, null);
  }
  let data: Record<string, unknown> | null = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/auth.php")) onUnauthorized();
    throw new ApiError(String(data?.error ?? `Greška ${res.status}`), res.status, data);
  }
  return data as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export type Session = {
  authenticated: boolean;
  configured?: boolean;
  csrf: string;
  tokenSet: boolean | null;
  repo: string | null;
  branch: string | null;
};
export type RepoFile = { path: string; sha: string; content: string };
export type SaveResult = { ok: true; commit: string; files: Record<string, string>; uploads: number };
export type MediaItem = { path: string; size: number; pending: boolean };
export type Run = {
  id: number;
  status: "queued" | "in_progress" | "completed" | "waiting" | "requested" | "pending";
  conclusion: string | null;
  title: string;
  created: string;
  updated: string;
  url: string;
  commit: string;
  deploy: "uspjeh" | "preskočeno" | "greška" | null;
};
export type Settings = {
  repo: string;
  branch: string;
  tokenSet: boolean;
  tokenCheck: { ok: boolean; message: string } | null;
  log: { t: string; ip: string; e: string; d: string }[];
};

export const api = {
  async session() {
    const s = await get<Session>("/auth.php");
    csrf = s.csrf;
    return s;
  },
  async login(password: string) {
    const s = await post<Session>("/auth.php", { action: "login", password });
    csrf = s.csrf;
    return s;
  },
  logout: () => post<{ ok: true }>("/auth.php", { action: "logout" }),

  file: (path: string) => get<RepoFile>(`/content.php?path=${encodeURIComponent(path)}`),
  dir: (dir: string) => get<{ files: RepoFile[] }>(`/content.php?dir=${encodeURIComponent(dir)}`),
  save: (body: {
    message: string;
    files?: { path: string; content: string; baseSha?: string | null }[];
    deletes?: { path: string; baseSha?: string }[];
    force?: boolean;
  }) => post<SaveResult>("/content.php", body),

  media: (fresh = false) => get<{ items: MediaItem[] }>(`/media.php?action=list${fresh ? "&fresh=1" : ""}`),
  async upload(file: Blob, name: string) {
    const fd = new FormData();
    fd.append("action", "upload");
    fd.append("name", name);
    fd.append("file", file, name);
    return request<{ path: string; width: number; height: number; size: number; pending: true }>("/media.php", {
      method: "POST",
      body: fd,
    });
  },
  discard: (path: string) => post<{ ok: true }>("/media.php", { action: "discard", path }),
  imgUrl: (path: string, w: 160 | 400 | 1200 | 0 = 400) =>
    `${API_BASE}/media.php?action=img&w=${w}&path=${encodeURIComponent(path)}`,

  status: () => get<{ runs: Run[] }>("/status.php"),
  settings: () => get<Settings>("/settings.php"),
  setPassword: (current: string, password: string) => post<{ ok: true }>("/settings.php", { action: "password", current, password }),
  setToken: (token: string) => post<{ ok: true }>("/settings.php", { action: "token", token }),
};
