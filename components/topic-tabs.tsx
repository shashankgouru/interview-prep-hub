"use client";

import { useState } from "react";
import Link from "next/link";
import { NoteEditor } from "@/components/note-editor";
import { NotesList } from "@/components/notes-list";
import { ProblemsList } from "@/components/add-problem-form";
import { AddResourceForm, ResourcesList } from "@/components/add-resource-form";

type Note = {
  id: string;
  content: string;
  authorId: string;
  author: { name: string };
};

type Problem = {
  id: string;
  title: string;
  platform: string;
  difficulty: string;
  link: string;
  createdById: string;
};

type Resource = {
  id: string;
  title: string;
  type: string;
  url: string;
  uploadedById: string;
};

export function TopicTabs({
  topicId,
  isDSA,
  isLoggedIn,
  currentUserId,
  isAdmin,
  myNote,
  othersNotes,
  myProblems,
  myResources,
}: {
  topicId: string;
  isDSA: boolean;
  isLoggedIn: boolean;
  currentUserId?: string;
  isAdmin: boolean;
  myNote?: Note;
  othersNotes: Note[];
  myProblems: Problem[];
  myResources: Resource[];
}) {
  const tabs = isDSA
    ? (["notes", "problems", "resources"] as const)
    : (["notes", "resources"] as const);

  const [active, setActive] = useState<(typeof tabs)[number]>("notes");

  const tabLabel = {
    notes: "Notes",
    problems: "Your Problems",
    resources: "Your Resources",
  };

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === tab
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {tabLabel[tab]}
          </button>
        ))}
      </div>

      {active === "notes" && (
        <div className="space-y-8">
          {isLoggedIn ? (
            <div>
              <p className="text-sm text-zinc-500 mb-2">Your notes</p>
              <NoteEditor
                key={currentUserId ?? "guest"}
                topicId={topicId}
                noteId={myNote?.id}
                initialContent={myNote?.content ?? ""}
              />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              <Link href="/login" className="underline underline-offset-2">Sign in</Link> to write your own notes.
            </p>
          )}

          <div>
            <p className="text-sm text-zinc-500 mb-3">
              Everyone else&apos;s notes ({othersNotes.length})
            </p>
            <NotesList notes={othersNotes} isAdmin={isAdmin} />
          </div>
        </div>
      )}

      {active === "problems" && isDSA && (
        <div>
          {isLoggedIn ? (
            <ProblemsList
              topicId={topicId}
              problems={myProblems}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ) : (
            <p className="text-sm text-zinc-500">
              <Link href="/login" className="underline underline-offset-2">Sign in</Link> to track your own problems.
            </p>
          )}
        </div>
      )}

      {active === "resources" && (
        <div>
          {isLoggedIn ? (
            <>
              <ResourcesList
                resources={myResources}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
              <AddResourceForm topicId={topicId} />
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              <Link href="/login" className="underline underline-offset-2">Sign in</Link> to add your own resources.
            </p>
          )}
        </div>
      )}
    </div>
  );
}