"use client";

import { useEffect, useState } from "react";

const items = [
  { label: "48x48 PNG (versioned)", src: "/favicon-48x48.png?v=20251003-1" },
  { label: "ICO fallback", src: "/favicon.ico" },
  { label: "Apple Touch Icon", src: "/apple-icon.png" },
];

export default function FaviconDebugPage() {
  const [sizes, setSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    items.forEach((it) => {
      const img = new window.Image();
      img.onload = () => {
        setSizes((s) => ({ ...s, [it.src]: `${img.width}x${img.height}` }));
      };
      img.src = it.src;
    });
  }, []);

  return (
    <section className="py-10">
      <div className="container max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Favicon Debug</h1>
        <p className="text-muted-foreground mb-6">
          用于快速检查页面声明的图标资源是否可访问、尺寸是否正确。
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.src} className="rounded border p-4">
              <div className="mb-2 font-medium">{it.label}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt={it.label} className="w-12 h-12" />
              <div className="text-sm text-muted-foreground mt-2 break-all">
                {it.src}
              </div>
              <div className="text-sm mt-1">实际尺寸：{sizes[it.src] || "检测中..."}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
