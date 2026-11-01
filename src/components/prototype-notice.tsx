import type { ReactNode } from "react";

export function PrototypeNotice({ children }: { children: ReactNode }) {
  return (
    <aside className="prototype-notice" role="note" aria-label="Feature availability note">
      <strong>Feature availability</strong>
      <span>{children}</span>
    </aside>
  );
}
