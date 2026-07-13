"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
  const [resetOpenId, setResetOpenId] = useState<string | null>(null);
  const [customPassword, setCustomPassword] = useState("");
  const [revealedPassword, setRevealedPassword] = useState<{
    userId: string;
    password: string;
  } | null>(null);

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

  async function submitReset(id: string) {
    setLoadingId(id);

    const res = await fetch(`/api/admin/users/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: customPassword || undefined }),
    });
    const data = await res.json();

    setLoadingId(null);
    setResetOpenId(null);
    setCustomPassword("");

    if (data.tempPassword) {
      setRevealedPassword({ userId: id, password: data.tempPassword });
    }
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between">
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
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setResetOpenId(resetOpenId === user.id ? null : user.id)
                    }
                    className="text-xs underline underline-offset-2 text-zinc-600 dark:text-zinc-400"
                  >
                    Reset Password
                  </button>
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
                </>
              )}
            </div>
          </div>

          {resetOpenId === user.id && (
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 space-y-2">
              <input
                type="text"
                placeholder="Type a new password (or leave blank to auto-generate)"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                className="w-full border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => submitReset(user.id)}
                  disabled={loadingId === user.id}
                >
                  {loadingId === user.id ? "Setting..." : "Set Password"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setResetOpenId(null);
                    setCustomPassword("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {revealedPassword?.userId === user.id && (
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs">
              <p className="text-zinc-500 mb-1">
                New password (share this with them directly, this won&apos;t be shown again):
              </p>
              <code className="bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded font-mono text-zinc-800 dark:text-zinc-200 select-all">
                {revealedPassword.password}
              </code>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}