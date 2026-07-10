import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import StarRating from "@/components/StarRating";
import { PromptActions } from "@/components/prompts-client";
import { getPrompt } from "@/lib/queries";
import type { Prompt } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // malformed ids are a 404; real DB errors surface to app/error.tsx
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const prompt: Prompt | null = await getPrompt(id);
  if (!prompt) notFound();

  const created = new Date(prompt.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/prompts"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> All prompts
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{prompt.title}</h1>
        <PromptActions prompt={prompt} afterDelete />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="badge badge-blue">{prompt.field_of_interest}</span>
        <span className="badge">added {created}</span>
        <span className="badge">copied {prompt.copy_count}×</span>
      </div>
      {prompt.description && <p className="mt-4 text-soft">{prompt.description}</p>}

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--line)" }}>
          <span className="label mb-0">The prompt</span>
          <CopyButton text={prompt.content} promptId={prompt.id} small />
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap p-6 font-mono text-[13px] leading-relaxed">
          {prompt.content}
        </pre>
      </div>

      {prompt.remarks && (
        <div className="card mt-4 p-6">
          <span className="label">Author remarks</span>
          <p className="text-sm text-soft">{prompt.remarks}</p>
        </div>
      )}

      <div className="card mt-4 p-6">
        <span className="label">Rate this prompt</span>
        <StarRating promptId={prompt.id} ratings={prompt.ratings ?? []} />
      </div>
    </div>
  );
}
