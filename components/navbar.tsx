"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-white dark:bg-black dark:border-zinc-800 sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            Interview Prep Hub
          </Link>
          <Link
            href="/updates"
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Updates
          </Link>
          <Link
            href="/topics"
            className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Knowledge Base
          </Link>
        </div>

        {status === "loading" ? null : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full">
              <Avatar>
                <AvatarFallback>
                  {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
}