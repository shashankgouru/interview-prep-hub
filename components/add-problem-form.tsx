"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Problem = {
  id: string;
  title: string;
  platform: string;
  difficulty: string;
  link: string;
  createdById: string;
};

function difficultyStyles(difficulty: string) {
  switch (difficulty) {
    case "EASY":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900";
    case "MEDIUM":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900";
    case "HARD":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900";
    default:
      return "bg-zinc-50 text-zinc-700 border-zinc-200";
  }
}

function ProblemForm({
  topicId,
  existing,
  onDone,
}: {
  topicId: string;
  existing?: Problem;
  onDone: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [platform, setPlatform] = useState(existing?.platform ?? "Leetcode");
  const [difficulty, setDifficulty] = useState(existing?.difficulty ?? "MEDIUM");
  const [link, setLink] = useState(existing?.link ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(
      existing ? `/api/problems/${existing.id}` : "/api/problems",
      {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, platform, difficulty, link, topicId }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3 max-w-md">
      <input
        className="w-full border rounded-md px-3 py-2 text-sm"
        placeholder="Problem title (e.g. Two Sum)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        className="w-full border rounded-md px-3 py-2 text-sm"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        <option value="Leetcode">Leetcode</option>
        <option value="GeeksforGeeks">GeeksforGeeks</option>
        <option value="Codeforces">Codeforces</option>
        <option value="HackerRank">HackerRank</option>
        <option value="Other">Other</option>
      </select>

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
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ProblemsList({
  topicId,
  problems,
  currentUserId,
  isAdmin,
}: {
  topicId: string;
  problems: Problem[];
  currentUserId?: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this problem?")) return;
    await fetch(`/api/problems/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      {problems.length > 0 ? (
        <ul className="space-y-2 mb-4">
          {problems.map((problem) => {
            const canManage = problem.createdById === currentUserId || isAdmin;

            if (editingId === problem.id) {
              return (
                <li key={problem.id}>
                  <ProblemForm
                    topicId={topicId}
                    existing={problem}
                    onDone={() => setEditingId(null)}
                  />
                </li>
              );
            }

            return (
              <li key={problem.id}>
                <a
                  href={problem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border rounded-lg p-3 flex items-center justify-between text-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  <span className="font-medium">{problem.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">{problem.platform}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${difficultyStyles(problem.difficulty)}`}
                    >
                      {problem.difficulty}
                    </span>
                    {canManage && (
                      <>
                        <button
                          type="button"
                          className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 ml-2"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditingId(problem.id);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(problem.id);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-zinc-500 text-sm mb-4">No problems added yet.</p>
      )}

      {adding ? (
        <ProblemForm topicId={topicId} onDone={() => setAdding(false)} />
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          + Add Problem
        </Button>
      )}
    </div>
  );
}