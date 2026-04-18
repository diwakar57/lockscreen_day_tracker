import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user — return current user's app settings
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { startDate: true, endDate: true, bgImageUrl: true, phoneModel: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH /api/user — update startDate, endDate, and/or bgImageUrl
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { startDate, endDate, bgImageUrl, phoneModel } = body as {
    startDate?: string | null;
    endDate?: string | null;
    bgImageUrl?: string | null;
    phoneModel?: string;
  };

  const data: {
    startDate?: Date | null;
    endDate?: Date | null;
    bgImageUrl?: string | null;
    phoneModel?: string;
  } = {};

  if (startDate !== undefined) {
    data.startDate = startDate ? new Date(startDate) : null;
  }
  if (endDate !== undefined) {
    data.endDate = endDate ? new Date(endDate) : null;
  }
  if (bgImageUrl !== undefined) {
    data.bgImageUrl = bgImageUrl ?? null;
  }
  if (phoneModel !== undefined) {
    data.phoneModel = phoneModel;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { startDate: true, endDate: true, bgImageUrl: true, phoneModel: true },
  });

  return NextResponse.json(updated);
}
