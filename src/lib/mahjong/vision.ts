import type { TileId } from "./tiles";

type Rgb = { r: number; g: number; b: number };

function sampleCenter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): Rgb {
  const marginX = w * 0.18;
  const marginY = h * 0.15;
  const sx = Math.floor(x + marginX);
  const sy = Math.floor(y + marginY);
  const sw = Math.max(1, Math.floor(w - marginX * 2));
  const sh = Math.max(1, Math.floor(h - marginY * 2));
  const data = ctx.getImageData(sx, sy, sw, sh).data;

  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;

  for (let i = 0; i < data.length; i += 4) {
    const pr = data[i];
    const pg = data[i + 1];
    const pb = data[i + 2];
    const lum = pr + pg + pb;
    if (lum < 120 || lum > 740) continue;
    r += pr;
    g += pg;
    b += pb;
    n++;
  }

  if (n === 0) return { r: 128, g: 128, b: 128 };
  return { r: r / n, g: g / n, b: b / n };
}

function detectSuit(rgb: Rgb): "m" | "p" | "s" | "z" | null {
  const { r, g, b } = rgb;
  if (g > r * 1.15 && g > b * 1.05 && g > 90) return "s";
  if (b > r * 1.05 && b > g * 1.05 && b > 85) return "p";
  if (r > g * 1.2 && r > b * 1.15 && r > 95) return "m";
  if (Math.abs(r - g) < 35 && Math.abs(g - b) < 35) return "z";
  return null;
}

/** 筒子: 青い円の塊を粗く数える */
function estimatePinNumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): number {
  const sx = Math.floor(x + w * 0.2);
  const sy = Math.floor(y + h * 0.2);
  const sw = Math.max(1, Math.floor(w * 0.6));
  const sh = Math.max(1, Math.floor(h * 0.6));
  const data = ctx.getImageData(sx, sy, sw, sh);
  const { width, height } = data;

  const grid = new Uint8Array(width * height);
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const i = (py * width + px) * 4;
      const r = data.data[i];
      const g = data.data[i + 1];
      const b = data.data[i + 2];
      grid[py * width + px] =
        b > 80 && b > r * 1.05 && b > g * 0.95 ? 1 : 0;
    }
  }

  const visited = new Uint8Array(width * height);
  let blobs = 0;

  const flood = (start: number) => {
    const stack = [start];
    let size = 0;
    while (stack.length) {
      const idx = stack.pop()!;
      if (visited[idx] || !grid[idx]) continue;
      visited[idx] = 1;
      size++;
      const px = idx % width;
      const py = Math.floor(idx / width);
      if (px > 0) stack.push(idx - 1);
      if (px < width - 1) stack.push(idx + 1);
      if (py > 0) stack.push(idx - width);
      if (py < height - 1) stack.push(idx + width);
    }
    return size;
  };

  for (let i = 0; i < grid.length; i++) {
    if (grid[i] && !visited[i]) {
      const size = flood(i);
      if (size > 12) blobs++;
    }
  }

  return Math.min(9, Math.max(1, blobs));
}

/** 索子: 緑成分の縦ストライプを粗く数える */
function estimateSouNumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): number {
  const sx = Math.floor(x + w * 0.25);
  const sy = Math.floor(y + h * 0.2);
  const sw = Math.max(1, Math.floor(w * 0.5));
  const sh = Math.max(1, Math.floor(h * 0.65));
  const data = ctx.getImageData(sx, sy, sw, sh);
  const colScore = new Float32Array(sw);

  for (let cx = 0; cx < sw; cx++) {
    let score = 0;
    for (let cy = 0; cy < sh; cy++) {
      const i = (cy * sw + cx) * 4;
      const r = data.data[i];
      const g = data.data[i + 1];
      if (g > r * 1.1 && g > 60) score++;
    }
    colScore[cx] = score / sh;
  }

  let peaks = 0;
  const threshold = 0.35;
  for (let cx = 1; cx < sw - 1; cx++) {
    if (
      colScore[cx] > threshold &&
      colScore[cx] >= colScore[cx - 1] &&
      colScore[cx] >= colScore[cx + 1]
    ) {
      peaks++;
    }
  }

  return Math.min(9, Math.max(1, peaks || 1));
}

function estimateHonor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rgb: Rgb,
): TileId {
  const sx = Math.floor(x + w * 0.2);
  const sy = Math.floor(y + h * 0.25);
  const sw = Math.max(1, Math.floor(w * 0.6));
  const sh = Math.max(1, Math.floor(h * 0.5));
  const data = ctx.getImageData(sx, sy, sw, sh).data;

  let red = 0;
  let green = 0;
  let dark = 0;
  let n = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    n++;
    if (r > 150 && r > g * 1.3) red++;
    if (g > 120 && g > r * 1.1) green++;
    if (r + g + b < 180) dark++;
  }

  if (red / n > 0.08) return "7z";
  if (green / n > 0.08) return "6z";
  if (dark / n < 0.05) return "5z";
  if (rgb.r > rgb.b && rgb.r > rgb.g) return "1z";
  if (rgb.g > rgb.r) return "2z";
  if (rgb.b > rgb.r) return "3z";
  return "4z";
}

/**
 * 1枚分の牌画像領域を推定（精度は照明・牌面に依存。必ず手動補正可能にする）
 */
export function classifyTileRegion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): TileId | null {
  const rgb = sampleCenter(ctx, x, y, w, h);
  const suit = detectSuit(rgb);
  if (!suit) return null;

  if (suit === "z") {
    return estimateHonor(ctx, x, y, w, h, rgb);
  }

  let num = 5;
  if (suit === "p") num = estimatePinNumber(ctx, x, y, w, h);
  if (suit === "s") num = estimateSouNumber(ctx, x, y, w, h);
  if (suit === "m") {
    num = rgb.r > 160 ? 9 : rgb.r > 140 ? 7 : rgb.r > 120 ? 5 : 3;
  }

  return `${num}${suit}` as TileId;
}

export type SlotRect = { x: number; y: number; w: number; h: number };

/** 画面幅に14枚並べたスロット（正規化座標 0-1） */
export function defaultSlotRects(
  count = 14,
  top = 0.52,
  height = 0.38,
): SlotRect[] {
  const pad = 0.02;
  const gap = 0.004;
  const totalGap = gap * (count - 1);
  const slotW = (1 - pad * 2 - totalGap) / count;

  return Array.from({ length: count }, (_, i) => ({
    x: pad + i * (slotW + gap),
    y: top,
    w: slotW,
    h: height,
  }));
}

export function scanSlotsFromCanvas(
  canvas: HTMLCanvasElement,
  rects: SlotRect[],
): (TileId | null)[] {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return rects.map(() => null);

  const cw = canvas.width;
  const ch = canvas.height;

  return rects.map((rect) => {
    const x = rect.x * cw;
    const y = rect.y * ch;
    const w = rect.w * cw;
    const h = rect.h * ch;
    return classifyTileRegion(ctx, x, y, w, h);
  });
}
