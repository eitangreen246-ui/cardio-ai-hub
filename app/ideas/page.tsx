import DbNotice from "@/components/DbNotice";
import { IdeaActions, NewIdeaButton } from "@/components/ideas-client";
import { getIdeas } from "@/lib/queries";
import { IDEA_KINDS, IDEA_STATUSES, type Recommendation } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ideas board" };

const STATUS_STYLE: Record<string, string> = {
  submitted: "badge",
  under_review: "badge badge-amber",
  in_development: "badge badge-blue",
  done: "badge badge-success",
};

export default async function IdeasPage() {
  let ideas: Recommendation[] = [];
  let dbError = false;
  try {
    ideas = await getIdeas();
  } catch {
    dbError = true;
  }

  const kindLabel = (v: string) => IDEA_KINDS.find((k) => k.value === v)?.label ?? v;
  const statusLabel = (v: string) => IDEA_STATUSES.find((s) => s.value === v)?.label ?? v;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow badge-amber">What we should build next</span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">Ideas</h1>
        </div>
        <NewIdeaButton />
      </div>
      {dbError && <DbNotice />}
      {!dbError && ideas.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-display text-lg font-bold">No ideas yet</p>
          <p className="mt-1 text-sm text-soft">
            Got a repetitive task an agent, prompt or automation could take over? Pitch it here.
          </p>
        </div>
      )}
      <div className="mt-6 flex flex-col gap-3">
        {ideas.map((idea, i) => (
          <div
            key={idea.id}
            className="card rise flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:justify-between"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-bold tracking-tight">{idea.name}</h2>
                <span className={STATUS_STYLE[idea.status] ?? "badge"}>{statusLabel(idea.status)}</span>
              </div>
              {idea.purpose && <p className="mt-1 text-sm text-soft">{idea.purpose}</p>}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="badge badge-amber">{kindLabel(idea.kind)}</span>
                <span className="badge">{idea.category}</span>
                <span className="text-[11px] font-semibold text-faint">
                  {new Date(idea.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <IdeaActions idea={idea} />
          </div>
        ))}
      </div>
    </div>
  );
}
