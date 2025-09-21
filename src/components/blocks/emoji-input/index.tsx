"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Section as SectionType } from "@/types/blocks/section";

interface EmojiInputProps {
  section: SectionType;
  onWorkCreated?: (work: any) => void; // 回调函数，当创建新作品时调用
}

export default function EmojiInput({ section, onWorkCreated }: EmojiInputProps) {
  const [emoji, setEmoji] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async () => {
    // 验证输入
    if (!emoji.trim()) {
      return;
    }

    // 检查登录状态
    if (!session) {
      alert("Please sign in to generate pixel art");
      router.push("/auth/signin");
      return;
    }

    // 简单验证 emoji（避免过度复杂化）
    if (emoji.trim().length > 10) {
      alert("Please enter one emoji only.");
      return;
    }

    setIsGenerating(true);

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

      if (result.success && result.data) {
        // 清空输入框
        setEmoji("");

        // 通知父组件新作品已创建
        if (onWorkCreated) {
          onWorkCreated(result.data);
        }
      } else {
        throw new Error(result.message || "Failed to generate pixel art");
      }

    } catch (error: any) {
      console.error("Failed to generate pixel art:", error);
      alert(error.message || "Failed to pixelate. Try again.");
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
    <section id={section.name} className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {section.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
            {section.description}
          </p>

          {/* Input Area */}
          <div className="w-full max-w-2xl">
            <div className="flex gap-4 items-center">
              <Input
                type="text"
                placeholder="Enter an emoji here… Examples: 😂 🍦 👀 🏳️‍🌈 or :ice_cream:"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-lg h-14 px-6 text-center border-gray-300 rounded-xl shadow-sm focus:shadow-md focus:border-purple-400 transition-all"
                disabled={isGenerating}
              />

              <Button
                onClick={handleSubmit}
                disabled={isGenerating || !emoji.trim()}
                size="lg"
                className="h-14 px-8 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all font-medium"
              >
                {isGenerating ? "Pixelating..." : "Pixelate Now"}
              </Button>
            </div>
          </div>

          {/* Tip */}
          {section.tip && (
            <p className="text-sm text-muted-foreground mt-6">
              {section.tip}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}