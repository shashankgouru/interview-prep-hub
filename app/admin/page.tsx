import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminMembersList } from "@/components/admin-members-list";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-14">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Manage Members</h1>
      <AdminMembersList users={users} currentUserId={session.user.id} />
    </main>
  );
}