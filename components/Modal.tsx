"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// two modals can overlap — count locks, don't clobber
let scrollLocks = 0;

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    scrollLocks += 1;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  // Portal to <body>: cards animate `transform` on entry, which turns them into the
  // containing block for position:fixed descendants — a modal rendered in place gets
  // trapped inside the card instead of overlaying the page. Rendering at the document
  // root makes the overlay immune to any ancestor transform/filter/animation.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 backdrop-blur-sm sm:py-12"
      style={{ background: "var(--overlay)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="rise w-full max-w-[560px] p-7 outline-none"
        style={{ background: "var(--raised)", borderRadius: "26px", boxShadow: "var(--shadow-lg)" }}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors hover:border-blue"
            style={{ borderColor: "var(--line)", background: "var(--raised)" }}
          >
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
