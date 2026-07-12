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

  async function saveResource(finalUrl: string, key?: string) {
    setSaving(true);
    setError("");

    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, url: finalUrl, topicId, fileKey: key }),
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
                const file = res?.[0];
                if (file?.url) {
                  setUploadedUrl(file.url);
                  saveResource(file.url, file.key);
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

export function ResourcesList({
  resources,
  currentUserId,
  isAdmin,
}: {
  resources: Resource[];
  currentUserId?: string;
  isAdmin: boolean;
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource?")) return;
    await fetch(`/api/resources/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (resources.length === 0) {
    return <p className="text-zinc-500 text-sm mb-4">No resources added yet.</p>;
  }

  return (
    <ul className="space-y-2 mb-4">
      {resources.map((resource) => {
        const canManage = resource.uploadedById === currentUserId || isAdmin;
        return (
          <li key={resource.id}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 flex items-center justify-between text-sm bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-150"
            >
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {resource.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-800 rounded-full px-2 py-0.5">
                  {typeLabel(resource.type)}
                </span>
                {canManage && (
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(resource.id);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}