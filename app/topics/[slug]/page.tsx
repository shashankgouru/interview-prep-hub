import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { name: "asc" } },
      parent: true,
    },
  });

  if (!topic) {
    notFound();
  }

  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-12">
      {topic.parent && (
        <Link
          href={`/topics/${topic.parent.slug}`}
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← {topic.parent.name}
        </Link>
      )}

      <h1 className="text-2xl font-semibold tracking-tight mt-2 mb-6">
        {topic.name}
      </h1>

      {topic.children.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {topic.children.map((child) => (
            <Link
              key={child.id}
              href={`/topics/${child.slug}`}
              className="border rounded-lg p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <span className="font-medium">{child.name}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500">
          This is a leaf topic — notes, resources, and problems will go here in a later phase.
        </p>
      )}
    </main>
  );
}