import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, topicId } = await req.json();

  if (!content || !topicId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const note = await prisma.note.upsert({
    where: {
      topicId_authorId: {
        topicId,
        authorId: session.user.id,
      },
    },
    update: { content },
    create: {
      content,
      topicId,
      authorId: session.user.id,
    },
  });

  return NextResponse.json(note);
}