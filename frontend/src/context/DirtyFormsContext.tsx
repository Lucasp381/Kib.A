"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

type DirtyFormsState = Record<string, boolean>; // key: alerter.name, value: isDirty

interface DirtyFormsContextProps {
  dirtyForms: DirtyFormsState;
  setFormDirty: (alerterName: string, isDirty: boolean) => void;
}

const DirtyFormsContext = createContext<DirtyFormsContextProps | undefined>(undefined);

export const DirtyFormsProvider = ({ children }: { children: ReactNode }) => {
  const [dirtyForms, setDirtyForms] = useState<DirtyFormsState>({});

  const setFormDirty = (alerterName: string, isDirty: boolean) => {
    setDirtyForms((prev) => ({ ...prev, [alerterName]: isDirty }));
  };

  return (
    <DirtyFormsContext.Provider value={{ dirtyForms, setFormDirty }}>
      {children}
    </DirtyFormsContext.Provider>
  );
};

export const useDirtyForms = () => {
  const context = useContext(DirtyFormsContext);
  if (!context) {
    throw new Error("useDirtyForms must be used within a DirtyFormsProvider");
  }
  return context;
};
