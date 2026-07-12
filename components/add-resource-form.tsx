"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/uploadthing-components";

type Resource = {
  id: string;
  title: string;
  type: string;
  url: string;
  uploadedById: string;
};

const UPLOAD_TYPES = ["PDF", "IMAGE", "CHEATSHEET"];
const LINK_TYPES = ["YOUTUBE", "ARTICLE", "GITHUB"];

function typeLabel(type: string) {
  switch (type) {
    case "PDF": return "PDF";
    case "IMAGE": return "Image";
    case "CHEATSHEET": return "Cheat Sheet";
    case "YOUTUBE": return "YouTube Link";
    case "ARTICLE": return "Article";
    case "GITHUB": return "GitHub Repo";
    default: return type;
  }
}

export function AddResourceForm({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("PDF");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isUploadType = UPLOAD_TYPES.includes(type);

  async function saveResource(finalUrl: string) {
    setSaving(true);
    setError("");

    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, url: finalUrl, topicId }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setTitle("");
    setLinkUrl("");
    setUploadedUrl("");
    setOpen(false);
    router.refresh();
  }

  async function handleLinkSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!linkUrl) {
      setError("Please enter a link");
      return;
    }
    await saveResource(linkUrl);
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        + Add Resource
      </Button>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 max-w-md">
      <input
        className="w-full border rounded-md px-3 py-2 text-sm"
        placeholder="Title (e.g. Striver's BFS Cheat Sheet)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        className="w-full border rounded-md px-3 py-2 text-sm"
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          setError("");
        }}
      >
        <optgroup label="Upload a file">
          {UPLOAD_TYPES.map((t) => (
            <option key={t} value={t}>{typeLabel(t)}</option>
          ))}
        </optgroup>
        <optgroup label="Paste a link">
          {LINK_TYPES.map((t) => (
            <option key={t} value={t}>{typeLabel(t)}</option>
          ))}
        </optgroup>
      </select>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {isUploadType ? (
        <div>
          {!title ? (
            <p className="text-xs text-zinc-500">Enter a title first, then upload.</p>
          ) : (
            <UploadButton
              endpoint="resourceUploader"
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.url;
                if (url) {
                  setUploadedUrl(url);
                  saveResource(url);
                }
              }}
              onUploadError={(err) => {
                setError(err.message);
              }}
            />
          )}
        </div>
      ) : (
        <form onSubmit={handleLinkSubmit} className="space-y-3">
          <input
            className="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="Paste link here"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </form>
      )}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(false)}
      >
        Cancel
      </Button>
    </div>
  );
}