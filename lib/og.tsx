import { ImageResponse } from "next/og";
import { getFreeSpaceIndex, type Board } from "@/lib/board";

/** The size link previews expect. */
export const OG_SIZE = { width: 1200, height: 630 };

// Share images are always light, so these mirror the light theme in globals.css.
// The image renderer cannot read CSS variables or oklch colours.
const INK = "#0a0a0a";
const MUTED = "#737373";
const LINE = "#e5e5e5";
const PAPER = "#ffffff";
const DAUBER = "#8b45f5";
const DAUB = "rgba(139, 69, 245, 0.28)";

const STAR =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

const CARD_MAX = 486;
const LOGO_DOTS = [9, 16, 23];

type Grid = Pick<Board, "rows" | "cols" | "freeSpace" | "prompts">;

/** Same mark as components/logo.tsx, with the colours written out. */
function LogoMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill={INK} />
      {LOGO_DOTS.flatMap((cy, row) =>
        LOGO_DOTS.map((cx, col) =>
          row === col ? (
            <circle key={`${row}${col}`} cx={cx} cy={cy} r="3.2" fill={DAUBER} />
          ) : (
            <circle key={`${row}${col}`} cx={cx} cy={cy} r="2.5" fill={PAPER} opacity="0.3" />
          ),
        ),
      )}
    </svg>
  );
}

/** Keeps long squares inside their cell; the renderer has no reliable line clamp. */
function shorten(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** The bingo card itself. `daubed` marks squares as if someone were mid-game. */
function Card({ grid, daubed = [] }: { grid: Grid; daubed?: readonly number[] }) {
  const { rows, cols } = grid;
  const cell = Math.floor(CARD_MAX / Math.max(rows, cols));
  const freeSpaceIndex = getFreeSpaceIndex(grid);
  const fontSize = Math.max(11, Math.round(cell * 0.125));
  // Roughly what fits on four lines at this cell width.
  const maxChars = Math.round((cell / fontSize) * 6.5);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 2,
        borderRadius: 24,
        overflow: "hidden",
        background: LINE,
        boxShadow: "0 24px 48px rgba(0, 0, 0, 0.08)",
      }}
    >
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} style={{ display: "flex", gap: 2 }}>
          {Array.from({ length: cols }, (_, col) => {
            const index = row * cols + col;
            const isFree = index === freeSpaceIndex;
            const marked = isFree || daubed.includes(index);
            return (
              <div
                key={col}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: cell,
                  height: cell,
                  padding: Math.round(cell * 0.08),
                  background: PAPER,
                  overflow: "hidden",
                }}
              >
                {marked && (
                  <div
                    style={{
                      position: "absolute",
                      top: cell * 0.11,
                      left: cell * 0.11,
                      width: cell * 0.78,
                      height: cell * 0.78,
                      // A plain round stamp: the renderer's support for the uneven
                      // blob shape used on the site is not certain.
                      borderRadius: "50%",
                      background: DAUB,
                    }}
                  />
                )}
                {isFree ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      fontSize: fontSize * 1.1,
                    }}
                  >
                    <svg width={cell * 0.24} height={cell * 0.24} viewBox="0 0 24 24">
                      <path d={STAR} fill={INK} />
                    </svg>
                    Free
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      fontSize,
                      lineHeight: 1.2,
                    }}
                  >
                    {shorten(grid.prompts[index] ?? "", maxChars)}
                  </div>
                )}
                {!isFree && (
                  // The line players write a name on.
                  <div
                    style={{
                      width: "100%",
                      height: Math.round(cell * 0.1),
                      borderBottom: `1px dashed ${marked ? DAUBER : "#c4c4c4"}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Brand and copy on the left, a card on the right. */
function Frame({
  headline,
  detail,
  children,
}: {
  headline: React.ReactNode;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 56,
        width: "100%",
        height: "100%",
        padding: 64,
        background: "#fafafa",
        color: INK,
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          padding: "8px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30 }}>
          <LogoMark size={44} />
          Human Bingo
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {headline}
          <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, color: MUTED }}>
            {detail}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexShrink: 0 }}>{children}</div>
    </div>
  );
}

const DEMO: Grid = {
  rows: 3,
  cols: 3,
  freeSpace: true,
  prompts: [
    "Has a pet",
    "Speaks three languages",
    "Is left-handed",
    "Plays an instrument",
    "",
    "Has run a marathon",
    "Was born abroad",
    "Drinks coffee black",
    "Has met a celebrity",
  ],
};

/** Preview for the homepage, and for any page without one of its own. */
export function siteImage(init?: ResponseInit) {
  const words = "Bingo where every square is a".split(" ");
  return new ImageResponse(
    <Frame
      detail="Make an icebreaker card in a minute and share one link."
      headline={
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 16,
            fontSize: 66,
            lineHeight: 1.12,
            letterSpacing: -2,
          }}
        >
          {words.map((word, i) => (
            <span key={i}>{word}</span>
          ))}
          <span
            style={{
              padding: "0 14px",
              marginLeft: -8,
              borderRadius: "50%",
              background: DAUB,
            }}
          >
            person.
          </span>
        </div>
      }
    >
      {/* A finished diagonal, as on the logo. */}
      <Card grid={DEMO} daubed={[0, 8]} />
    </Frame>,
    { ...OG_SIZE, ...init },
  );
}

/** Preview for a shared board: its title beside the real card. */
export function boardImage(board: Grid & Pick<Board, "title">, init?: ResponseInit) {
  const { length } = board.title;
  const fontSize = length <= 22 ? 68 : length <= 44 ? 54 : 42;
  return new ImageResponse(
    <Frame
      detail={`${board.rows} × ${board.cols} icebreaker card. Find a different person for every square.`}
      headline={
        <div style={{ display: "flex", fontSize, lineHeight: 1.12, letterSpacing: -1.5 }}>
          {board.title}
        </div>
      }
    >
      <Card grid={board} />
    </Frame>,
    { ...OG_SIZE, ...init },
  );
}
