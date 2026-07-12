import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DailyUpdateForm } from "@/components/daily-update-form";

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
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

  return (
    <main className="flex-1 mx-auto max-w-3xl w-full px-6 py-14">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Daily Updates</h1>

      {session?.user ? (
        <section className="mb-12">
          <p className="text-sm text-zinc-500 mb-2">Today</p>
          <DailyUpdateForm initialContent={myTodayUpdate?.content ?? ""} />
        </section>
      ) : (
        <p className="text-sm text-zinc-500 mb-12">Sign in to post your update.</p>
      )}

      <section className="space-y-3">
        {allUpdates.map((update) => (
          <div
            key={update.id}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-950"
          >
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
                {update.author.name}
              </span>
              <span className="text-xs text-zinc-400">{formatDate(update.date)}</span>
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
              {update.content}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}