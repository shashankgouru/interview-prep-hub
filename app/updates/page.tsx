import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DailyUpdateForm } from "@/components/daily-update-form";
import { DailyUpdatesList } from "@/components/daily-updates-list";
import { canViewAuthor } from "@/lib/visibility";

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export default async function UpdatesPage() {
  const session = await auth();
  const today = todayDateOnly();

  const [myTodayUpdate, allUpdates] = await Promise.all([
    session?.user?.id
      ? prisma.dailyUpdate.findUnique({
          where: {
            authorId_date: { authorId: session.user.id, date: today },
          },
        })
      : null,
    prisma.dailyUpdate.findMany({
      orderBy: { date: "desc" },
      include: { author: true },
      take: 50,
    }),
  ]);

  const visibleUpdates = allUpdates.filter((u) =>
    canViewAuthor(session?.user?.role, session?.user?.id, u.author.role, u.authorId)
  );

  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-6 sm:px-10 py-14">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Daily Updates</h1>

      {session?.user ? (
        <section className="mb-12">
          <p className="text-sm text-zinc-500 mb-2">Today</p>
          <DailyUpdateForm initialContent={myTodayUpdate?.content ?? ""} />
        </section>
      ) : (
        <p className="text-sm text-zinc-500 mb-12">Sign in to post your update.</p>
      )}

      <DailyUpdatesList
        updates={visibleUpdates}
        currentUserId={session?.user?.id}
        isAdmin={session?.user?.role === "ADMIN"}
        todayTime={today.getTime()}
      />
    </main>
  );
}