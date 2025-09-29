import fs from "fs";
import path from "path";
import sharp from "sharp";

const PUBLIC = path.join(process.cwd(), "public");

async function ensureDir(p: string) {
  await fs.promises.mkdir(path.dirname(p), { recursive: true });
}

function icoFromPngFrames(frames: { size: number; data: Buffer }[]) {
  // ICONDIR (6 bytes) + N * ICONDIRENTRY (16 bytes) + PNG data blocks
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;
  const count = frames.length;
  const header = Buffer.alloc(ICONDIR_SIZE + ICONDIRENTRY_SIZE * count);

  // ICONDIR
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4); // count

  let offset = ICONDIR_SIZE + ICONDIRENTRY_SIZE * count;
  const dataBlocks: Buffer[] = [];
  frames.forEach((frame, i) => {
    const { size, data } = frame;
    const entryOffset = ICONDIR_SIZE + i * ICONDIRENTRY_SIZE;
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset + 0); // width
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1); // height
    header.writeUInt8(0, entryOffset + 2); // color count
    header.writeUInt8(0, entryOffset + 3); // reserved
    header.writeUInt16LE(1, entryOffset + 4); // planes
    header.writeUInt16LE(32, entryOffset + 6); // bit count
    header.writeUInt32LE(data.length, entryOffset + 8); // bytes in resource
    header.writeUInt32LE(offset, entryOffset + 12); // image offset
    dataBlocks.push(data);
    offset += data.length;
  });

  return Buffer.concat([header, ...dataBlocks]);
}

async function main() {
  const candidates = ["logo.png", "icon-512.png", "icon-192.png"];
  let source: string | null = null;
  for (const name of candidates) {
    const p = path.join(PUBLIC, name);
    if (fs.existsSync(p)) {
      source = p;
      break;
    }
  }
  if (!source) throw new Error("未找到源图（public/logo.png 或 icon-512.png）");

  // 目标尺寸
  const sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];

  // 生成各尺寸 PNG
  const pngBuffers: Record<number, Buffer> = {} as any;
  for (const s of sizes) {
    const buf = await sharp(source).resize(s, s).png({ compressionLevel: 9 }).toBuffer();
    pngBuffers[s] = buf;
  }

  // 写常见文件名
  await ensureDir(path.join(PUBLIC, "favicon-16x16.png"));
  await fs.promises.writeFile(path.join(PUBLIC, "favicon-16x16.png"), pngBuffers[16]);
  await fs.promises.writeFile(path.join(PUBLIC, "favicon-32x32.png"), pngBuffers[32]);
  await fs.promises.writeFile(path.join(PUBLIC, "favicon-48x48.png"), pngBuffers[48]);
  await fs.promises.writeFile(path.join(PUBLIC, "favicon-64x64.png"), pngBuffers[64]);
  await fs.promises.writeFile(path.join(PUBLIC, "apple-icon.png"), pngBuffers[180]);
  await fs.promises.writeFile(path.join(PUBLIC, "android-chrome-192x192.png"), pngBuffers[192]);
  await fs.promises.writeFile(path.join(PUBLIC, "android-chrome-512x512.png"), pngBuffers[512]);
  await fs.promises.writeFile(path.join(PUBLIC, "icon.png"), pngBuffers[512]);

  // 生成多尺寸 ICO（包含 16/32/48/64/128/256，使用 PNG 格式嵌入）
  const ico = icoFromPngFrames([
    { size: 16, data: pngBuffers[16] },
    { size: 32, data: pngBuffers[32] },
    { size: 48, data: pngBuffers[48] },
    { size: 64, data: pngBuffers[64] },
    { size: 128, data: pngBuffers[128] },
    { size: 256, data: pngBuffers[256] },
  ]);
  await fs.promises.writeFile(path.join(PUBLIC, "favicon.ico"), ico);

  // 也同步覆盖已有的 icon-192.png / icon-512.png 以统一来源
  await fs.promises.writeFile(path.join(PUBLIC, "icon-192.png"), pngBuffers[192]);
  await fs.promises.writeFile(path.join(PUBLIC, "icon-512.png"), pngBuffers[512]);

  console.log("✅ 已生成完整图标集至 public/ 目录");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

