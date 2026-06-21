"use client";

import { useId } from "react";
import type { TileId } from "@/lib/mahjong/tiles";
import { tileLabel } from "@/lib/mahjong/tiles";

type TileSize = "xs" | "sm" | "md" | "lg" | "fill";

type Props = {
  tile: TileId;
  size?: TileSize;
  highlight?: boolean;
  className?: string;
};

/** Tailwind の動的クラスは効かないため px で指定 */
const SIZE_PX: Record<Exclude<TileSize, "fill">, { w: number; h: number }> = {
  xs: { w: 24, h: 32 },
  sm: { w: 36, h: 48 },
  md: { w: 48, h: 64 },
  lg: { w: 72, h: 96 },
};

const MAN_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九"] as const;
const WIND = ["東", "南", "西", "北"] as const;

function PinCircles({ n }: { n: number }) {
  const positions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[32, 32], [68, 68]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[32, 32], [68, 32], [32, 68], [68, 68]],
    5: [[32, 32], [68, 32], [50, 50], [32, 68], [68, 68]],
    6: [[32, 28], [68, 28], [32, 50], [68, 50], [32, 72], [68, 72]],
    // 7筒: 上3・中1・下3（下4枚=中央+下段は赤）
    7: [
      [28, 20], [50, 26], [72, 32],
      [39, 50],[61, 50], 
      [39, 74], [61, 74],
    ],
    8: [[32, 26], [68, 26], [32, 44], [68, 44], [32, 62], [68, 62], [32, 80], [68, 80]],
    9: [
      [28, 26], [50, 26], [72, 26],
      [28, 50], [50, 50], [72, 50],
      [28, 74], [50, 74], [72, 74],
    ],
  };

  const pts = positions[n] ?? positions[1];
  const r = n === 1 ? 16 : n <= 4 ? 9 : 7.5;

  return (
    <>
      {pts.map(([cx, cy], i) => {
        const isRed =
          n === 1 ||
          (n === 5 && i === 2) ||
          (n === 7 && i >= 3) ||
          (n === 9 && cy === 50);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={isRed ? "#c41e3a" : "#1e5a8a"}
            stroke={isRed ? "#8b1528" : "#123d5c"}
            strokeWidth="1.2"
          />
        );
      })}
    </>
  );
}

/** 竹の1節（縦・斜めどちらも可） */
function BambooSegment({
  x1,
  y1,
  x2,
  y2,
  red = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  red?: boolean;
}) {
  const body = red ? "#c41e3a" : "#2d6a3e";
  const joint = red ? "#8b1528" : "#4a9458";
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={body}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <ellipse cx={x1} cy={y1} rx="3.2" ry="2.2" fill={joint} />
      <ellipse cx={x2} cy={y2} rx="3.2" ry="2.2" fill={joint} />
      <rect
        x={mx - 3.5}
        y={my - 1.2}
        width="7"
        height="2.4"
        rx="0.8"
        fill={joint}
      />
    </g>
  );
}

/** 8索: 上段W字・下段M字（鏡像） */
function SouEight() {
  return (
    <g>
      {/* 上段 W */}
      <BambooSegment x1={26} y1={24} x2={26} y2={40} />
      <BambooSegment x1={34} y1={24} x2={50} y2={40} />
      <BambooSegment x1={66} y1={24} x2={50} y2={40} />
      <BambooSegment x1={74} y1={24} x2={74} y2={40} />
      {/* 下段 M */}
      <BambooSegment x1={26} y1={60} x2={26} y2={76} />
      <BambooSegment x1={34} y1={76} x2={50} y2={60} />
      <BambooSegment x1={66} y1={76} x2={50} y2={60} />
      <BambooSegment x1={74} y1={60} x2={74} y2={76} />
    </g>
  );
}

function SouBamboo({ n }: { n: number }) {
  if (n === 1) {
    return (
      <g>
        <ellipse cx="50" cy="58" rx="22" ry="10" fill="#2d6a3e" />
        <path
          d="M50 18 C38 30 34 42 36 52 C42 48 48 44 50 42 C52 44 58 48 64 52 C66 42 62 30 50 18Z"
          fill="#3d8b55"
          stroke="#1f4d2e"
          strokeWidth="1"
        />
        <circle cx="44" cy="34" r="3" fill="#c41e3a" />
        <circle cx="56" cy="34" r="3" fill="#1e5a8a" />
      </g>
    );
  }

  if (n === 8) {
    return <SouEight />;
  }

  const layouts: Record<
    number,
    { x: number; y: number; h?: number; red?: boolean }[]
  > = {
    2: [
      { x: 50, y: 30, h: 18 },
      { x: 50, y: 58, h: 18 },
    ],
    3: [
      { x: 50, y: 28, h: 16 },
      { x: 38, y: 56, h: 16 },
      { x: 62, y: 56, h: 16 },
    ],
    4: [
      { x: 38, y: 30, h: 14 },
      { x: 62, y: 30, h: 14 },
      { x: 38, y: 58, h: 14 },
      { x: 62, y: 58, h: 14 },
    ],
    5: [
      { x: 35, y: 30, h: 12 },
      { x: 65, y: 30, h: 12 },
      { x: 50, y: 44, h: 16, red: true },
      { x: 35, y: 62, h: 12 },
      { x: 65, y: 62, h: 12 },
    ],
    6: [
      { x: 32, y: 28, h: 12 },
      { x: 50, y: 28, h: 12 },
      { x: 68, y: 28, h: 12 },
      { x: 32, y: 58, h: 12 },
      { x: 50, y: 58, h: 12 },
      { x: 68, y: 58, h: 12 },
    ],
    // 7索: 上3本は赤、中央1・下3は緑
    7: [
      { x: 28, y: 45, h: 14 },
      { x: 50, y: 20, h: 14, red: true },
      { x: 72, y: 45, h: 14 },
      { x: 50, y: 45, h: 16 },
      { x: 28, y: 70, h: 14 },
      { x: 50, y: 70, h: 14 },
      { x: 72, y: 70, h: 14 },
    ],
    9: [
      { x: 28, y: 20, h: 11 },
      { x: 50, y: 20, h: 11 , red: true },
      { x: 72, y: 20, h: 11 },
      { x: 28, y: 44, h: 11 },
      { x: 50, y: 44, h: 11 , red: true },
      { x: 72, y: 44, h: 11 },
      { x: 28, y: 68, h: 11 },
      { x: 50, y: 68, h: 11 , red: true },
      { x: 72, y: 68, h: 11 },
    ],
  };

  const sticks = layouts[n] ?? layouts[2];

  return (
    <>
      {sticks.map((s, i) => (
        <BambooSegment
          key={i}
          x1={s.x}
          y1={s.y}
          x2={s.x}
          y2={s.y + (s.h ?? 14)}
          red={s.red}
        />
      ))}
    </>
  );
}

function TileFace({ tile }: { tile: TileId }) {
  const num = Number(tile[0]);
  const suit = tile[1];

  if (suit === "m") {
    return (
      <g>
        <text
          x="50"
          y="46"
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill="#c41e3a"
          fontFamily="var(--font-noto-sans-jp), serif"
        >
          {MAN_NUM[num - 1]}
        </text>
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#2d6a3e"
          fontFamily="var(--font-noto-sans-jp), serif"
        >
          萬
        </text>
      </g>
    );
  }

  if (suit === "p") {
    return <PinCircles n={num} />;
  }

  if (suit === "s") {
    return <SouBamboo n={num} />;
  }

  if (num === 5) {
    return (
      <rect
      />
    );
  }

  if (num === 6) {
    return (
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="36"
        fontWeight="700"
        fill="#2d6a3e"
        fontFamily="var(--font-noto-sans-jp), serif"
      >
        發
      </text>
    );
  }

  if (num === 7) {
    return (
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="36"
        fontWeight="700"
        fill="#c41e3a"
        fontFamily="var(--font-noto-sans-jp), serif"
      >
        中
      </text>
    );
  }

  return (
    <text
      x="50"
      y="62"
      textAnchor="middle"
      fontSize="36"
      fontWeight="700"
      fill="#1a1a1a"
      fontFamily="var(--font-noto-sans-jp), serif"
    >
      {WIND[num - 1]}
    </text>
  );
}

export default function MahjongTile({
  tile,
  size = "md",
  highlight = false,
  className = "",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const sideGrad = `tileSide-${uid}`;
  const faceGrad = `tileFace-${uid}`;

  const boxStyle =
    size === "fill"
      ? { width: "100%", height: "100%" }
      : { width: SIZE_PX[size].w, height: SIZE_PX[size].h };

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={boxStyle}
      title={tileLabel(tile)}
      aria-label={tileLabel(tile)}
    >
      <svg
        viewBox="0 0 48 64"
        width="100%"
        height="100%"
        className="drop-shadow-md"
        role="img"
        aria-hidden
      >
        <defs>
          <linearGradient id={sideGrad} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1b4332" />
            <stop offset="100%" stopColor="#2d6a4f" />
          </linearGradient>
          <linearGradient id={faceGrad} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffef8" />
            <stop offset="100%" stopColor="#ebe4d4" />
          </linearGradient>
        </defs>

        <path d="M4 6 L4 58 L8 60 L8 8 Z" fill={`url(#${sideGrad})`} />
        <path d="M4 58 L44 58 L44 60 L8 60 Z" fill="#163d2e" />

        <rect
          x="6"
          y="4"
          width="38"
          height="54"
          rx="3"
          fill={`url(#${faceGrad})`}
          stroke={highlight ? "#10b981" : "#c8bfa8"}
          strokeWidth={highlight ? 2.5 : 1.2}
        />

        <g transform="translate(6, 4) scale(0.38, 0.54)">
          <TileFace tile={tile} />
        </g>
      </svg>

      {highlight && (
        <span className="pointer-events-none absolute -inset-1 rounded-md ring-2 ring-emerald-400 ring-offset-1 ring-offset-transparent" />
      )}
    </div>
  );
}
