import { respData, respErr } from "@/lib/resp";
import { db } from "@/db";
import { works } from "@/db/schema";
import { desc, lt } from "drizzle-orm";
import { shouldUseMockData, getMockWorks } from "@/lib/mock-data";
import { getFallbackImageUrl } from "@/lib/s3-config";

// 验证图片 URL 是否可访问
function validateImageUrl(url: string): string {
  if (!url) return "";

  // 如果是 S3 URL 且包含有问题的域名，返回空字符串
  if (url.includes("s3pixelart.s3") && url.includes("amazonaws.com")) {
    // S3 bucket 可能不存在或有权限问题，使用备用方案
    return "";
  }

  return url;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "30", 10);

    // 检查是否使用 mock 数据
    if (shouldUseMockData()) {
      const mockData = await getMockWorks(cursor || undefined, limit);
      return respData(mockData);
    }

    // 使用真实数据库
    // 构建查询
    const database = db();
    let query = database.select().from(works);

    // 如果有 cursor，则从该位置开始获取（倒序分页使用 lt）
    if (cursor) {
      query = query.where(lt(works.id, parseInt(cursor, 10)));
    }

    // 按创建时间倒序，限制数量
    const results = await query
      .orderBy(desc(works.created_at))
      .limit(limit + 1); // 多取一条用于判断是否还有更多

    // 检查是否还有更多数据
    const hasMore = results.length > limit;
    const worksData = hasMore ? results.slice(0, limit) : results;

    // 计算下一个 cursor
    const nextCursor = hasMore && worksData.length > 0
      ? worksData[worksData.length - 1].id.toString()
      : null;

    return respData({
      works: worksData.map(work => ({
        id: work.id,
        uuid: work.uuid,
        user_uuid: work.user_uuid,
        emoji: work.emoji,
        image_url: validateImageUrl(work.image_url), // 验证并处理 URL
        created_at: work.created_at,
      })),
      has_more: hasMore,
      next_cursor: nextCursor,
    });

  } catch (error: any) {
    console.error("Gallery API error:", error);
    return respErr("Failed to fetch gallery");
  }
}