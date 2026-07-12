import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProblemsList } from "@/components/add-problem-form";
import { NoteEditor } from "@/components/note-editor";
import { AddResourceForm } from "@/components/add-resource-form";
import { auth } from "@/lib/auth";

function resourceTypeLabel(type: string) {
  switch (type) {
    case "PDF": return "PDF";
    case "IMAGE": return "Image";
    case "CHEATSHEET": return "Cheat Sheet";
    case "YOUTUBE": return "YouTube";
    case "ARTICLE": return "Article";
    case "GITHUB": return "GitHub";
    default: return type;
  }
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

  const myNote = topic.notes.find((n) => n.authorId === session?.user?.id);
  const othersNotes = topic.notes.filter((n) => n.authorId !== session?.user?.id);

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
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-medium mb-3">Community Notes</h2>

            {session?.user ? (
              <div className="mb-6">
                <p className="text-sm text-zinc-500 mb-2">Your notes</p>
                <NoteEditor topicId={topic.id} initialContent={myNote?.content ?? ""} />
              </div>
            ) : (
              <p className="text-sm text-zinc-500 mb-6">
                <Link href="/login" className="underline">Sign in</Link> to write your own notes.
              </p>
            )}

            {othersNotes.length > 0 && (
              <div className="space-y-4">
                {othersNotes.map((note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">{note.author.name}&apos;s Notes</p>
                    <div className="text-sm whitespace-pre-wrap">{note.content}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Problems</h2>

            <ProblemsList
              topicId={topic.id}
              problems={topic.problems}
              currentUserId={session?.user?.id}
              isAdmin={session?.user?.role === "ADMIN"}
            />
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Resources</h2>

            {topic.resources.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {topic.resources.map((resource) => (
                  <li key={resource.id}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border rounded-lg p-3 flex items-center justify-between text-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                    >
                      <span className="font-medium">{resource.title}</span>
                      <span className="text-zinc-500 text-xs border rounded-full px-2 py-0.5">
                        {resourceTypeLabel(resource.type)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 text-sm mb-4">No resources added yet.</p>
            )}

            <AddResourceForm topicId={topic.id} />
          </section>
        </div>
      )}
    </main>
  );
}