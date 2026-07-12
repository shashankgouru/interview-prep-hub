"use client";

import { useRouter } from "next/navigation";

type UpdateItem = {
  id: string;
  content: string;
  date: Date;
  authorId: string;
  author: { name: string };
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function DailyUpdatesList({
  updates,
  currentUserId,
  isAdmin,
  todayTime,
}: {
  updates: UpdateItem[];
  currentUserId?: string;
  isAdmin: boolean;
  todayTime: number;
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this update?")) return;
    await fetch(`/api/daily-updates/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="space-y-3">
      {updates.map((update) => {
        const isOwner = update.authorId === currentUserId;
        const isToday = new Date(update.date).getTime() === todayTime;
        const canDelete = isAdmin || (isOwner && isToday);

        return (
          <div
            key={update.id}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-950"
          >
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
                  {update.author.name}
                </span>
                <span className="text-xs text-zinc-400">{formatDate(update.date)}</span>
              </div>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(update.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
              {update.content}
            </div>
          </div>
        );
      })}
    </section>
  );
}