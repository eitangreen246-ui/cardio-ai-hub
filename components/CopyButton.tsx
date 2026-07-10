"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { recordCopy } from "@/app/actions/prompts";

export default function CopyButton({
  text,
  promptId,
  small = false,
}: {
  text: string;
  promptId?: string;
  small?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      if (promptId) recordCopy(promptId).catch(() => {});
    } catch {
      // clipboard unavailable (http / permissions) — nothing sensible to do
    }
  };

  return (
    <button onClick={copy} className={`btn ${small ? "btn-sm" : ""} ${copied ? "btn-success" : ""}`}>
      {copied ? <Check size={small ? 13 : 15} /> : <Copy size={small ? 13 : 15} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
