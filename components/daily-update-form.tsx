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

export function DailyUpdateForm({
  initialContent,
}: {
  initialContent: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [editing, setEditing] = useState(!initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    const res = await fetch("/api/daily-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="space-y-2" data-color-mode="light">
        <div className="border rounded-lg p-4">
          <MarkdownPreview source={content} />
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          Edit Today&apos;s Update
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-color-mode="light">
      <MDEditor value={content} onChange={(val) => setContent(val ?? "")} height={180} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Post Update"}
        </Button>
        {content && (
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}