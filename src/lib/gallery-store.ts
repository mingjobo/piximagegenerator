// 简易版 Gallery 存储：
// - 会话：置顶集合 + 置顶截止时间（sessionStorage）
// - 持久：top12（12条）+ page1（4条）+ lastSyncAt（localStorage）

import type { Work } from "@/components/blocks/work-card";
import { idbGet, idbSet, idbRemove } from "@/lib/idb";

const SS_KEYS = {
  pinned: "gallery.pinned", // Work[]（含占位和确认）
  pinUntil: "gallery.pinUntil", // number (timestamp ms)
};

const LS_KEYS = {
  top12: "gallery.top12", // Work[]
  page1: "gallery.page1", // Work[] (4)
  lastSyncAt: "gallery.lastSyncAt", // number (timestamp ms)
  nextCursor: "gallery.nextCursor", // string | null
  hasMore: "gallery.hasMore", // boolean as string
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Session: pinned / pinUntil
export function loadPinned(): Work[] {
  if (typeof window === "undefined") return [];
  return safeParse<Work[]>(sessionStorage.getItem(SS_KEYS.pinned), []);
}

export function savePinned(list: Work[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SS_KEYS.pinned, JSON.stringify(list));
}

export function loadPinUntil(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SS_KEYS.pinUntil);
  return raw ? Number(raw) : null;
}

export function savePinUntil(ts: number | null) {
  if (typeof window === "undefined") return;
  if (ts == null) sessionStorage.removeItem(SS_KEYS.pinUntil);
  else sessionStorage.setItem(SS_KEYS.pinUntil, String(ts));
}

// Persistent: top12 / page1 / lastSyncAt / nextCursor / hasMore
// IndexedDB 异步接口（持久层）
export async function loadTop12Async(): Promise<Work[]> {
  try {
    const list = await idbGet<Work[]>(LS_KEYS.top12, []);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveTop12Async(list: Work[]): Promise<void> {
  try {
    await idbSet(LS_KEYS.top12, list.slice(0, 12));
  } catch {}
}

export async function loadPage1Async(): Promise<Work[]> {
  try {
    const list = await idbGet<Work[]>(LS_KEYS.page1, []);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function savePage1Async(list: Work[]): Promise<void> {
  try {
    await idbSet(LS_KEYS.page1, list.slice(0, 4));
  } catch {}
}

export async function loadLastSyncAtAsync(): Promise<number | null> {
  try {
    const val = await idbGet<number>(LS_KEYS.lastSyncAt, null as any);
    return typeof val === "number" ? val : null;
  } catch {
    return null;
  }
}

export async function saveLastSyncAtAsync(ts: number): Promise<void> {
  try {
    await idbSet(LS_KEYS.lastSyncAt, ts);
  } catch {}
}

export async function loadNextCursorAsync(): Promise<string | null> {
  try {
    const val = await idbGet<string | null>(LS_KEYS.nextCursor, null as any);
    return val ?? null;
  } catch {
    return null;
  }
}

export async function saveNextCursorAsync(cursor: string | null): Promise<void> {
  try {
    if (cursor == null) await idbRemove(LS_KEYS.nextCursor);
    else await idbSet(LS_KEYS.nextCursor, cursor);
  } catch {}
}

export async function loadHasMoreAsync(): Promise<boolean> {
  try {
    const val = await idbGet<boolean>(LS_KEYS.hasMore, true as any);
    return typeof val === "boolean" ? val : true;
  } catch {
    return true;
  }
}

export async function saveHasMoreAsync(hasMore: boolean): Promise<void> {
  try {
    await idbSet(LS_KEYS.hasMore, hasMore);
  } catch {}
}

// 合并辅助：按 uuid 去重，pinned 优先
export function mergePinnedTop12(pinned: Work[], top12: Work[]): Work[] {
  const map = new Map<string, Work>();
  // pinned first
  pinned.forEach((w) => {
    map.set(w.uuid, w);
  });
  top12.forEach((w) => {
    if (!map.has(w.uuid)) map.set(w.uuid, w);
  });
  return Array.from(map.values());
}

// 排序：占位卡（uuid 以 pending- 开头）永远置顶；否则按 created_at 降序
export function sortByCreatedDesc(list: Work[]): Work[] {
  return [...list].sort((a, b) => {
    const ap = a.uuid?.startsWith?.("pending-") ? 1 : 0;
    const bp = b.uuid?.startsWith?.("pending-") ? 1 : 0;
    if (ap !== bp) return bp - ap; // pending 优先
    const ta = new Date(a.created_at as any).getTime();
    const tb = new Date(b.created_at as any).getTime();
    return tb - ta;
  });
}
