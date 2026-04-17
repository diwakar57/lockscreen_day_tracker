import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface GridParams {
  dotSize: number;
  gapSize: number;
  rows: number;
  cols: number;
}

function calculateGrid(totalDays: number, maxWidth: number, maxHeight: number): GridParams {
  let bestParams: GridParams = { dotSize: 10, gapSize: 5, rows: 1, cols: totalDays };
  let bestScore = -Infinity;

  // Try a range of columns to find the best fit
  for (let cols = 1; cols <= totalDays; cols++) {
    const rows = Math.ceil(totalDays / cols);

    // Try various dot sizes
    for (let dotSize = 5; dotSize <= 120; dotSize += 1) {
      const gapSize = Math.max(2, Math.round(dotSize * 0.3));
      const totalWidth = cols * dotSize + (cols - 1) * gapSize;
      const totalHeight = rows * dotSize + (rows - 1) * gapSize;

      if (totalWidth > maxWidth || totalHeight > maxHeight) {
        break; // dot too big for this column count
      }

      // Score: maximize area used while fitting within bounds
      const area = totalWidth * totalHeight;
      const score = area;

      if (score > bestScore) {
        bestScore = score;
        bestParams = { dotSize, gapSize, rows, cols };
      }
    }
  }

  return bestParams;
}

function parseUTCDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  if (isNaN(date.getTime())) return null;
  return date;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!startParam || !endParam) {
    return new Response(
      JSON.stringify({ error: "Missing required query parameters: start, end" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const startDate = parseUTCDate(startParam);
  const endDate = parseUTCDate(endParam);

  if (!startDate || !endDate) {
    return new Response(
      JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (endDate <= startDate) {
    return new Response(
      JSON.stringify({ error: "End date must be after start date." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // UTC today (midnight)
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const MS_PER_DAY = 86400000;
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
  const rawPassed = Math.round((todayUTC.getTime() - startDate.getTime()) / MS_PER_DAY);
  const passedDays = Math.min(Math.max(rawPassed, 0), totalDays);

  // iPhone 15 Pro canvas
  const CANVAS_WIDTH = 1179;
  const CANVAS_HEIGHT = 2556;

  // Safe zone
  const TOP_MARGIN = 850;
  const BOTTOM_MARGIN = 500;
  const SIDE_MARGIN = 100;

  const USABLE_WIDTH = CANVAS_WIDTH - SIDE_MARGIN * 2; // 979
  const USABLE_HEIGHT = CANVAS_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN; // 1206
  const SAFE_TOP = TOP_MARGIN;

  const { dotSize, gapSize, rows, cols } = calculateGrid(totalDays, USABLE_WIDTH, USABLE_HEIGHT);

  const gridWidth = cols * dotSize + (cols - 1) * gapSize;
  const gridHeight = rows * dotSize + (rows - 1) * gapSize;

  // Center the grid within the safe zone
  const gridLeft = SIDE_MARGIN + Math.floor((USABLE_WIDTH - gridWidth) / 2);
  const gridTop = SAFE_TOP + Math.floor((USABLE_HEIGHT - gridHeight) / 2);

  // Build dot elements
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < totalDays; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = gridLeft + col * (dotSize + gapSize);
    const y = gridTop + row * (dotSize + gapSize);
    const isPassed = i < passedDays;

    dots.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          backgroundColor: isPassed ? "#2C2C2E" : "#FFFFFF",
        }}
      />
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          backgroundColor: "#000000",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {dots}
      </div>
    ),
    {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    }
  );
}
