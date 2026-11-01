"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function signOut() {
    if (pending) return;
    setPending(true);
    setErrorMessage("");
    try {
      const { error } = await authClient.signOut();
      if (error) {
        setErrorMessage(error.message || "Could not sign out. Try again.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setErrorMessage("Could not sign out. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="workspace-signout">
      {errorMessage && <span role="alert">{errorMessage}</span>}
      <button type="button" onClick={signOut} disabled={pending}>
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
