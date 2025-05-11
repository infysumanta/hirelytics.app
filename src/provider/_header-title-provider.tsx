"use client";

import React, { createContext, useContext, useState } from "react";

interface HeaderTitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const HeaderTitleContext = createContext<HeaderTitleContextType | undefined>(
  undefined,
);

export function useHeaderTitle() {
  const context = useContext(HeaderTitleContext);
  if (!context) {
    throw new Error("useHeaderTitle must be used within a HeaderTitleProvider");
  }
  return context;
}

export function HeaderTitleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [title, setTitle] = useState<string>("");

  return (
    <HeaderTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderTitleContext.Provider>
  );
}
