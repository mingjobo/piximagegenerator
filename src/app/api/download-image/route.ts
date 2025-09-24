import { respErr, respData } from "@/lib/resp";
import { getUserUuid } from "@/services/user";
import { getUserCredits } from "@/services/credit";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return respErr("Please sign in to download", 401);
    }

    const { image_url, emoji } = await req.json();

    if (!image_url) {
      return respErr("Image URL is required");
    }

    // Get user credits to determine if user is pro
    const userCredits = await getUserCredits(user_uuid);
    const isPro = userCredits.is_pro || false;

    // Set resolution based on user tier
    // Free users: 512x512
    // Pro users: 1024x1024
    const targetSize = isPro ? 1024 : 512;

    try {
      // Fetch the original image
      let imageResponse: Response;

      // Handle both external URLs and internal paths
      if (image_url.startsWith("http")) {
        imageResponse = await fetch(image_url);
      } else if (image_url.startsWith("/api/image/")) {
        // Internal proxy path
        const baseUrl = new URL(req.url).origin;
        imageResponse = await fetch(`${baseUrl}${image_url}`);
      } else {
        return respErr("Invalid image URL");
      }

      if (!imageResponse.ok) {
        return respErr("Failed to fetch image");
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      // Process image with Sharp
      const processedImage = await sharp(Buffer.from(imageBuffer))
        .resize(targetSize, targetSize, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
          kernel: "nearest" // Preserve pixel art quality
        })
        .png()
        .toBuffer();

      // Return the processed image
      return new Response(processedImage, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="pixelart_${targetSize}x${targetSize}.png"`,
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      console.error("Image processing error:", error);
      return respErr("Failed to process image");
    }
  } catch (e) {
    console.error("Download image failed:", e);
    return respErr("Download failed");
  }
}