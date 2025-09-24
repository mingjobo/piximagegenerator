// Mock 数据服务 - 在数据库未配置时使用
import { Work } from "@/components/blocks/work-card";

// 内存中的 mock 数据存储 - 使用空 URL 让前端渲染占位符
let mockWorks: Work[] = [
  {
    id: 1,
    uuid: "mock-work-1",
    user_uuid: "mock-user-1",
    emoji: "🍦",
    image_url: "", // 空 URL 会触发 PixelPlaceholder 组件
    created_at: new Date("2024-01-20T10:00:00"),
    user_nickname: "PixelMaster",
    user_avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelMaster"
  },
  {
    id: 2,
    uuid: "mock-work-2",
    user_uuid: "mock-user-2",
    emoji: "😂",
    image_url: "",
    created_at: new Date("2024-01-20T11:00:00"),
    user_nickname: "ArtLover",
    user_avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ArtLover"
  },
  {
    id: 3,
    uuid: "mock-work-3",
    user_uuid: "mock-user-1",
    emoji: "🔥",
    image_url: "",
    created_at: new Date("2024-01-20T12:00:00"),
    user_nickname: "PixelMaster",
    user_avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelMaster"
  },
  {
    id: 4,
    uuid: "mock-work-4",
    user_uuid: "mock-user-3",
    emoji: "👀",
    image_url: "",
    created_at: new Date("2024-01-20T13:00:00"),
    user_nickname: "CreativeUser",
    user_avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=CreativeUser"
  },
  {
    id: 5,
    uuid: "mock-work-5",
    user_uuid: "mock-user-2",
    emoji: "🎉",
    image_url: "",
    created_at: new Date("2024-01-20T14:00:00"),
    user_nickname: "ArtLover",
    user_avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ArtLover"
  },
  {
    id: 6,
    uuid: "mock-work-6",
    user_uuid: "mock-user-1",
    emoji: "🏳️‍🌈",
    image_url: "",
    created_at: new Date("2024-01-20T15:00:00"),
    user_nickname: "PixelMaster",
    user_avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelMaster"
  },
  {
    id: 7,
    uuid: "mock-work-7",
    user_uuid: "mock-user-3",
    emoji: "🤖",
    image_url: "",
    created_at: new Date("2024-01-20T16:00:00"),
    user_nickname: "CreativeUser",
    user_avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=CreativeUser"
  },
  {
    id: 8,
    uuid: "mock-work-8",
    user_uuid: "mock-user-2",
    emoji: "💎",
    image_url: "",
    created_at: new Date("2024-01-20T17:00:00"),
    user_nickname: "ArtLover",
    user_avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ArtLover"
  }
];

let nextId = 9;

// 检查是否应该使用 mock 数据
export function shouldUseMockData(): boolean {
  // 如果没有配置数据库 URL，使用 mock 数据
  return !process.env.DATABASE_URL;
}

// Mock: 获取作品列表
export async function getMockWorks(cursor?: string, limit: number = 30): Promise<{
  works: Work[];
  has_more: boolean;
  next_cursor: string | null;
}> {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  // 按创建时间倒序排序
  const sortedWorks = [...mockWorks].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // 处理分页
  let startIndex = 0;
  if (cursor) {
    const cursorId = parseInt(cursor);
    startIndex = sortedWorks.findIndex(w => w.id === cursorId) + 1;
  }

  const endIndex = startIndex + limit;
  const pageWorks = sortedWorks.slice(startIndex, endIndex);
  const hasMore = endIndex < sortedWorks.length;
  const nextCursor = hasMore && pageWorks.length > 0
    ? pageWorks[pageWorks.length - 1].id.toString()
    : null;

  return {
    works: pageWorks,
    has_more: hasMore,
    next_cursor: nextCursor
  };
}

// Mock: 创建新作品
export async function createMockWork(
  userUuid: string,
  emoji: string,
  imageUrl: string
): Promise<Work> {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  const newWork: Work = {
    id: nextId++,
    uuid: `mock-work-${nextId}`,
    user_uuid: userUuid,
    emoji,
    image_url: imageUrl,
    created_at: new Date(),
    user_nickname: "NewUser", // 默认用户名
    user_avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userUuid}` // 默认头像
  };

  // 添加到内存存储
  mockWorks.unshift(newWork);

  return newWork;
}

// Mock: 生成像素艺术图片 URL
export function generateMockPixelArtUrl(emoji: string): string {
  // 返回空字符串，让前端使用 PixelPlaceholder 组件
  return "";
}