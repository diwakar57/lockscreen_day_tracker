import { ImageResponse } from "@vercel/og";
import { prisma } from "@/lib/prisma";

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

  for (let cols = 1; cols <= totalDays; cols++) {
    const rows = Math.ceil(totalDays / cols);

    for (let dotSize = 5; dotSize <= 120; dotSize += 1) {
      const gapSize = Math.max(2, Math.round(dotSize * 0.3));
      const totalWidth = cols * dotSize + (cols - 1) * gapSize;
      const totalHeight = rows * dotSize + (rows - 1) * gapSize;

      if (totalWidth > maxWidth || totalHeight > maxHeight) {
        break;
      }

      const score = totalWidth * totalHeight;
      if (score > bestScore) {
        bestScore = score;
        bestParams = { dotSize, gapSize, rows, cols };
      }
    }
  }

  return bestParams;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  if (!userId || typeof userId !== "string") {
    return new Response(
      JSON.stringify({ error: "Missing userId" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { startDate: true, endDate: true, bgImageUrl: true },
  });

  if (!user) {
    return new Response(
      JSON.stringify({ error: "User not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const { startDate, endDate, bgImageUrl } = user;

  if (!startDate || !endDate) {
    return new Response(
      JSON.stringify({ error: "User has not configured date range yet." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // UTC today (midnight)
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const MS_PER_DAY = 86400000;
  const totalDays = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY)
  );
  const rawPassed = Math.round((todayUTC.getTime() - startDate.getTime()) / MS_PER_DAY);
  const passedDays = Math.min(Math.max(rawPassed, 0), totalDays);

  // iPhone 15 Pro canvas
  const CANVAS_WIDTH = 1179;
  const CANVAS_HEIGHT = 2556;

  // iOS Lock Screen Safe Zone
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
        {/* Background image layer */}
        {bgImageUrl ? (
          <>
            {/* next/image cannot be used inside @vercel/og ImageResponse -- only native <img> is supported */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bgImageUrl}
              alt=""
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                objectFit: "cover",
              }}
            />
            {/* Dark overlay so dots remain visible */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                backgroundColor: "rgba(0,0,0,0.6)",
              }}
            />
          </>
        ) : null}

        {/* Dot grid */}
        {dots}
      </div>
    ),
    {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    }
  );
}
