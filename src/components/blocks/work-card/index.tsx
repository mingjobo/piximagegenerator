"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import PixelPlaceholder from "./pixel-placeholder";
import { formatRelativeTime } from "@/lib/time-format";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/app";

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
  const { user, setShowSignModal } = useAppContext();
  const [imageError, setImageError] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // 检测是否为生成中状态
  const isGenerating = work.uuid.startsWith("generating-");

  const handleDownload = async () => {
    if (!work.image_url || isGenerating) return;

    if (!user) {
      setShowSignModal(true);
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch("/api/download-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: work.image_url,
          emoji: work.emoji,
        }),
      });

      if (response.status === 401) {
        setShowSignModal(true);
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Download failed");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pixelart_${work.emoji}_${work.uuid}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t("download_success"));
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(t("download_failed"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`group relative bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
      isGenerating
        ? "border-purple-200 ring-2 ring-purple-100 hover:shadow-lg" // 生成中：紫色边框和环状光晕
        : "border-gray-200 hover:shadow-md hover:-translate-y-0.5"    // 正常状态
    }`}>
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

        {/* Action buttons - 右上角 */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Download button - 只在有图片且非生成中且用户已登录时显示 */}
          {!isGenerating && work.image_url && user && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-full shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 group/btn"
              title={t("download")}
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              ) : (
                <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              )}
            </button>
          )}

          {/* 生成中徽章 */}
          {isGenerating && (
            <div className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              AI
            </div>
          )}
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
