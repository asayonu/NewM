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
    // 7筒: [x, y] が各丸の中心（0〜100）。7枚分並べる
    7: [
      [28, 26], [50, 26], [72, 26],
      [50, 50],
      [28, 74], [50, 74], [72, 74],
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
        const isRed = n === 1 || (n === 5 && i === 2);
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

  const stick = (x: number, y: number, h = 14) => (
    <g key={`${x}-${y}`}>
      <rect x={x - 3} y={y} width="6" height={h} rx="2" fill="#2d6a3e" />
      <rect x={x - 4} y={y - 3} width="8" height="4" rx="1" fill="#4a9458" />
    </g>
  );

  const layouts: Record<number, [number, number][]> = {
    2: [[38, 42], [62, 58]],
    3: [[50, 30], [38, 58], [62, 58]],
    4: [[38, 32], [62, 32], [38, 62], [62, 62]],
    5: [[38, 28], [62, 28], [50, 50], [38, 68], [62, 68]],
    6: [[32, 30], [50, 30], [68, 30], [32, 62], [50, 62], [68, 62]],
    7: [[32, 26], [50, 26], [68, 26], [50, 50], [32, 74], [50, 74], [68, 74]],
    8: [[30, 28], [46, 28], [62, 28], [78, 28], [30, 58], [46, 58], [62, 58], [78, 58]],
    9: [
      [28, 26], [50, 26], [72, 26],
      [28, 50], [50, 50], [72, 50],
      [28, 74], [50, 74], [72, 74],
    ],
  };

  const pts = layouts[n] ?? layouts[2];
  const redIdx = n === 5 ? 2 : -1;

  return (
    <>
      {pts.map(([x, y], i) => (
        <g key={i}>
          {stick(x, y, i === redIdx ? 16 : 14)}
          {i === redIdx && (
            <rect x={x - 3} y={y + 2} width="6" height="10" rx="1" fill="#c41e3a" />
          )}
        </g>
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
        x="22"
        y="22"
        width="56"
        height="56"
        rx="4"
        fill="none"
        stroke="#1e5a8a"
        strokeWidth="3"
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
