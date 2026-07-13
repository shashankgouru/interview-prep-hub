import { prisma } from "@/lib/prisma";
import { TopicSidebar } from "@/components/topic-sidebar";

export default async function TopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const topics = await prisma.topic.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, parentId: true },
  });

  return (
    <div className="flex-1 flex mx-auto max-w-8xl w-full px-6 sm:px-11">
        <TopicSidebar topics={topics} />
        <div className="flex-1 min-w-0 pl-8">{children}</div>
    </div>
  );
}