import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TopicsPage() {
  const topLevelTopics = await prisma.topic.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Knowledge Base</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {topLevelTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            className="border rounded-lg p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <span className="font-medium">{topic.name}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}