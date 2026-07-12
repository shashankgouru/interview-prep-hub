"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function AdminMembersList({
  users,
  currentUserId,
}: {
  users: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleRole(id: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    setLoadingId(id);

    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex items-center justify-between bg-white dark:bg-zinc-950"
        >
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {user.name}
              {user.id === currentUserId && (
                <span className="text-zinc-400 font-normal"> (you)</span>
              )}
            </p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs border border-zinc-200 dark:border-zinc-800 rounded-full px-2 py-0.5 text-zinc-500">
              {user.role}
            </span>
            {user.id !== currentUserId && (
              <button
                type="button"
                onClick={() => toggleRole(user.id, user.role)}
                disabled={loadingId === user.id}
                className="text-xs underline underline-offset-2 text-zinc-600 dark:text-zinc-400 disabled:opacity-50"
              >
                {loadingId === user.id
                  ? "Updating..."
                  : user.role === "ADMIN"
                  ? "Make Member"
                  : "Make Admin"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}