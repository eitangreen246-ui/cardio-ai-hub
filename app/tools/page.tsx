import { ExternalLink } from "lucide-react";
import DbNotice from "@/components/DbNotice";
import { NewToolButton, ToolActions } from "@/components/tools-client";
import { getTools } from "@/lib/queries";
import type { Tool } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI tools" };

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const ready = tool.status === "ready";
  const isUrl = /^https?:\/\//i.test(tool.location.trim());
  return (
    <div className="card rise flex flex-col p-5" style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-lg font-semibold leading-snug tracking-tight">{tool.name}</h2>
        <span className={`badge shrink-0 ${ready ? "border-mint/50 text-mint" : "border-amber/50 text-amber"}`}>
          <span className={`size-1.5 rounded-full ${ready ? "bg-mint" : "bg-amber"}`} />
          {ready ? "Ready" : "In development"}
        </span>
      </div>
      {tool.purpose && <p className="mt-1.5 text-sm text-soft">{tool.purpose}</p>}
      <div className="mt-auto flex flex-col gap-3 pt-4">
        {tool.location && (
          <div className="text-sm">
            <span className="label mb-0.5">Where to find it</span>
            {isUrl ? (
              <a
                href={tool.location}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-pulse hover:underline"
              >
                <span className="max-w-60 truncate">{tool.location.replace(/^https?:\/\//i, "")}</span>
                <ExternalLink size={13} />
              </a>
            ) : (
              <span className="text-soft">{tool.location}</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="badge">{tool.category}</span>
          <ToolActions tool={tool} />
        </div>
      </div>
    </div>
  );
}

export default async function ToolsPage() {
  let tools: Tool[] = [];
  let dbError = false;
  try {
    tools = await getTools();
  } catch {
    dbError = true;
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">What we already have</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">AI tools</h1>
        </div>
        <NewToolButton />
      </div>
      {dbError && <DbNotice />}
      {!dbError && tools.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-lg font-semibold">No tools yet</p>
          <p className="mt-1 text-sm text-soft">
            Add the first tool card so the team knows what exists and where to find it.
          </p>
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t, i) => (
          <ToolCard key={t.id} tool={t} index={i} />
        ))}
      </div>
    </div>
  );
}
