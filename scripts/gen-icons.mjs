// Sinh icon PWA (PNG) không cần thư viện ngoài: nền xanh teal + 3 bậc thang trắng (biểu tượng thăng tiến).
// Chạy: npm run icons
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [15, 118, 110];
const FG = [255, 255, 255];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size, { rounded, padding }) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const r = rounded ? size * 0.22 : 0;
  // 3 cột tăng dần, căn giữa trong vùng an toàn
  const inner = size * (1 - padding * 2);
  const ox = size * padding, oy = size * padding;
  const barW = inner * 0.2, gap = inner * 0.1;
  const totalW = barW * 3 + gap * 2;
  const startX = ox + (inner - totalW) / 2;
  const baseY = oy + inner * 0.82;
  const heights = [0.3, 0.5, 0.7].map((h) => h * inner);

  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let a = 255;
      if (r) {
        const cx = x < r ? r : x > size - r ? size - r : x;
        const cy = y < r ? r : y > size - r ? size - r : y;
        if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) a = 0;
      }
      let col = BG;
      for (let i = 0; i < 3; i++) {
        const bx = startX + i * (barW + gap);
        if (x >= bx && x < bx + barW && y <= baseY && y > baseY - heights[i]) col = FG;
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = col[0]; raw[o + 1] = col[1]; raw[o + 2] = col[2]; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public', { recursive: true });
writeFileSync('public/icon-192.png', png(192, { rounded: true, padding: 0.18 }));
writeFileSync('public/icon-512.png', png(512, { rounded: true, padding: 0.18 }));
writeFileSync('public/icon-maskable-512.png', png(512, { rounded: false, padding: 0.26 }));
writeFileSync('public/apple-touch-icon.png', png(180, { rounded: false, padding: 0.2 }));
console.log('Đã tạo icon trong /public');
