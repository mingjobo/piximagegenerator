import { respData, respErr } from "@/lib/resp";
import { db } from "@/db";
import { works, users } from "@/db/schema";
import { desc, lt, eq } from "drizzle-orm";
import { shouldUseMockData, getMockWorks } from "@/lib/mock-data";

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
    // 构建查询 - JOIN users 表获取用户信息
    const database = db();

    // 构建基础查询
    let baseQuery = database
      .select({
        // Work fields
        id: works.id,
        uuid: works.uuid,
        user_uuid: works.user_uuid,
        emoji: works.emoji,
        image_url: works.image_url,
        created_at: works.created_at,
        // User fields
        user_nickname: users.nickname,
        user_avatar_url: users.avatar_url,
      })
      .from(works)
      .leftJoin(users, eq(works.user_uuid, users.uuid))
      .$dynamic();

    // 如果有 cursor，则从该位置开始获取（倒序分页使用 lt）
    if (cursor) {
      baseQuery = baseQuery.where(lt(works.id, parseInt(cursor, 10)));
    }

    // 按创建时间倒序，限制数量
    const results = await baseQuery
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
        image_url: work.image_url,
        created_at: work.created_at,
        // Include user information
        user_nickname: work.user_nickname,
        user_avatar_url: work.user_avatar_url,
      })),
      has_more: hasMore,
      next_cursor: nextCursor,
    });

  } catch (error: any) {
    console.error("Gallery API error:", error);
    return respErr("Failed to fetch gallery");
  }
}