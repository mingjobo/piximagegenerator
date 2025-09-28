"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Section as SectionType } from "@/types/blocks/section";
import { useAppContext } from "@/contexts/app";
import GraphemeSplitter from "grapheme-splitter";
import emojiRegex from "emoji-regex";

interface EmojiInputProps {
  section: SectionType;
  onWorkCreated?: (work: any) => void; // 回调函数，当创建新作品时调用
  compact?: boolean; // 紧凑模式：减少底部留白，便于与预览画廊贴近显示
}

export default function EmojiInput({ section, onWorkCreated, compact = false }: EmojiInputProps) {
  const [emoji, setEmoji] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const { refreshCredits } = useAppContext();

  // Initialize emoji validation utilities
  const splitter = new GraphemeSplitter();
  const emojiPattern = emojiRegex();

  // Validate emoji input
  const validateEmoji = (input: string): { isValid: boolean; error?: string } => {
    const trimmed = input.trim();

    if (!trimmed) {
      return { isValid: false, error: "" };
    }

    // Check if input contains only emojis
    const withoutEmojis = trimmed.replace(emojiPattern, "");
    if (withoutEmojis.length > 0) {
      return { isValid: false, error: "Please enter emoji only, text is not supported" };
    }

    // Count visual characters (graphemes)
    const graphemes = splitter.splitGraphemes(trimmed);
    if (graphemes.length > 3) {
      return { isValid: false, error: "Maximum 3 emojis allowed" };
    }

    // Safety check: byte length limit
    const byteLength = new TextEncoder().encode(trimmed).length;
    if (byteLength > 50) {
      return { isValid: false, error: "Input too complex" };
    }

    return { isValid: true };
  };

  const handleSubmit = async () => {
    // 验证输入
    const trimmed = emoji.trim();
    if (!trimmed) {
      return;
    }

    // Validate emoji
    const validation = validateEmoji(trimmed);
    if (!validation.isValid) {
      setValidationError(validation.error || "");
      return;
    }

    // 检查登录状态
    if (!session) {
      alert("Please sign in to generate pixel art");
      router.push("/auth/signin");
      return;
    }

    setIsGenerating(true);
    try {
      // 广播：开始生成（占位卡片）
      window.dispatchEvent(new CustomEvent("pixelate:start", {
        detail: {
          emoji: emoji.trim(),
          user: {
            // 兼容两套字段：会话模型提供 nickname/avatar_url/uuid
            id: (session.user as any)?.id || session.user?.uuid || "",
            uuid: session.user?.uuid || (session.user as any)?.id || "",
            name: session.user?.name || (session.user as any)?.nickname || "",
            nickname: (session.user as any)?.nickname || session.user?.name || "",
            image: session.user?.image || (session.user as any)?.avatar_url || "",
            avatar_url: (session.user as any)?.avatar_url || session.user?.image || "",
            email: session.user?.email || "",
          },
        },
      }));
    } catch {}

    try {
      const response = await fetch("/api/pixelate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emoji: emoji.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to generate pixel art");
      }

      if (result.code === 0 && result.data) {
        // 清空输入框
        setEmoji("");

        // 通知父组件新作品已创建
        if (onWorkCreated) {
          onWorkCreated(result.data);
        }

        try {
          // 广播：生成成功（占位转正式，续期置顶）
          window.dispatchEvent(new CustomEvent("pixelate:success", { detail: result.data }));
        } catch {}

        // 刷新用户积分（由后端预扣后以服务端为准）
        try { await refreshCredits?.(); } catch {}
      } else {
        throw new Error(result.message || "Failed to generate pixel art");
      }

    } catch (error: any) {
      console.error("Failed to generate pixel art:", error);
      alert(error.message || "Failed to pixelate. Try again.");
      try {
        // 广播：生成失败（移除占位）
        window.dispatchEvent(new CustomEvent("pixelate:fail", { detail: { message: (error as any)?.message } }));
      } catch {}
      // 失败返还积分后刷新
      try { await refreshCredits?.(); } catch {}
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (section.disabled) {
    return null;
  }

  return (
    <section
      id={section.name}
      className={`${compact ? "pt-20 pb-4" : "py-24"} bg-gradient-to-b from-background to-muted/20`}
    >
      <div className="container">
        <div className="flex flex-col items-center text-center mx-auto">
          {/* Hero Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
            {section.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl">
            {section.description}
          </p>

          {/* Input Area */}
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-3 md:gap-4">
              <Input
                type="text"
                placeholder="Enter emoji... Examples: 😊 👨‍👩‍👧‍👦 🏳️‍🌈"
                value={emoji}
                onChange={(e) => {
                  setEmoji(e.target.value);
                  setValidationError("");
                }}
                onKeyPress={handleKeyPress}
                className={`flex-1 text-2xl h-14 px-6 text-center border-border rounded-xl shadow-sm focus:shadow-md focus:border-primary transition-all ${validationError ? "border-red-500" : ""}`}
                disabled={isGenerating}
              />

              <Button
                onClick={handleSubmit}
                disabled={isGenerating || !emoji.trim()}
                size="lg"
                className="h-14 px-6 md:px-7 text-base md:text-lg rounded-xl shadow-sm hover:shadow-md transition-all font-medium shrink-0"
              >
                {isGenerating ? "Pixelating..." : "Pixelate Now"}
              </Button>
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <p className="text-sm text-red-500 mt-2">
              {validationError}
            </p>
          )}

          {/* Tip */}
          {section.tip && !validationError && (
            <p className="text-sm text-muted-foreground mt-6">
              {section.tip}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
