"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Modal from "./Modal";
import { createTool, deleteTool, updateTool, type ToolInput } from "@/app/actions/tools";
import { TOOL_CATEGORIES, type Tool } from "@/lib/types";

function ToolForm({ initial, onDone }: { initial?: Tool; onDone: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const knownCat = !initial || (TOOL_CATEGORIES as readonly string[]).includes(initial.category);
  const [name, setName] = useState(initial?.name ?? "");
  const [purpose, setPurpose] = useState(initial?.purpose ?? "");
  const [category, setCategory] = useState(knownCat ? (initial?.category ?? "Research") : "__custom");
  const [customCat, setCustomCat] = useState(knownCat ? "" : (initial?.category ?? ""));
  const [location, setLocation] = useState(initial?.location ?? "");
  const [status, setStatus] = useState<ToolInput["status"]>(initial?.status ?? "ready");

  const submit = () => {
    setError(null);
    const input: ToolInput = {
      name: name.trim(),
      purpose: purpose.trim(),
      category: category === "__custom" ? customCat.trim() || "Other" : category,
      location: location.trim(),
      status,
    };
    if (!input.name) return setError("Tool name is required");
    start(async () => {
      try {
        if (initial) await updateTool(initial.id, input);
        else await createTool(input);
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
        <label className="label">Tool name *</label>
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Perplexity Enterprise" />
      </div>
      <div>
        <label className="label">Purpose</label>
        <textarea
          className="field field-block min-h-20"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="What is this tool for?"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
        <div>
          <label className="label">Status</label>
          <select className="field" value={status} onChange={(e) => setStatus(e.target.value as ToolInput["status"])}>
            <option value="ready">Ready to use</option>
            <option value="in_development">In development</option>
          </select>
        </div>
      </div>
      {category === "__custom" && (
        <div>
          <label className="label">Custom category</label>
          <input className="field" value={customCat} onChange={(e) => setCustomCat(e.target.value)} />
        </div>
      )}
      <div>
        <label className="label">Where to find it</label>
        <input
          className="field"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Link or description, e.g. https://… or 'Ask IT for a license'"
        />
      </div>
      <div className="mt-1 flex justify-end gap-2">
        <button className="btn" onClick={onDone}>
          Cancel
        </button>
        <button className="btn btn-violet btn-solid" disabled={pending} onClick={submit}>
          {initial ? "Save changes" : "Add tool"}
        </button>
      </div>
    </div>
  );
}

export function NewToolButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-violet btn-solid" onClick={() => setOpen(true)}>
        <Plus size={15} /> New tool
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add a tool">
        <ToolForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

/** Opens the same popup as "New tool", prefilled with the card's details. */
export function ToolActions({ tool }: { tool: Tool }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const remove = () => {
    if (!confirm(`Delete "${tool.name}"?`)) return;
    start(async () => {
      try {
        await deleteTool(tool.id);
        router.refresh();
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
      <Modal open={open} onClose={() => setOpen(false)} title="Edit tool">
        <ToolForm initial={tool} onDone={() => setOpen(false)} />
      </Modal>
    </span>
  );
}
