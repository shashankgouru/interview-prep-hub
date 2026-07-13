"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 sm:px-10">
      <div className="w-full max-w-sm border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 bg-white dark:bg-zinc-950">
        <h1 className="text-xl font-semibold tracking-tight mb-6">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-sm text-zinc-500 mt-4 text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="underline underline-offset-2 text-zinc-900 dark:text-zinc-100"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}