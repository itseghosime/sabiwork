import "server-only";

import { getDb } from "./db";
import { auditLogs } from "./schema";

export type AuditSeverityValue = "info" | "warning" | "critical";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export function adminActor(user: SessionUser): string {
  const label = user.name?.trim() || user.email?.trim();
  return label ? label.slice(0, 120) : `Admin ${user.id.slice(0, 8)}`;
}

export async function recordAudit(entry: {
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  severity?: AuditSeverityValue;
  gateway?: string;
}) {
  try {
    await getDb()
      .insert(auditLogs)
      .values({
        actor: entry.actor.slice(0, 120),
        actor_role: entry.actorRole.slice(0, 80),
        action: entry.action.slice(0, 120),
        target: entry.target.slice(0, 200),
        severity: entry.severity ?? "info",
        gateway: entry.gateway?.slice(0, 40) ?? "BN-04",
      });
  } catch (error) {
    console.error("[audit] Could not record admin action", error);
  }
}
