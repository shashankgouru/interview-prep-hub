"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { NoteFullscreenButton } from "@/components/note-fullscreen-button";
import "@uiw/react-md-editor/markdown-editor.css";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

type Note = {
  id: string;
  content: string;
  authorId: string;
  author: { name: string };
};

export function NotesList({
  notes,
  isAdmin,
}: {
  notes: Note[];
  isAdmin: boolean;
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (notes.length === 0) {
    return <p className="text-zinc-500 text-sm">No notes from others yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2" data-color-mode="light">
      {notes.map((note) => (
        <div
          key={note.id}
          className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {note.author.name}
            </span>
            <div className="flex items-center gap-3">
              <NoteFullscreenButton
                title={`${note.author.name}'s Notes`}
                content={note.content}
              />
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
          <div className="p-4 text-sm max-h-72 overflow-y-auto">
            <MarkdownPreview source={note.content} />
          </div>
        </div>
      ))}
    </div>
  );
}