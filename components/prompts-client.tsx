"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Modal from "./Modal";
import { createPrompt, deletePrompt, updatePrompt, type PromptInput } from "@/app/actions/prompts";
import { FIELD_OPTIONS, type Prompt } from "@/lib/types";

function PromptForm({ initial, onDone }: { initial?: Prompt; onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const knownField = !initial || (FIELD_OPTIONS as readonly string[]).includes(initial.field_of_interest);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [field, setField] = useState(knownField ? (initial?.field_of_interest ?? "Feature Writing") : "__custom");
  const [customField, setCustomField] = useState(knownField ? "" : (initial?.field_of_interest ?? ""));
  const [content, setContent] = useState(initial?.content ?? "");
  const [remarks, setRemarks] = useState(initial?.remarks ?? "");

  const submit = () => {
    setError(null);
    const input: PromptInput = {
      title: title.trim(),
      description: description.trim(),
      field_of_interest: field === "__custom" ? customField.trim() || "Other" : field,
      content,
      remarks: remarks.trim(),
    };
    // validate client-side: server-action error messages are redacted in production builds
    if (!input.title) return setError("Prompt name is required");
    if (!input.content.trim()) return setError("The prompt text is required");
    start(async () => {
      try {
        if (initial) await updatePrompt(initial.id, input);
        else await createPrompt(input);
        router.refresh();
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-2xl border px-3.5 py-2.5 text-sm" style={{ borderColor: "color-mix(in oklch, var(--coral) 40%, transparent)", background: "color-mix(in oklch, var(--coral) 6%, transparent)", color: "var(--coral)" }}>
          {error}
        </p>
      )}
      <div>
        <label className="label">Prompt name *</label>
        <input
          className="field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Competitive teardown of a device page"
        />
      </div>
      <div>
        <label className="label">Short description</label>
        <input
          className="field"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this prompt do?"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Field of interest</label>
          <select className="field" value={field} onChange={(e) => setField(e.target.value)}>
            {FIELD_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
            <option value="__custom">Custom…</option>
          </select>
        </div>
        {field === "__custom" && (
          <div>
            <label className="label">Custom field</label>
            <input
              className="field"
              value={customField}
              onChange={(e) => setCustomField(e.target.value)}
              placeholder="e.g. Clinical validation"
            />
          </div>
        )}
      </div>
      <div>
        <label className="label">The prompt * — the Copy button copies exactly this text</label>
        <textarea
          className="field field-block min-h-44 font-mono text-[13px] leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the full prompt text — nothing else. Notes go in Remarks below."
        />
        <p
          className="mt-1.5 rounded-xl border px-3 py-1.5 text-xs"
          style={{ borderColor: "color-mix(in oklch, var(--amber) 40%, transparent)", background: "color-mix(in oklch, var(--amber) 8%, transparent)", color: "var(--amber)" }}
        >
          Reminder: never include patient data (PHI) in prompts.
        </p>
      </div>
      <div>
        <label className="label">Remarks (optional) — notes for teammates, never copied</label>
        <input
          className="field"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder='e.g. "Works best with long documents attached"'
        />
      </div>
      <div className="mt-1 flex justify-end gap-2">
        <button className="btn" onClick={onDone}>
          Cancel
        </button>
        <button className="btn btn-blue btn-solid" disabled={pending} onClick={submit}>
          {initial ? "Save changes" : "Add prompt"}
        </button>
      </div>
    </div>
  );
}

export function NewPromptButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-blue btn-solid" onClick={() => setOpen(true)}>
        <Plus size={15} /> New prompt
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add a prompt">
        <PromptForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function PromptActions({ prompt, afterDelete = false }: { prompt: Prompt; afterDelete?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const remove = () => {
    if (!confirm(`Delete "${prompt.title}"? This cannot be undone.`)) return;
    start(async () => {
      try {
        await deletePrompt(prompt.id);
        if (afterDelete) router.push("/prompts");
        else router.refresh();
      } catch {
        alert("Delete failed — try again.");
      }
    });
  };

  return (
    <span className="inline-flex gap-2">
      <button className="btn btn-sm" onClick={() => setOpen(true)}>
        <Pencil size={13} /> Edit
      </button>
      <button className="btn btn-sm btn-coral" disabled={pending} onClick={remove}>
        <Trash2 size={13} /> Delete
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit prompt">
        <PromptForm initial={prompt} onDone={() => setOpen(false)} />
      </Modal>
    </span>
  );
}

export function PromptsToolbar({ q, field, sort }: { q: string; field: string; sort: string }) {
  const router = useRouter();
  const [search, setSearch] = useState(q);

  // keep the input in sync when the URL changes underneath us (back/forward)
  useEffect(() => {
    setSearch(q);
  }, [q]);

  const apply = (next: { q?: string; field?: string; sort?: string }) => {
    const sp = new URLSearchParams();
    const vq = next.q ?? search;
    const vf = next.field ?? field;
    const vs = next.sort ?? sort;
    if (vq) sp.set("q", vq);
    if (vf && vf !== "All") sp.set("field", vf);
    if (vs && vs !== "newest") sp.set("sort", vs);
    router.replace(`/prompts${sp.size ? `?${sp}` : ""}`);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== q) apply({ q: search });
    }, 350);
    return () => clearTimeout(t);
    // q/field/sort are deps so a pending timer is re-created with fresh values and
    // cannot clobber a filter change made during the debounce window
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, q, field, sort]);

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
        <input
          className="field field-icon-left w-[230px]"
          placeholder="Search prompts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <select className="field w-auto" value={field} onChange={(e) => apply({ field: e.target.value })}>
        <option value="All">All fields</option>
        {FIELD_OPTIONS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      <select className="field w-auto" value={sort} onChange={(e) => apply({ sort: e.target.value })}>
        <option value="newest">Newest</option>
        <option value="top">Top rated</option>
        <option value="copied">Most copied</option>
      </select>
    </div>
  );
}
