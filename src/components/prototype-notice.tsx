import type { ReactNode } from "react";

export function PrototypeNotice({ children }: { children: ReactNode }) {
  return (
    <aside className="prototype-notice" role="note" aria-label="Prototype limitation">
      <strong>Prototype only</strong>
      <span>{children}</span>
    </aside>
  );
}
