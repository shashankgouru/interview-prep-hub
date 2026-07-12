import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, type, url, topicId } = await req.json();

  if (!title || !type || !url || !topicId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const resource = await prisma.resource.create({
    data: {
      title,
      type,
      url,
      topicId,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json(resource);
}