"use client";

import { useEffect, useState, useCallback } from "react";
import { Section as SectionType } from "@/types/blocks/section";
import WorkCard, { Work } from "@/components/blocks/work-card";

interface PixelGalleryProps {
  section: SectionType;
  onNewWork?: (work: Work) => void; // 导出函数供父组件使用
}

// Gallery API 响应类型
interface GalleryResponse {
  success: boolean;
  data: {
    works: Work[];
    has_more: boolean;
    next_cursor: string | null;
  };
  message?: string;
}

export default function PixelGallery({ section }: PixelGalleryProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // 获取作品列表
  const fetchWorks = useCallback(async (nextCursor: string | null = null, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", "30");
      if (nextCursor) {
        params.append("cursor", nextCursor);
      }

      const response = await fetch(`/api/gallery?${params.toString()}`);
      const result: GalleryResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch gallery");
      }

      if (result.success && result.data) {
        const { works: newWorks, has_more, next_cursor } = result.data;

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
      setLoading(false);
    }
  }, [loading]);

  // 添加新作品到画廊顶部
  const addNewWork = useCallback((newWork: Work) => {
    setWorks(prev => [newWork, ...prev]);
  }, []);

  // 初始加载
  useEffect(() => {
    fetchWorks(null, true);
  }, [fetchWorks]);

  // 无限滚动
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        fetchWorks(cursor);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, cursor, fetchWorks]);

  // 暴露添加新作品的方法给父组件
  useEffect(() => {
    if (section.onNewWork) {
      section.onNewWork(addNewWork);
    }
  }, [section, addNewWork]);

  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-16">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
          {section.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {section.description}
            </p>
          )}
        </div>

        {/* Works Grid - 匹配截图的 4 列布局 */}
        {works.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {works.map((work) => (
              <WorkCard key={work.uuid} work={work} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">No pixel art yet</h3>
            <p className="text-muted-foreground">
              Try entering: 😂 🍦 👀 🏳️‍🌈
            </p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Loading more...
            </div>
          </div>
        )}

        {/* No More Data */}
        {!hasMore && works.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            That's all the pixel art!
          </div>
        )}
      </div>
    </section>
  );
}