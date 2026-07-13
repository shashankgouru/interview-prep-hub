import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function generateTempPassword() {
  return Math.random().toString(36).slice(-8);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const customPassword = body?.newPassword?.trim();

  const finalPassword =
    customPassword && customPassword.length >= 4
      ? customPassword
      : generateTempPassword();

  const hashedPassword = await bcrypt.hash(finalPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ tempPassword: finalPassword });
}