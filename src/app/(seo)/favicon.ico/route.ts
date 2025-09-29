import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// 将 PNG 直接封装为 ICO（目录项+PNG 数据），避免额外依赖
function wrapPngAsIco(png: Buffer, size: number) {
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;
  const header = Buffer.alloc(ICONDIR_SIZE + ICONDIRENTRY_SIZE);

  // ICONDIR
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(1, 4); // count

  // ICONDIRENTRY
  // 宽高：0 代表 256，Google 只需要 >=48，设 0 兼容性更好
  header.writeUInt8(size >= 256 ? 0 : size, 6); // width
  header.writeUInt8(size >= 256 ? 0 : size, 7); // height
  header.writeUInt8(0, 8); // color count
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // planes
  header.writeUInt16LE(32, 12); // bit count
  header.writeUInt32LE(png.length, 14); // bytes in resource
  header.writeUInt32LE(ICONDIR_SIZE + ICONDIRENTRY_SIZE, 18); // image offset

  return Buffer.concat([header, png]);
}

export async function GET() {
  // 使用现有 512x512 PNG 作为来源
  const pngPath = path.join(process.cwd(), "public", "icon-512.png");
  const png = await fs.readFile(pngPath);
  const ico = wrapPngAsIco(png, 256);

  return new NextResponse(ico, {
    status: 200,
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
    },
  });
}

