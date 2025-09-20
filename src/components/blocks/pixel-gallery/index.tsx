"use client";

import { useEffect, useState, useCallback } from "react";
import { Section as SectionType } from "@/types/blocks/section";
import WorkCard, { Work } from "@/components/blocks/work-card";

interface PixelGalleryProps {
  section: SectionType;
}

export default function PixelGallery({ section }: PixelGalleryProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 获取作品列表
  const fetchWorks = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      // TODO: 调用实际的 API - 等后端实现后替换
      console.log(`Fetching works page ${pageNum}`);

      // 模拟 API 响应
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockWorks: Work[] = [
        // 暂时用模拟数据，等 API 实现后替换
      ];

      if (reset) {
        setWorks(mockWorks);
      } else {
        setWorks(prev => [...prev, ...mockWorks]);
      }

      // 如果返回的数据少于 30 条，说明没有更多了
      if (mockWorks.length < 30) {
        setHasMore(false);
      }

    } catch (error) {
      console.error("Failed to fetch works:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchWorks(1, true);
  }, [fetchWorks]);

  // 无限滚动
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        setPage(prev => prev + 1);
        fetchWorks(page + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page, fetchWorks]);

  // 添加新作品到画廊顶部
  const addNewWork = useCallback((newWork: Work) => {
    setWorks(prev => [newWork, ...prev]);
  }, []);

  // 将 addNewWork 函数暴露给父组件 - 后续实现时可以通过 context 或 props 传递

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

        {/* Works Grid */}
        {works.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
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