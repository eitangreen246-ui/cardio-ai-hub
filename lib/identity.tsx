"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Identity = { id: string; name: string };

type IdentityCtx = {
  profile: Identity | null;
  ready: boolean;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  choose: (p: Identity) => void;
  signOut: () => void;
};

const Ctx = createContext<IdentityCtx | null>(null);
const KEY = "cah-profile";

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch {
      // corrupt value — treat as signed out
    }
    setReady(true);
  }, []);

  // first visit: ask who this is
  useEffect(() => {
    if (ready && !profile) setPickerOpen(true);
  }, [ready, profile]);

  const choose = useCallback((p: Identity) => {
    setProfile(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {}
    setPickerOpen(false);
  }, []);

  const signOut = useCallback(() => {
    setProfile(null);
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setPickerOpen(true);
  }, []);

  return (
    <Ctx.Provider
      value={{
        profile,
        ready,
        pickerOpen,
        openPicker: () => setPickerOpen(true),
        closePicker: () => setPickerOpen(false),
        choose,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useIdentity(): IdentityCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIdentity must be used inside IdentityProvider");
  return ctx;
}
