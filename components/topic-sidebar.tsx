"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

type Topic = { id: string; name: string; slug: string; parentId: string | null };

export function TopicSidebar({ topics }: { topics: Topic[] }) {
  const pathname = usePathname();
  const currentSlug = pathname.startsWith("/topics/")
    ? pathname.replace("/topics/", "")
    : null;

  const childrenMap = useMemo(() => {
    const map = new Map<string | null, Topic[]>();
    for (const t of topics) {
      const key = t.parentId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [topics]);

  const ancestorIds = useMemo(() => {
    const ids = new Set<string>();
    let current = topics.find((t) => t.slug === currentSlug);
    while (current?.parentId) {
      ids.add(current.parentId);
      current = topics.find((t) => t.id === current!.parentId);
    }
    return ids;
  }, [currentSlug, topics]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpanded((prev) => new Set([...prev, ...ancestorIds]));
  }, [ancestorIds]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderNode(topic: Topic, depth: number) {
    const children = childrenMap.get(topic.id) ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(topic.id);
    const isActive = topic.slug === currentSlug;

    return (
      <div key={topic.id}>
        <div
          className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm ${
            isActive
              ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-medium"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggle(topic.id)}
              className="shrink-0 text-zinc-400"
            >
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <Link href={`/topics/${topic.slug}`} className="truncate flex-1">
            {topic.name}
          </Link>
        </div>
        {hasChildren && isExpanded && (
          <div>{children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  }

  const roots = childrenMap.get(null) ?? [];

  return (
    <nav className="w-48 shrink-0 border-r border-zinc-200 dark:border-zinc-800 py-14 pr-4 hidden md:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 px-2 mb-3">
        Knowledge Base
      </p>
      <div className="space-y-0.5">{roots.map((t) => renderNode(t, 0))}</div>
    </nav>
  );
}