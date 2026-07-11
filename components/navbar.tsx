import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b bg-white dark:bg-black dark:border-zinc-800 sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <span className="font-semibold tracking-tight">Interview Prep Hub</span>
        <Button size="sm">Sign In</Button>
      </div>
    </header>
  );
}