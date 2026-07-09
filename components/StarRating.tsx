"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { getAnonId } from "@/lib/anon";
import { ratePrompt } from "@/app/actions/prompts";
import type { Rating } from "@/lib/types";

export function Stars({ value, size = 13 }: { value: number | null; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={value !== null && value >= n - 0.5 ? "fill-amber text-amber" : "text-line"}
        />
      ))}
    </span>
  );
}

export default function StarRating({ promptId, ratings }: { promptId: string; ratings: Rating[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [hover, setHover] = useState(0);
  const [raterId, setRaterId] = useState<string | null>(null);

  // browser-only id — read after mount to avoid SSR/hydration mismatch
  useEffect(() => setRaterId(getAnonId()), []);

  const mine = raterId ? (ratings.find((r) => r.profile_id === raterId)?.rating ?? 0) : 0;
  const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null;

  const rate = (n: number) => {
    if (!raterId) return;
    start(async () => {
      try {
        await ratePrompt(promptId, raterId, n);
        router.refresh();
      } catch {
        alert("Could not save your rating — check your connection and try again.");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            disabled={pending || !raterId}
            onClick={() => rate(n)}
            onMouseEnter={() => setHover(n)}
            className="cursor-pointer p-0.5 transition-transform hover:scale-110"
            aria-label={`Rate ${n} out of 5`}
          >
            <Star
              size={22}
              className={(hover ? n <= hover : n <= mine) ? "fill-amber text-amber" : "text-faint"}
            />
          </button>
        ))}
      </div>
      <p className="font-mono text-xs text-faint">
        {avg
          ? `${avg.toFixed(1)} avg · ${ratings.length} rating${ratings.length === 1 ? "" : "s"}`
          : "No ratings yet"}
        {mine ? ` · yours: ${mine}` : ""}
      </p>
    </div>
  );
}
