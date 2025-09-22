"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Section as SectionType } from "@/types/blocks/section";
import WorkCard, { Work } from "@/components/blocks/work-card";
import {
  loadPinned,
  savePinned,
  loadPinUntil,
  savePinUntil,
  loadTop12Async as loadTop12Async,
  saveTop12Async as saveTop12Async,
  loadPage1Async as loadPage1Async,
  savePage1Async as savePage1Async,
  loadLastSyncAtAsync as loadLastSyncAtAsync,
  saveLastSyncAtAsync as saveLastSyncAtAsync,
  loadNextCursorAsync as loadNextCursorAsync,
  saveNextCursorAsync as saveNextCursorAsync,
  loadHasMoreAsync as loadHasMoreAsync,
  saveHasMoreAsync as saveHasMoreAsync,
  mergePinnedTop12,
  sortByCreatedDesc,
} from "@/lib/gallery-store";
import { toast } from "sonner";

interface PixelGalleryProps {
  section: SectionType;
  preview?: boolean; // 预览模式：仅展示一行，隐藏标题与无限滚动
}

interface GalleryResponse {
  code: number;
  message: string;
  data: {
    works: Work[];
    has_more: boolean;
    next_cursor: string | null;
  };
}

export default function PixelGallery({ section, preview = false }: PixelGalleryProps) {
  const t = useTranslations("gallery");
  // 状态：置顶集合、权威 top12、page1、加载更多的额外数据
  const [pinned, setPinned] = useState<Work[]>([]);
  const [top12, setTop12] = useState<Work[]>([]);
  const [page1, setPage1] = useState<Work[]>([]);
  const [extraPages, setExtraPages] = useState<Work[]>([]); // 第二页及以后（仅内存，不持久化）

  const [pinUntil, setPinUntil] = useState<number | null>(null);
  const [updateHint, setUpdateHint] = useState(false); // 右侧提示

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);
  const hasInitialLoadRef = useRef(false);

  const isPinActive = useCallback(() => {
    return pinUntil != null && Date.now() < pinUntil;
  }, [pinUntil]);

  const persistPinned = useCallback((list: Work[], nextUntil: number | null) => {
    setPinned(list);
    savePinned(list);
    setPinUntil(nextUntil);
    savePinUntil(nextUntil);
  }, []);

  // 合并首屏：占位/置顶优先，按时间降序，取前12
  const firstScreen = (() => {
    const merged = mergePinnedTop12(pinned, top12);
    const sorted = sortByCreatedDesc(merged);
    return sorted.slice(0, 12);
  })();

  const allDisplayed = (() => {
    // 完整列表 = 首屏 + page1 + 额外页（仅内存）
    return [...firstScreen, ...page1, ...extraPages];
  })();

  // 拉取最新 top12（用于首屏与心跳）
  const fetchTop12 = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", "12");
      const resp = await fetch(`/api/gallery?${params.toString()}`);
      if (!resp.ok) throw new Error("拉取最新12条失败");
      const result: GalleryResponse = await resp.json();
      if (result.code === 0 && result.data) {
        const { works: newWorks, has_more, next_cursor } = result.data;
        // 判断是否发生变化（对比 uuid 顺序）
        const prev = top12;
        const prevKey = prev.map((w) => w.uuid).join("|");
        const nextKey = newWorks.map((w) => w.uuid).join("|");
        const changed = prevKey !== nextKey;

        await saveTop12Async(newWorks);
        await saveHasMoreAsync(has_more);
        await saveNextCursorAsync(next_cursor);
        await saveLastSyncAtAsync(Date.now());
        // 置顶中：只更新缓存与提示；非置顶：立即替换UI
        if (isPinActive()) {
          setUpdateHint(changed);
        } else {
          setTop12(newWorks);
          setHasMore(has_more);
          setCursor(next_cursor);
          setUpdateHint(false);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [isPinActive, top12]);

  // 加载更多：每次+4
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !cursor) return;
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", "4");
      if (cursor) params.append("cursor", cursor);
      const resp = await fetch(`/api/gallery?${params.toString()}`);
      if (!resp.ok) throw new Error("加载更多失败");
      const result: GalleryResponse = await resp.json();
      if (result.code === 0 && result.data) {
        const { works: moreWorks, has_more, next_cursor } = result.data;
        // 仅缓存第一页4条（若尚未缓存page1）
        if (page1.length === 0) {
          await savePage1Async(moreWorks);
          setPage1(moreWorks);
        } else {
          setExtraPages((prev) => [...prev, ...moreWorks]);
        }
        setHasMore(has_more);
        setCursor(next_cursor);
        if (page1.length === 0) await saveNextCursorAsync(next_cursor);
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [cursor, hasMore, page1.length]);

  // 初始加载：读缓存 → 渲染 → 拉取最新
  useEffect(() => {
    if (hasInitialLoadRef.current) return;
    hasInitialLoadRef.current = true;

    // 读取缓存
    (async () => {
      const cachedPinned = loadPinned();
      const cachedPinUntil = loadPinUntil();
      const [cachedTop12, cachedPage1, cachedHasMore, cachedCursor] = await Promise.all([
        loadTop12Async(),
        loadPage1Async(),
        loadHasMoreAsync(),
        loadNextCursorAsync(),
      ]);

      setPinned(cachedPinned);
      setPinUntil(cachedPinUntil);
      setTop12(cachedTop12);
      setPage1(cachedPage1);
      setHasMore(cachedHasMore);
      setCursor(cachedCursor);

      // 异步拉取最新 top12
      fetchTop12();
    })();
  }, [fetchTop12]);

  // 3分钟心跳 + 前台/联网触发
  useEffect(() => {
    if (preview) return;
    // 心跳
    heartbeatRef.current = setInterval(() => {
      fetchTop12();
    }, 3 * 60 * 1000);

    const onVisible = () => fetchTop12();
    const onOnline = () => fetchTop12();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") onVisible();
    });
    window.addEventListener("online", onOnline);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener("online", onOnline);
    };
  }, [fetchTop12, preview]);

  // 监听生成事件：占位/成功/失败
  useEffect(() => {
    if (preview) return;
    const onStart = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const emoji = detail.emoji || "✨";
      const placeholder: Work = {
        id: 0,
        uuid: `pending-${Date.now()}`,
        user_uuid: "",
        emoji,
        image_url: "", // 触发像素占位图
        created_at: new Date().toISOString(),
      };
      const nextPinned = [placeholder, ...pinned];
      const until = Date.now() + 3 * 60 * 1000; // 3分钟
      persistPinned(nextPinned, until);
    };

    const onSuccess = (e: Event) => {
      const data = (e as CustomEvent).detail || {};
      // 占位转正式：以 uuid 匹配（占位是 pending- 前缀，不同 id），插到 pinned 顶部
      const confirmed: Work = {
        id: (data.id as number) || -1,
        uuid: data.uuid,
        user_uuid: data.user_uuid || "",
        emoji: data.emoji,
        image_url: data.image_url || "",
        created_at: data.created_at || new Date().toISOString(),
      };
      // 移除最近的一个占位（pending- 前缀），再插入确认项
      const remaining = pinned.filter((w) => !w.uuid.startsWith("pending-"));
      const next = [confirmed, ...remaining];
      const until = Date.now() + 3 * 60 * 1000;
      persistPinned(next, until);
    };

    const onFail = (_e: Event) => {
      // 删除最近的占位，并提示一次错误
      const idx = pinned.findIndex((w) => w.uuid.startsWith("pending-"));
      let next = pinned;
      if (idx !== -1) {
        next = [...pinned.slice(0, idx), ...pinned.slice(idx + 1)];
        persistPinned(next, pinUntil);
      }
      toast.error(t("generate_fail"));
    };

    window.addEventListener("pixelate:start", onStart as any);
    window.addEventListener("pixelate:success", onSuccess as any);
    window.addEventListener("pixelate:fail", onFail as any);

    return () => {
      window.removeEventListener("pixelate:start", onStart as any);
      window.removeEventListener("pixelate:success", onSuccess as any);
      window.removeEventListener("pixelate:fail", onFail as any);
    };
  }, [persistPinned, pinUntil, pinned, preview]);

  // 置顶倒计时检查：到期后若有缓存新 top12 则应用并清空置顶
  useEffect(() => {
    if (preview) return;
    const timer = setInterval(() => {
      if (pinUntil != null && Date.now() >= pinUntil) {
        // 置顶结束
        (async () => {
          const cachedTop = await loadTop12Async();
          setTop12(cachedTop);
        })();
        setUpdateHint(false);
        persistPinned([], null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [pinUntil, preview, persistPinned]);

  if (section.disabled) {
    return null;
  }

  // 预览模式展示前4个（不含置顶/心跳），完整模式展示合并后的列表
  const displayWorks = preview ? top12.slice(0, 4) : allDisplayed;

  return (
    <section id={section.name} className={preview ? "pt-2 pb-6 md:pb-8" : "py-16"}>
      <div className="container">
        {/* Section Header */}
        {!preview && (
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-3xl font-bold">{section.title}</h2>
            {updateHint && (
              <span className="text-xs text-muted-foreground">{t("update_hint")}</span>
            )}
          </div>
        )}

        {/* Works: 预览 = 水平滚动条；完整 = 网格 */}
        {displayWorks.length > 0 ? (
          preview ? (
            <div className="flex justify-center gap-4 md:gap-6">
              {displayWorks.map((work) => (
                <div key={work.uuid} className="w-56 sm:w-64 md:w-72">
                  <WorkCard work={work} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {displayWorks.map((work) => (
                <WorkCard key={work.uuid} work={work} />
              ))}
            </div>
          )
        ) : !loading ? (
          /* Empty State */
          <div className={preview ? "py-6" : "text-center py-20"}>
            {!preview && (
              <>
                <div className="text-7xl mb-4 opacity-80">🎨</div>
                <h3 className="text-xl font-semibold mb-2">No pixel art yet</h3>
                <p className="text-muted-foreground text-sm">
                  Try entering some emojis above to generate pixel art!
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                  Examples: 😂 🍦 👀 🏳️‍🌈 🔥
                </p>
              </>
            )}
          </div>
        ) : null}

        {/* Loading Indicator */}
        {loading && !preview && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{t("loading_pixel_art")}</span>
            </div>
          </div>
        )}

        {/* 加载更多 / 完结提示 */}
        {!preview && (
          <div className="text-center py-8">
            {hasMore && cursor ? (
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
              >
                {loading ? t("loading") : t("load_more", { count: 4 })}
              </button>
            ) : displayWorks.length > 0 ? (
              <p className="text-muted-foreground text-sm">✨ {t("all_loaded")}</p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
