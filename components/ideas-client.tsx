"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Modal from "./Modal";
import { createIdea, deleteIdea, updateIdea, type IdeaInput } from "@/app/actions/ideas";
import { IDEA_KINDS, IDEA_STATUSES, TOOL_CATEGORIES, type Recommendation } from "@/lib/types";

function IdeaForm({ initial, onDone }: { initial?: Recommendation; onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const knownCat = !initial || (TOOL_CATEGORIES as readonly string[]).includes(initial.category);
  const [name, setName] = useState(initial?.name ?? "");
  const [purpose, setPurpose] = useState(initial?.purpose ?? "");
  const [category, setCategory] = useState(knownCat ? (initial?.category ?? "Research") : "__custom");
  const [customCat, setCustomCat] = useState(knownCat ? "" : (initial?.category ?? ""));
  const [kind, setKind] = useState<IdeaInput["kind"]>(initial?.kind ?? "agent");
  const [status, setStatus] = useState<IdeaInput["status"]>(initial?.status ?? "submitted");

  const submit = () => {
    setError(null);
    const input: IdeaInput = {
      name: name.trim(),
      purpose: purpose.trim(),
      category: category === "__custom" ? customCat.trim() || "Other" : category,
      kind,
      status,
    };
    if (!input.name) return setError("Idea name is required");
    start(async () => {
      try {
        if (initial) await updateIdea(initial.id, input);
        else await createIdea(input);
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
        <label className="label">Idea name *</label>
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Competitor release-notes watcher"
        />
      </div>
      <div>
        <label className="label">Purpose</label>
        <textarea
          className="field field-block min-h-24"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="What problem would it solve for the team?"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">What kind of thing is it?</label>
          <select className="field" value={kind} onChange={(e) => setKind(e.target.value as IdeaInput["kind"])}>
            {IDEA_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            {TOOL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__custom">Custom…</option>
          </select>
        </div>
      </div>
      {category === "__custom" && (
        <div>
          <label className="label">Custom category</label>
          <input className="field" value={customCat} onChange={(e) => setCustomCat(e.target.value)} />
        </div>
      )}
      {initial && (
        <div>
          <label className="label">Status</label>
          <select className="field" value={status} onChange={(e) => setStatus(e.target.value as IdeaInput["status"])}>
            {IDEA_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mt-1 flex justify-end gap-2">
        <button className="btn" onClick={onDone}>
          Cancel
        </button>
        <button className="btn btn-amber btn-solid" disabled={pending} onClick={submit}>
          {initial ? "Save changes" : "Submit idea"}
        </button>
      </div>
    </div>
  );
}

export function NewIdeaButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-amber btn-solid" onClick={() => setOpen(true)}>
        <Plus size={15} /> New idea
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Propose an AI tool">
        <IdeaForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

/** Opens the same popup as "New idea", prefilled with this idea's details. */
export function IdeaActions({ idea }: { idea: Recommendation }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const remove = () => {
    if (!confirm(`Delete "${idea.name}"?`)) return;
    start(async () => {
      try {
        await deleteIdea(idea.id);
        router.refresh();
      } catch {
        alert("Delete failed — try again.");
      }
    });
  };

  return (
    <span className="inline-flex shrink-0 gap-2">
      <button className="btn btn-sm" onClick={() => setOpen(true)}>
        <Pencil size={13} /> Edit
      </button>
      <button className="btn btn-sm btn-coral" disabled={pending} onClick={remove}>
        <Trash2 size={13} /> Delete
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit idea">
        <IdeaForm initial={idea} onDone={() => setOpen(false)} />
      </Modal>
    </span>
  );
}
