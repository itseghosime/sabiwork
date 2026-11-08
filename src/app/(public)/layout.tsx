import { PublicShell, type PublicAccount } from "@/components/public-shell";
import { workspaceRoutes, type AccountRole } from "@/features/accounts/access";
import { getSessionUser, getUserRole } from "@/lib/server/authorization";
import "./public-redesign.css";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let account: PublicAccount | null = null;
  let sessionUnavailable = false;

  try {
    const session = await getSessionUser();

    if (session.kind === "unavailable") {
      sessionUnavailable = true;
    } else if (session.kind === "authenticated") {
      let role: AccountRole | null = null;

      try {
        role = (await getUserRole(session.user.id))?.role ?? null;
      } catch (error) {
        console.error("[public] Could not load account role", error);
      }

      const firstName =
        session.user.name?.trim() || session.user.email?.split("@")[0] || "Account";
      account = {
        name: firstName,
        workspaceHref: role ? workspaceRoutes[role] : "/complete-profile",
        workspaceLabel: role
          ? `${role[0].toUpperCase()}${role.slice(1)} workspace`
          : "Finish your profile",
      };
    }
  } catch (error) {
    console.error("[public] Could not load account session", error);
    sessionUnavailable = true;
  }

  return (
    <PublicShell account={account} sessionUnavailable={sessionUnavailable}>
      {children}
    </PublicShell>
  );
}
