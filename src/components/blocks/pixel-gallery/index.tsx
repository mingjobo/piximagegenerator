"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Section as SectionType } from "@/types/blocks/section";
import WorkCard, { Work } from "@/components/blocks/work-card";

interface PixelGalleryProps {
  section: SectionType;
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

export default function PixelGallery({ section }: PixelGalleryProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // 使用ref避免重复请求
  const isLoadingRef = useRef(false);
  const hasInitialLoadRef = useRef(false);

  // 获取作品列表
  const fetchWorks = useCallback(async (nextCursor: string | null = null, reset = false) => {
    // 防止重复请求
    if (isLoadingRef.current) {
      console.log("Already loading, skipping request");
      return;
    }

    console.log("Fetching gallery with cursor:", nextCursor);
    isLoadingRef.current = true;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("limit", "30");
      if (nextCursor) {
        params.append("cursor", nextCursor);
      }

      const response = await fetch(`/api/gallery?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gallery");
      }

      const result: GalleryResponse = await response.json();
      console.log("API response:", result);

      // 适配API返回格式 (code: 0 表示成功)
      if (result.code === 0 && result.data) {
        const { works: newWorks, has_more, next_cursor } = result.data;

        console.log(`Received ${newWorks.length} works, has_more: ${has_more}, next_cursor: ${next_cursor}`);

        if (reset) {
          setWorks(newWorks);
        } else {
          setWorks(prev => [...prev, ...newWorks]);
        }

        setHasMore(has_more);
        setCursor(next_cursor);
      }
    } catch (error) {
      console.error("Failed to fetch works:", error);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // 添加新作品到画廊顶部 - 保留以供将来使用
  // const addNewWork = useCallback((newWork: Work) => {
  //   setWorks(prev => [newWork, ...prev]);
  // }, []);

  // 初始加载 - 确保只执行一次
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      console.log("Initial load triggered");
      fetchWorks(null, true);
    }
  }, []); // 空依赖，只在mount时执行

  // 无限滚动 - 修复滚动检测逻辑
  useEffect(() => {
    // 如果没有更多数据，不监听滚动
    if (!hasMore) {
      console.log("No more data, not listening to scroll");
      return;
    }

    const handleScroll = () => {
      // 检查是否正在加载
      if (isLoadingRef.current) {
        return;
      }

      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = window.innerHeight;

      // 检查是否真的有滚动条（内容高度大于视口高度）
      const hasScrollbar = scrollHeight > clientHeight;

      if (!hasScrollbar) {
        // 没有滚动条，不需要加载更多
        console.log("No scrollbar, not loading more");
        return;
      }

      // 距离底部100px时触发加载（而不是1000px）
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (scrolledToBottom && hasMore && cursor) {
        console.log("Scrolled to bottom, loading more");
        fetchWorks(cursor);
      }
    };

    // 延迟添加监听器，确保初始渲染完成
    const timeoutId = setTimeout(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, cursor, fetchWorks]);

  // 注释掉，等需要时再实现
  // useEffect(() => {
  //   if (section.onNewWork) {
  //     section.onNewWork(addNewWork);
  //   }
  // }, [section, addNewWork]);

  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-16">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
        
        </div>

        {/* Works Grid */}
        {works.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {works.map((work) => (
              <WorkCard key={work.uuid} work={work} />
            ))}
          </div>
        ) : !loading ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-7xl mb-4 opacity-80">🎨</div>
            <h3 className="text-xl font-semibold mb-2">
              No pixel art yet
            </h3>
            <p className="text-muted-foreground text-sm">
              Try entering some emojis above to generate pixel art!
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Examples: 😂 🍦 👀 🏳️‍🌈 🔥
            </p>
          </div>
        ) : null}

        {/* Loading Indicator */}
        {loading && (
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
              <span>Loading pixel art...</span>
            </div>
          </div>
        )}

        {/* End of Gallery */}
        {!hasMore && works.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              ✨ All pixel art loaded
            </p>
          </div>
        )}
      </div>
    </section>
  );
}