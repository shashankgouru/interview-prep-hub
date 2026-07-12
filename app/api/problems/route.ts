import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, platform, difficulty, link, topicId } = await req.json();

  if (!title || !platform || !difficulty || !link || !topicId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const problem = await prisma.problem.create({
    data: {
      title,
      platform,
      difficulty,
      link,
      topicId,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(problem);
}