import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopicTabs } from "@/components/topic-tabs";
import { auth } from "@/lib/auth";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { name: "asc" } },
      parent: { include: { parent: true } },
      notes: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!topic) {
    notFound();
  }

  const rootCategory = topic.parent?.parent?.name ?? topic.parent?.name ?? topic.name;
  const isDSA = rootCategory === "DSA";
  const isAdmin = session?.user?.role === "ADMIN";

  const myNote = topic.notes.find((n) => n.authorId === userId);
  const othersNotes = topic.notes.filter((n) => n.authorId !== userId);

  const [myProblems, myResources] = userId
    ? await Promise.all([
        prisma.problem.findMany({
          where: { topicId: topic.id, createdById: userId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.resource.findMany({
          where: { topicId: topic.id, uploadedById: userId },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], []];

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-14">
      {topic.parent && (
        <Link
          href={`/topics/${topic.parent.slug}`}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← {topic.parent.name}
        </Link>
      )}

      <h1 className="text-2xl font-semibold tracking-tight mt-2 mb-8">
        {topic.name}
      </h1>

      {topic.children.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {topic.children.map((child) => (
            <Link
              key={child.id}
              href={`/topics/${child.slug}`}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-shadow duration-150"
            >
              <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
                {child.name}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <TopicTabs
          topicId={topic.id}
          isDSA={isDSA}
          isLoggedIn={!!userId}
          currentUserId={userId}
          isAdmin={isAdmin}
          myNote={myNote}
          othersNotes={othersNotes}
          myProblems={myProblems}
          myResources={myResources}
        />
      )}
    </main>
  );
}