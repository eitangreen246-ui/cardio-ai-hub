"use client";

import { Plus, UserRound } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import Modal from "./Modal";
import { useIdentity } from "@/lib/identity";
import { createProfile, listProfiles } from "@/app/actions/profiles";

export default function NamePicker() {
  const { pickerOpen, closePicker, choose, profile, ready } = useIdentity();
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!pickerOpen) return;
    setError(null);
    listProfiles()
      .then(setProfiles)
      .catch(() => setError("Could not reach the database. Check the Supabase configuration."));
  }, [pickerOpen]);

  if (!ready) return null;

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    start(async () => {
      try {
        const p = await createProfile(trimmed);
        choose({ id: p.id, name: p.full_name });
        setName("");
      } catch {
        setError("Could not save your name. Try again.");
      }
    });
  };

  return (
    <Modal
      open={pickerOpen}
      onClose={() => {
        if (profile) closePicker();
      }}
      title="Who are you?"
    >
      <p className="mb-4 text-sm text-soft">
        Pick your name so the prompts, tools and ideas you add carry your signature. No password — this
        is a trust-based internal tool.
      </p>
      {error && (
        <p className="mb-3 rounded-lg border border-pulse/40 bg-pulse/5 px-3 py-2 text-sm text-pulse">{error}</p>
      )}
      <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
        {profiles === null && !error && <p className="py-2 text-sm text-faint">Loading team…</p>}
        {profiles?.map((p) => (
          <button
            key={p.id}
            onClick={() => choose({ id: p.id, name: p.full_name })}
            className="flex items-center gap-2.5 rounded-lg border border-line bg-raised px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-pulse"
          >
            <UserRound size={15} className="text-faint" />
            {p.full_name}
          </button>
        ))}
        {profiles?.length === 0 && (
          <p className="py-1 text-sm text-faint">No team members yet — add yourself below.</p>
        )}
      </div>
      <div className="mt-4 border-t border-line pt-4">
        <label className="label" htmlFor="new-name">
          Add your name
        </label>
        <div className="flex gap-2">
          <input
            id="new-name"
            className="field"
            placeholder="e.g. Dana Levi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button onClick={submit} disabled={pending || !name.trim()} className="btn btn-primary shrink-0">
            <Plus size={15} /> Join
          </button>
        </div>
      </div>
    </Modal>
  );
}
