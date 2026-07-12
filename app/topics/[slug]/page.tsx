import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProblemsList } from "@/components/add-problem-form";
import { NoteEditor } from "@/components/note-editor";
import { AddResourceForm, ResourcesList } from "@/components/add-resource-form";
import { auth } from "@/lib/auth";

async function getRootCategoryName(topicId: string): Promise<string> {
  let current = await prisma.topic.findUnique({ where: { id: topicId } });
  while (current?.parentId) {
    current = await prisma.topic.findUnique({ where: { id: current.parentId } });
  }
  return current?.name ?? "";
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const topic = await prisma.topic.findUnique({
    where: { slug },
    include: {
      children: { orderBy: { name: "asc" } },
      parent: true,
      problems: { orderBy: { createdAt: "desc" } },
      notes: { include: { author: true }, orderBy: { createdAt: "asc" } },
      resources: { include: { uploadedBy: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!topic) {
    notFound();
  }

  const rootCategory = await getRootCategoryName(topic.id);
  const isDSA = rootCategory === "DSA";

  const myNote = topic.notes.find((n) => n.authorId === session?.user?.id);
  const othersNotes = topic.notes.filter((n) => n.authorId !== session?.user?.id);

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
        <div className="space-y-10">
          <section>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 mb-4">
              Community Notes
            </h2>

            {session?.user ? (
              <div className="mb-6">
                <p className="text-sm text-zinc-500 mb-2">Your notes</p>
                <NoteEditor topicId={topic.id} initialContent={myNote?.content ?? ""} />
              </div>
            ) : (
              <p className="text-sm text-zinc-500 mb-6">
                <Link href="/login" className="underline underline-offset-2">Sign in</Link> to write your own notes.
              </p>
            )}

            {othersNotes.length > 0 && (
              <div className="space-y-3">
                {othersNotes.map((note) => (
                  <div
                    key={note.id}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-950"
                  >
                    <p className="text-sm font-medium mb-2 text-zinc-800 dark:text-zinc-200">
                      {note.author.name}&apos;s Notes
                    </p>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                      {note.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {isDSA && (
            <section>
              <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 mb-4">
                Problems
              </h2>

              <ProblemsList
                topicId={topic.id}
                problems={topic.problems}
                currentUserId={session?.user?.id}
                isAdmin={session?.user?.role === "ADMIN"}
              />
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 mb-4">
              Resources
            </h2>

            <ResourcesList
              resources={topic.resources}
              currentUserId={session?.user?.id}
              isAdmin={session?.user?.role === "ADMIN"}
            />

            <AddResourceForm topicId={topic.id} />
          </section>
        </div>
      )}
    </main>
  );
}