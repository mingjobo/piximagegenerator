"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Section as SectionType } from "@/types/blocks/section";

interface EmojiInputProps {
  section: SectionType;
}

export default function EmojiInput({ section }: EmojiInputProps) {
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
      // TODO: 弹窗提示登录 - 后续实现
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
      // TODO: 调用 pixelate API - 等你提供 OpenAI 接口后实现
      console.log("Generating pixel art for:", emoji);

      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 清空输入框
      setEmoji("");

      // TODO: 刷新画廊 - 画廊组件实现后添加

    } catch (error) {
      console.error("Failed to generate pixel art:", error);
      alert("Failed to pixelate. Try again.");
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
          <div className="w-full max-w-md space-y-4">
            <Input
              type="text"
              placeholder="Enter an emoji here… Examples: 😂 🍦 👀 🏳️‍🌈 or :ice_cream:"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-lg h-12 text-center"
              disabled={isGenerating}
            />

            <Button
              onClick={handleSubmit}
              disabled={isGenerating || !emoji.trim()}
              size="lg"
              className="w-full h-12 text-lg"
            >
              {isGenerating ? "Pixelating..." : "Pixelate Now"}
            </Button>
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