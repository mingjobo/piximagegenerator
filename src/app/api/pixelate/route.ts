import { experimental_generateImage as generateImage } from "ai";
import { respData, respErr } from "@/lib/resp";
import { apicore } from "@/aisdk/apicore";
import { newStorage } from "@/lib/storage";
import { getUuid } from "@/lib/hash";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { db } from "@/db";
import { works } from "@/db/schema";
import { shouldUseMockData, createMockWork, generateMockPixelArtUrl } from "@/lib/mock-data";

// 构建像素艺术 prompt
function buildPixelPrompt(emoji: string): string {
  return `创建一个极简主义的 8 位像素风格的 ${emoji} 标志，居中放置在纯白背景上。使用有限的复古调色板，搭配像素化细节、锐利边缘和干净的块状形态。标志应简洁、具有标志性，并能在像素艺术风格中清晰识别——灵感来自经典街机游戏美学。`;
}

export async function POST(req: Request) {
  try {
    // 1. 尝试获取用户会话（如果认证启用）
    const session = await getServerSession(authOptions).catch(() => null);
    const userUuid = session?.user?.uuid || "mock-user-1";

    // 2. 解析请求
    const { emoji } = await req.json();
    if (!emoji?.trim()) {
      return respErr("Emoji is required");
    }

    // 3. 简单的 emoji 验证
    const trimmedEmoji = emoji.trim();
    if (trimmedEmoji.length > 10) {
      return respErr("Please enter one emoji only");
    }

    // 检查是否使用 mock 数据
    if (shouldUseMockData()) {
      // 使用 mock 数据生成
      const mockImageUrl = generateMockPixelArtUrl(trimmedEmoji);
      const mockWork = await createMockWork(userUuid, trimmedEmoji, mockImageUrl);

      return respData({
        uuid: mockWork.uuid,
        emoji: mockWork.emoji,
        image_url: mockWork.image_url,
        created_at: mockWork.created_at,
      });
    }

    // 使用真实 API 和数据库
    // 4. 构建 prompt
    const prompt = buildPixelPrompt(trimmedEmoji);

    // 5. 调用 APICore 生成图片
    const imageModel = apicore.image("gpt-4o-image");
    const { images, warnings } = await generateImage({
      model: imageModel,
      prompt: prompt,
      n: 1,
      providerOptions: {
        apicore: {
          size: "1024x1024",
        },
      },
    });

    if (warnings.length > 0) {
      console.log("Pixelate warnings:", warnings);
      return respErr("Failed to pixelate. Try again.");
    }

    if (!images || images.length === 0) {
      return respErr("No image generated");
    }

    // 6. 上传图片到存储
    const storage = newStorage();
    const workUuid = getUuid();
    const filename = `pixel_${workUuid}.png`;
    const key = `pixels/${filename}`;

    const body = Buffer.from(images[0].base64, "base64");

    let imageUrl: string;
    try {
      const uploadResult = await storage.uploadFile({
        body,
        key,
        contentType: "image/png",
        disposition: "inline",
      });
      imageUrl = uploadResult.url || uploadResult.key;
    } catch (uploadErr) {
      console.error("Failed to upload image:", uploadErr);
      return respErr("Failed to save image");
    }

    // 7. 保存到数据库
    try {
      const database = db();
      const [newWork] = await database.insert(works).values({
        uuid: workUuid,
        user_uuid: userUuid,
        emoji: trimmedEmoji,
        image_url: imageUrl,
      }).returning();

      return respData({
        uuid: newWork.uuid,
        emoji: newWork.emoji,
        image_url: newWork.image_url,
        created_at: newWork.created_at,
      });
    } catch (dbErr) {
      console.error("Failed to save work to database:", dbErr);
      return respErr("Failed to save work");
    }

  } catch (error: any) {
    console.error("Pixelate API error:", error);
    return respErr(error.message || "Failed to pixelate. Try again.");
  }
}