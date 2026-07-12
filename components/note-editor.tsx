"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

export function NoteEditor({
  topicId,
  initialContent,
}: {
  topicId: string;
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

  if (!editing) {
    return (
      <div className="space-y-3" data-color-mode="light">
        <div className="border rounded-lg p-4">
          <MarkdownPreview source={content} />
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          Edit Note
        </Button>
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