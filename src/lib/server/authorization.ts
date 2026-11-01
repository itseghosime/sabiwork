import "server-only";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { AccountRole } from "@/features/accounts/access";
import { getAuth } from "./auth";
import { getDb } from "./db";
import { userProfiles } from "./schema";

export async function authorizeRole(
  role: AccountRole,
  { allowUnverified = false }: { allowUnverified?: boolean } = {},
) {
  const { data, error } = await getAuth().getSession();
  if (error) {
    console.error("[auth] Session lookup failed", error.code);
    return { kind: "unavailable" as const };
  }
  const user = data?.user;
  if (!user) return { kind: "unauthenticated" as const };
  if (!user.emailVerified && !allowUnverified) {
    return { kind: "email-unverified" as const, user };
  }

  let profile: { role: AccountRole } | undefined;
  try {
    [profile] = await getDb()
      .select({ role: userProfiles.role })
      .from(userProfiles)
      .where(eq(userProfiles.user_id, user.id))
      .limit(1);
  } catch (databaseError) {
    console.error("[auth] Role profile lookup failed", databaseError);
    return { kind: "unavailable" as const };
  }

  if (!profile) return { kind: "profile-required" as const, user };
  if (profile.role !== role) return { kind: "forbidden" as const, user };
  return { kind: "authorized" as const, user, role: profile.role };
}

export async function requirePageRole(role: AccountRole) {
  const result = await authorizeRole(role);
  if (result.kind === "unavailable") {
    throw new Error("Authentication is temporarily unavailable.");
  }
  if (result.kind === "unauthenticated") redirect("/login");
  if (result.kind === "email-unverified") {
    redirect(`/verify-email?email=${encodeURIComponent(result.user.email)}`);
  }
  if (result.kind === "profile-required") redirect("/complete-profile");
  if (result.kind === "forbidden") redirect("/forbidden");
  return result.user;
}

export async function requireSignedInPage() {
  const { data, error } = await getAuth().getSession();
  if (error) {
    console.error("[auth] Session lookup failed", error.code);
    throw new Error("Authentication is temporarily unavailable.");
  }
  if (!data?.user) redirect("/login");
  if (!data.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(data.user.email)}`);
  }
  return data.user;
}
