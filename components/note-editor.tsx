"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { NoteFullscreenButton } from "@/components/note-fullscreen-button";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

export function NoteEditor({
  topicId,
  noteId,
  initialContent,
}: {
  topicId: string;
  noteId?: string;
  initialContent: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [editing, setEditing] = useState(!initialContent);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, topicId }),
    });
    setSaving(false);
    setSavedAt(Date.now());
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!noteId) return;
    if (!confirm("Delete your note on this topic?")) return;

    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    setContent("");
    setEditing(true);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="space-y-3" data-color-mode="light">
        <div className="border rounded-lg p-4">
          <MarkdownPreview source={content} />
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit Note
          </Button>
          <NoteFullscreenButton title="Your Notes" content={content} />
          {noteId && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete Note
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-color-mode="light">
      <MDEditor value={content} onChange={(val) => setContent(val ?? "")} height={250} />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Note"}
        </Button>
        {content && (
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
        {savedAt && !saving && (
          <span className="text-xs text-green-600">✓ Saved</span>
        )}
      </div>
    </div>
  );
}