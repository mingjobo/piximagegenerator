const fs = require('fs');
const path = require('path');

function icoFromPngFrames(frames) {
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;
  const count = frames.length;
  const header = Buffer.alloc(ICONDIR_SIZE + ICONDIRENTRY_SIZE * count);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4); // count
  let offset = ICONDIR_SIZE + ICONDIRENTRY_SIZE * count;
  const blocks = [];
  frames.forEach((f, i) => {
    const entryOffset = ICONDIR_SIZE + i * ICONDIRENTRY_SIZE;
    const w = f.size >= 256 ? 0 : f.size;
    header.writeUInt8(w, entryOffset + 0); // width
    header.writeUInt8(w, entryOffset + 1); // height
    header.writeUInt8(0, entryOffset + 2); // colors
    header.writeUInt8(0, entryOffset + 3); // reserved
    header.writeUInt16LE(1, entryOffset + 4); // planes
    header.writeUInt16LE(32, entryOffset + 6); // bit count
    header.writeUInt32LE(f.data.length, entryOffset + 8); // size
    header.writeUInt32LE(offset, entryOffset + 12); // offset
    blocks.push(f.data);
    offset += f.data.length;
  });
  return Buffer.concat([header, ...blocks]);
}

(function main(){
  const pub = path.join(process.cwd(), 'public');
  const sizes = [16,32,48,64];
  const frames = [];
  for (const s of sizes) {
    const p = path.join(pub, `favicon-${s}x${s}.png`);
    if (!fs.existsSync(p)) {
      console.error('missing', p);
      process.exit(1);
    }
    frames.push({ size: s, data: fs.readFileSync(p) });
  }
  const ico = icoFromPngFrames(frames);
  fs.writeFileSync(path.join(pub, 'favicon.ico'), ico);
  console.log('wrote favicon.ico', ico.length);
})();
