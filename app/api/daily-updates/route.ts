import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const today = todayDateOnly();

  const existing = await prisma.dailyUpdate.findUnique({
    where: {
      authorId_date: {
        authorId: session.user.id,
        date: today,
      },
    },
  });

  if (existing) {
    const isSameDay =
      new Date(existing.date).toDateString() === new Date().toDateString();
    if (!isSameDay) {
      return NextResponse.json(
        { error: "Cannot edit an update after the day has ended" },
        { status: 403 }
      );
    }
  }

  const update = await prisma.dailyUpdate.upsert({
    where: {
      authorId_date: {
        authorId: session.user.id,
        date: today,
      },
    },
    update: { content },
    create: {
      content,
      date: today,
      authorId: session.user.id,
    },
  });

  return NextResponse.json(update);
}