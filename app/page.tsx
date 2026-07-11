import Image from "next/image";

export default function Home() {
  return (
    <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back 👋</h1>
      <p className="text-zinc-500 mt-2">
        This will become the dashboard — daily updates from the group will show up here.
      </p>
    </main>
  );
}
