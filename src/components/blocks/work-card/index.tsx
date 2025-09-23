"use client";

import Image from "next/image";
import { useState } from "react";
import PixelPlaceholder from "./pixel-placeholder";

export interface Work {
  id: number;
  uuid: string;
  user_uuid: string;
  emoji: string;
  image_url: string;
  created_at: Date | string;
}

interface WorkCardProps {
  work: Work;
}

export default function WorkCard({ work }: WorkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Main Image Area - 正方形容器 - 浅灰色背景 */}
      <div className="relative aspect-square bg-gray-50">
        {(work.image_url || fallbackSrc) && !imageError ? (
          <Image
            src={fallbackSrc || work.image_url}
            alt={`Pixelated ${work.emoji}`}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            onError={() => {
              // 加载失败时尝试回退到本服务代理路径 /api/image/pixels/...
              const current = fallbackSrc || work.image_url || "";
              if (!current) {
                setImageError(true);
                return;
              }
              // 已经是代理就不再重试
              if (current.startsWith("/api/image/")) {
                console.log("Image failed to load (proxy), show placeholder:", current);
                setImageError(true);
                return;
              }
              const match = current.match(/\/(pixels\/[^?#]+)/i);
              if (match && match[1]) {
                const proxy = `/api/image/${match[1]}`;
                console.log("Image failed, fallback to proxy:", proxy);
                setFallbackSrc(proxy);
              } else {
                setImageError(true);
              }
            }}
            priority
            unoptimized
          />
        ) : (
          // 使用像素占位图
          <PixelPlaceholder emoji={work.emoji} />
        )}

        {/* Original Emoji Badge - 左上角小图标 */}
        <div className="absolute top-3 left-3">
          <div className="w-12 h-12 bg-white rounded-md shadow-sm flex items-center justify-center border border-gray-100">
            <span className="text-2xl">{work.emoji}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
