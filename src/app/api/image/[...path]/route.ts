import { NextRequest, NextResponse } from "next/server";
import { newStorage } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join("/");

    // 构建 R2 的内部访问 URL
    const storage = newStorage();
    const endpoint = process.env.STORAGE_ENDPOINT;
    const bucket = process.env.STORAGE_BUCKET;

    if (!endpoint || !bucket) {
      return new NextResponse("Storage not configured", { status: 500 });
    }

    // 使用 aws4fetch 签名请求来获取图片
    const { AwsClient } = await import("aws4fetch");

    const client = new AwsClient({
      accessKeyId: process.env.STORAGE_ACCESS_KEY || "",
      secretAccessKey: process.env.STORAGE_SECRET_KEY || "",
    });

    const url = `${endpoint}/${bucket}/${path}`;
    const signedRequest = await client.sign(url, {
      method: "GET",
    });

    const response = await fetch(signedRequest);

    if (!response.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // 获取图片数据
    const imageBuffer = await response.arrayBuffer();

    // 返回图片，设置正确的 headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}