/** Shared UI/access contract. Roles must come from a verified server session;
 * importing these values or rendering a shell does not authenticate anyone. */
export const accountRoles = ["customer", "artisan", "admin"] as const;
export type AccountRole = (typeof accountRoles)[number];
export const workspaceRoutes: Record<AccountRole, string> = {
  customer: "/jobs",
  artisan: "/artisan",
  admin: "/admin/verification",
};
export const recoveryContent = {
  forbidden: {
    eyebrow: "ACCESS RESTRICTED · DEMO SCREEN",
    title: "You don’t have access to this page.",
    description:
      "You may need a different account or permission to open this page. You can still explore local services from here.",
    reference: "Access restricted · permission required",
  },
  notFound: {
    eyebrow: "HTTP 404 · PAGE NOT FOUND",
    title: "We can’t find that page.",
    description:
      "We couldn’t find the page you were looking for. The link may have changed, but the right helping hand is still close by.",
    reference: "Page not found · 404",
  },
} as const;
