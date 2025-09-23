"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import PixelPlaceholder from "./pixel-placeholder";
import { formatRelativeTime } from "@/lib/time-format";

export interface Work {
  id: number;
  uuid: string;
  user_uuid: string;
  emoji: string;
  image_url: string;
  created_at: Date | string;
  // User information from JOIN query
  user_nickname?: string;
  user_avatar_url?: string;
}

interface WorkCardProps {
  work: Work;
}

export default function WorkCard({ work }: WorkCardProps) {
  const t = useTranslations("gallery");
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
            loading="lazy"
            decoding="async"
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

      {/* User Information Section */}
      <div className="h-16 p-3 border-t border-gray-100 flex items-center gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {work.user_avatar_url ? (
            <Image
              src={work.user_avatar_url}
              alt={work.user_nickname || "User"}
              width={32}
              height={32}
              className="rounded-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to default avatar on error
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1.5'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
              }}
            />
          ) : (
            // Default user icon for missing avatar
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>

        {/* User Name and Time */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {work.user_nickname || t("anonymous_user")}
          </div>
          <div className="text-xs text-gray-500">
            {t("created_at", { time: formatRelativeTime(work.created_at) })}
          </div>
        </div>
      </div>
    </div>
  );
}
