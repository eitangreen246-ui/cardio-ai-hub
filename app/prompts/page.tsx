import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import DbNotice from "@/components/DbNotice";
import { Stars } from "@/components/StarRating";
import { NewPromptButton, PromptsToolbar } from "@/components/prompts-client";
import { getPrompts } from "@/lib/queries";
import { averageRating, type Prompt } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Prompt library" };

function PromptCard({ prompt, index }: { prompt: Prompt; index: number }) {
  const avg = averageRating(prompt.ratings);
  return (
    <div
      className="card rise group relative flex flex-col p-5 transition-colors hover:border-pulse/60"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-pulse">
          {/* stretched link: whole card is clickable without nesting the copy button in an anchor */}
          <Link href={`/prompts/${prompt.id}`} className="outline-none after:absolute after:inset-0">
            {prompt.title}
          </Link>
        </h2>
        <span className="relative z-10">
          <CopyButton small text={prompt.content} promptId={prompt.id} />
        </span>
      </div>
      {prompt.description && <p className="mt-1.5 line-clamp-2 text-sm text-soft">{prompt.description}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-4">
        <span className="badge">{prompt.field_of_interest}</span>
        <span className="inline-flex items-center gap-1.5">
          <Stars value={avg} />
          <span className="font-mono text-[11px] text-faint">{avg ? avg.toFixed(1) : "—"}</span>
        </span>
        <span className="ml-auto font-mono text-[11px] text-faint">
          {prompt.author?.full_name ?? "Unknown"} · copied {prompt.copy_count}×
        </span>
      </div>
    </div>
  );
}

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const field = sp.field ?? "All";
  const sort = sp.sort ?? "newest";

  let prompts: Prompt[] = [];
  let dbError = false;
  try {
    prompts = await getPrompts({ q, field, sort });
  } catch {
    dbError = true;
  }

  const filtered = q || field !== "All";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Shared library</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Prompts</h1>
        </div>
        <NewPromptButton />
      </div>
      <div className="mt-5">
        <PromptsToolbar q={q} field={field} sort={sort} />
      </div>
      {dbError && <DbNotice />}
      {!dbError && prompts.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-lg font-semibold">
            {filtered ? "No prompts match your filters" : "No prompts yet"}
          </p>
          <p className="mt-1 text-sm text-soft">
            {filtered ? "Try clearing the search or filters." : "Be the first — add a prompt the team can reuse."}
          </p>
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p, i) => (
          <PromptCard key={p.id} prompt={p} index={i} />
        ))}
      </div>
    </div>
  );
}
