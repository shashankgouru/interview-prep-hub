import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddProblemForm } from "@/components/add-problem-form";

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
      problems: { orderBy: { createdAt: "desc" } },
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
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-medium mb-3">Problems</h2>

            {topic.problems.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {topic.problems.map((problem) => (
                  <li
                    key={problem.id}
                    className="border rounded-lg p-3 flex items-center justify-between text-sm"
                  >
                    <a
                      href={problem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      {problem.title}
                    </a>
                    <span className="text-zinc-500">
                      {problem.platform} · {problem.difficulty}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 text-sm mb-4">No problems added yet.</p>
            )}

            <AddProblemForm topicId={topic.id} />
          </section>
        </div>
      )}
    </main>
  );
}