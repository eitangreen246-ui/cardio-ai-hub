"use client";

import { CircleSlash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { hideNewsItem } from "@/app/actions/news";

export function RemoveNewsButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const remove = () => {
    if (!confirm(`Remove this item from the feed?\n\n"${title}"\n\nIt will not come back on future runs.`)) return;
    start(async () => {
      try {
        await hideNewsItem(id);
        router.refresh();
      } catch {
        alert("Remove failed — try again.");
      }
    });
  };

  return (
    <button
      onClick={remove}
      disabled={pending}
      className="hover-coral inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-faint transition-colors disabled:opacity-50"
      title="Remove this item (it will never be re-imported)"
    >
      <CircleSlash size={13} /> Remove
    </button>
  );
}
