import "server-only";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AccountRole } from "@/features/accounts/access";
import { getAuth } from "./auth";
import { getDb } from "./db";
import { userProfiles } from "./schema";

type ProfileRow = { role: AccountRole };

export async function getSessionUser() {
  const cookieStore = await cookies();
  const hasSessionCookie =
    cookieStore.has("__Secure-neon-auth.session_token") ||
    cookieStore.has("__Secure-neon-auth.local.session_data");
  if (!hasSessionCookie) {
    return { kind: "unauthenticated" as const };
  }

  const { data, error } = await getAuth().getSession();
  if (error) {
    console.error("[auth] Session lookup failed", error.code);
    return { kind: "unavailable" as const };
  }
  if (!data?.user) return { kind: "unauthenticated" as const };
  return { kind: "authenticated" as const, user: data.user };
}

export async function getUserRole(userId: string): Promise<ProfileRow | null> {
  const [profile] = await getDb()
    .select({ role: userProfiles.role })
    .from(userProfiles)
    .where(eq(userProfiles.user_id, userId))
    .limit(1);
  return profile ?? null;
}

export async function authorizeRole(role: AccountRole) {
  const session = await getSessionUser();
  if (session.kind !== "authenticated") return session;

  let profile: ProfileRow | null;
  try {
    profile = await getUserRole(session.user.id);
  } catch (databaseError) {
    console.error("[auth] Role profile lookup failed", databaseError);
    return { kind: "unavailable" as const };
  }

  if (!profile) return { kind: "profile-required" as const, user: session.user };

  if (role === "admin") {
    if (profile.role !== "admin") return { kind: "forbidden" as const, user: session.user };
    return { kind: "authorized" as const, user: session.user, role: profile.role };
  }

  if (profile.role === "admin") {
    return { kind: "forbidden" as const, user: session.user };
  }

  return { kind: "authorized" as const, user: session.user, role: profile.role };
}

export async function requirePageRole(role: AccountRole) {
  const result = await authorizeRole(role);
  if (result.kind === "unavailable") {
    throw new Error("Authentication is temporarily unavailable.");
  }
  if (result.kind === "unauthenticated") redirect("/login");
  if (result.kind === "profile-required") redirect("/complete-profile");
  if (result.kind === "forbidden") redirect("/forbidden");
  return result.user;
}

export async function requireSignedInPage() {
  const session = await getSessionUser();
  if (session.kind === "unavailable") {
    throw new Error("Authentication is temporarily unavailable.");
  }
  if (session.kind === "unauthenticated") redirect("/login");
  return session.user;
}
