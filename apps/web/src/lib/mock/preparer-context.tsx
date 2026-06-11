"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const PreparerContext = createContext<{
  name: string;
  setName: (name: string) => void;
} | null>(null);

const STORAGE_KEY = "eventrack-preparer-name";

export function PreparerProvider({
  children,
  defaultName = "",
}: {
  children: ReactNode;
  defaultName?: string;
}) {
  const [name, setNameState] = useState(defaultName);

  function setName(value: string) {
    const trimmed = value.trim();
    setNameState(trimmed);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, trimmed);
    }
  }

  return (
    <PreparerContext.Provider value={{ name, setName }}>
      {children}
    </PreparerContext.Provider>
  );
}

export function usePreparer() {
  const ctx = useContext(PreparerContext);
  if (!ctx) {
    return { name: "Kevin", setName: () => {} };
  }
  return ctx;
}

export function readStoredPreparerName() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

export function clearStoredPreparerName() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
