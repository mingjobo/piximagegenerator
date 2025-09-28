import { experimental_generateImage as generateImage } from "ai";
import { respData, respErr } from "@/lib/resp";
import { apicore } from "@/aisdk/apicore";
import { newStorage } from "@/lib/storage";
import { getUuid } from "@/lib/hash";
import { auth } from "@/auth";
import { db } from "@/db";
import { works } from "@/db/schema";
import { shouldUseMockData, createMockWork, generateMockPixelArtUrl } from "@/lib/mock-data";
import { CreditsAmount, CreditsTransType, decreaseCredits, increaseCredits, getUserCredits } from "@/services/credit";
import GraphemeSplitter from "grapheme-splitter";
import emojiRegex from "emoji-regex";

// Validate emoji input
function validateEmoji(input: string): { isValid: boolean; error?: string } {
  const trimmed = input.trim();
  const splitter = new GraphemeSplitter();
  const emojiPattern = emojiRegex();

  if (!trimmed) {
    return { isValid: false, error: "Emoji is required" };
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
}

// 构建像素艺术 prompt
function buildPixelPrompt(emoji: string): string {
  return `创建一个极简主义的 8 位像素风格的 ${emoji} 标志，居中放置在纯白背景上。使用有限的复古调色板，搭配像素化细节、锐利边缘和干净的块状形态。标志应简洁、具有标志性，并能在像素艺术风格中清晰识别——灵感来自经典街机游戏美学。`;
}

export async function POST(req: Request) {
  try {
    // 1. 获取用户会话（必须登录才能生成/计费）
    const session = await auth().catch(() => null);
    const userUuid = session?.user?.uuid || "";
    if (!userUuid) {
      return respErr("no auth");
    }

    // 2. 解析请求
    const { emoji } = await req.json();
    const trimmedEmoji = emoji?.trim() || "";

    // 3. Validate emoji input
    const validation = validateEmoji(trimmedEmoji);
    if (!validation.isValid) {
      return respErr(validation.error || "Invalid input");
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
    // 4. 检查积分并预扣
    const userCredits = await getUserCredits(userUuid);
    if (!userCredits || (userCredits.left_credits || 0) < CreditsAmount.PixelateCost) {
      return respErr("insufficient credits");
    }

    const dec = await decreaseCredits({
      user_uuid: userUuid,
      trans_type: CreditsTransType.Pixelate,
      credits: CreditsAmount.PixelateCost,
    });

    // 5. 构建 prompt
    const prompt = buildPixelPrompt(trimmedEmoji);

    // 6. 调用 APICore 生成图片
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
      // 失败返还
      await increaseCredits({
        user_uuid: userUuid,
        trans_type: CreditsTransType.Refund,
        credits: CreditsAmount.PixelateCost,
        expired_at: dec?.expired_at ? new Date(dec.expired_at as any).toISOString() : undefined,
      });
      return respErr("Failed to pixelate. Try again.");
    }

    if (!images || images.length === 0) {
      // 失败返还
      await increaseCredits({
        user_uuid: userUuid,
        trans_type: CreditsTransType.Refund,
        credits: CreditsAmount.PixelateCost,
        expired_at: dec?.expired_at ? new Date(dec.expired_at as any).toISOString() : undefined,
      });
      return respErr("No image generated");
    }

    // 7. 上传图片到存储
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
      // 统一走本服务的签名代理，避免直连 R2 公网域名的网络不稳定
      imageUrl = `/api/image/${key}`;
    } catch (uploadErr) {
      console.error("Failed to upload image:", uploadErr);
      // 上传失败返还
      await increaseCredits({
        user_uuid: userUuid,
        trans_type: CreditsTransType.Refund,
        credits: CreditsAmount.PixelateCost,
        expired_at: dec?.expired_at ? new Date(dec.expired_at as any).toISOString() : undefined,
      });
      return respErr("Failed to save image");
    }

    // 8. 保存到数据库
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
      // 数据库失败返还
      await increaseCredits({
        user_uuid: userUuid,
        trans_type: CreditsTransType.Refund,
        credits: CreditsAmount.PixelateCost,
        expired_at: dec?.expired_at ? new Date(dec.expired_at as any).toISOString() : undefined,
      });
      return respErr("Failed to save work");
    }

  } catch (error: any) {
    console.error("Pixelate API error:", error);
    return respErr(error.message || "Failed to pixelate. Try again.");
  }
}
