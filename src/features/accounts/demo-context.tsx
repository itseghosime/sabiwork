"use client";
import { createContext, useContext, useState } from "react";
import { demoCredentials } from "./demo-adapter";
const Context = createContext<{
  email: string;
  setEmail: (value: string) => void;
} | null>(null);
export function AccountDemoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [email, setEmail] = useState<string>(demoCredentials.email);
  // Only the sample email is kept in memory between these routes. Never retain passwords.
  return (
    <Context.Provider value={{ email, setEmail }}>{children}</Context.Provider>
  );
}
export function useAccountDemo() {
  const context = useContext(Context);
  if (!context) throw new Error("AccountDemoProvider is required");
  return context;
}
