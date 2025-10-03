import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";
import { createMDX } from "fumadocs-mdx/next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withMDX = createMDX();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  async headers() {
    return [
      {
        // 统一为 favicon 设置温和缓存，避免长期持有旧内容
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" }, // 1 天
        ],
      },
      {
        source: "/:path(favicon-:size(16x16|32x32|48x48|64x64)\\.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        source: "/apple-icon.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        // Manifest 也给短缓存，便于快速迭代
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
  async redirects() {
    return [];
  },
};

// Make sure experimental mdx flag is enabled
const configWithMDX = {
  ...nextConfig,
  experimental: {
    mdxRs: true,
  },
};

// 仅在本地开发环境初始化 Cloudflare dev，避免在 Vercel 构建/运行时产生副作用
if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") {
  try {
    initOpenNextCloudflareForDev();
  } catch (e) {
    // 忽略本地初始化失败，确保开发不被阻塞
  }
}

export default withBundleAnalyzer(withNextIntl(withMDX(configWithMDX)));
