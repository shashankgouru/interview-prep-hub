"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AddProblemForm({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("Leetcode");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, platform, difficulty, link, topicId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    setTitle("");
    setLink("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        + Add Problem
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3 max-w-md">
      <input
        className="w-full border rounded-md px-3 py-2 text-sm"
        placeholder="Problem title (e.g. Leetcode 102)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="w-full border rounded-md px-3 py-2 text-sm"
        placeholder="Platform (e.g. Leetcode)"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      />
      <select
        className="w-full border rounded-md px-3 py-2 text-sm"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
      </select>
      <input
        className="w-full border rounded-md px-3 py-2 text-sm"
        placeholder="Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}