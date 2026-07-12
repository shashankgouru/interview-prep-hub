"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { X, Maximize2, Download } from "lucide-react";
import "@uiw/react-md-editor/markdown-editor.css";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

function downloadMarkdown(title: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function NoteFullscreenButton({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const [open, setOpen] = useState(false);

  if (!content) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        title="Read fullscreen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 sm:p-10">
          <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-xl w-full max-w-3xl max-h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">
                {title}
              </span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => downloadMarkdown(title, content)}
                  className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  title="Download as markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto" data-color-mode="light">
              <MarkdownPreview source={content} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}