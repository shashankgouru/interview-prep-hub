import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  Code2,
  Brain,
  Laptop,
  FolderKanban,
  GraduationCap,
  BookOpen,
  StickyNote,
  ListChecks,
  Paperclip,
} from "lucide-react";

function topicIcon(name: string) {
  switch (name) {
    case "DSA": return Code2;
    case "Computer Fundamentals": return Brain;
    case "Development": return Laptop;
    case "Projects": return FolderKanban;
    case "Interview Preparation": return GraduationCap;
    default: return BookOpen;
  }
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export default async function Home() {
  const session = await auth();
  const today = todayDateOnly();

  const [topLevelTopics, recentNotes, recentProblems, recentResources, todaysUpdates] =
    await Promise.all([
      prisma.topic.findMany({
        where: { parentId: null },
        orderBy: { name: "asc" },
      }),
      prisma.note.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { author: true, topic: true },
      }),
      prisma.problem.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { createdBy: true, topic: true },
      }),
      prisma.resource.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: true, topic: true },
      }),
      prisma.dailyUpdate.findMany({
        where: { date: today },
        orderBy: { createdAt: "desc" },
        include: { author: true },
      }),
    ]);

  type FeedItem = {
    id: string;
    type: "note" | "problem" | "resource";
    actor: string;
    label: string;
    topicName: string;
    topicSlug: string;
    date: Date;
  };

  const feed: FeedItem[] = [
    ...recentNotes.map((n) => ({
      id: n.id,
      type: "note" as const,
      actor: n.author.name,
      label: "updated their notes",
      topicName: n.topic.name,
      topicSlug: n.topic.slug,
      date: n.updatedAt,
    })),
    ...recentProblems.map((p) => ({
      id: p.id,
      type: "problem" as const,
      actor: p.createdBy.name,
      label: `added "${p.title}"`,
      topicName: p.topic.name,
      topicSlug: p.topic.slug,
      date: p.createdAt,
    })),
    ...recentResources.map((r) => ({
      id: r.id,
      type: "resource" as const,
      actor: r.uploadedBy.name,
      label: `shared "${r.title}"`,
      topicName: r.topic.name,
      topicSlug: r.topic.slug,
      date: r.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  const feedIcon = {
    note: StickyNote,
    problem: ListChecks,
    resource: Paperclip,
  };

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">
        {greeting()}
        {session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="text-zinc-500 mt-1.5 mb-12">
        Here&apos;s what the group has been working on.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-14">
        {topLevelTopics.map((topic) => {
          const Icon = topicIcon(topic.name);
          return (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-3 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-shadow duration-150"
            >
              <Icon className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400" />
              <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
                {topic.name}
              </span>
            </Link>
          );
        })}
      </div>

      <section className="mb-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">
            Today&apos;s Updates
          </h2>
          <Link
            href="/updates"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            View all
          </Link>
        </div>

        {todaysUpdates.length > 0 ? (
          <div className="space-y-2">
            {todaysUpdates.map((update) => (
              <div
                key={update.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-950"
              >
                <p className="text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
                  {update.author.name}
                </p>
                <p className="text-sm text-zinc-500 whitespace-pre-wrap line-clamp-3">
                  {update.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">
            No one has posted today&apos;s update yet.{" "}
            <Link href="/updates" className="underline underline-offset-2">
              Be the first
            </Link>
          </p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 mb-4">
          Recent Activity
        </h2>

        {feed.length > 0 ? (
          <div className="space-y-2">
            {feed.map((item) => {
              const Icon = feedIcon[item.type];
              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={`/topics/${item.topicSlug}`}
                  className="flex items-center gap-3 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-150"
                >
                  <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="truncate text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {item.actor}
                    </span>{" "}
                    {item.label}{" "}
                    <span className="text-zinc-400">in {item.topicName}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">
            Nothing here yet — add a note, problem, or resource to get started.
          </p>
        )}
      </section>
    </main>
  );
}