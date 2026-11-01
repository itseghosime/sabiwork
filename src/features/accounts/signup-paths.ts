import type { IconName } from "@/components/icon";

/** The two entry points into the marketplace. Both create one account; the
 * path only decides the starting wording and where the account lands. */
export type SignupPath = "customer" | "artisan";

export type SignupPathContent = {
  href: string;
  role: SignupPath;
  workspace: string;
  switchLabel: string;
  roleNote: string;
  kicker: string;
  headline: string;
  summary: string;
  icon: IconName;
  steps: { title: string; text: string }[];
  cta: string;
  aside: string;
};

export const signupPaths: Record<SignupPath, SignupPathContent> = {
  customer: {
    href: "/signup/customer",
    role: "customer",
    workspace: "/jobs",
    switchLabel: "I'm hiring",
    roleNote: "I need work done",
    kicker: "FOR CUSTOMERS",
    headline: "I need to hire an artisan.",
    summary:
      "Post the job you need done, compare itemised quotes from local artisans, and follow the work through to sign-off.",
    icon: "search",
    steps: [
      {
        title: "Describe the job",
        text: "Say what needs doing, where in Benin City, and when you need it.",
      },
      {
        title: "Compare quotes",
        text: "Read itemised quotes side by side before you commit to anyone.",
      },
      {
        title: "Follow it through",
        text: "Track progress updates and confirm the work at the end.",
      },
    ],
    cta: "Join as a customer",
    aside: "You can add a work profile later if you also want to be hired.",
  },
  artisan: {
    href: "/signup/artisan",
    role: "artisan",
    workspace: "/artisan/profile",
    switchLabel: "I'm offering a trade",
    roleNote: "I want to be hired",
    kicker: "FOR ARTISANS",
    headline: "I want to be hired for my craft.",
    summary:
      "Build a work profile with your trade, the areas you cover and pricing guidance, then send quotes to open customer requests.",
    icon: "briefcase",
    steps: [
      {
        title: "Set up your work profile",
        text: "Your trade, the areas you cover, and the work you take on.",
      },
      {
        title: "Quote open requests",
        text: "Respond to customer requests with itemised pricing.",
      },
      {
        title: "Deliver and get reviewed",
        text: "Update progress as the job runs and collect completion reviews.",
      },
    ],
    cta: "Join as an artisan",
    aside: "You can post your own requests later if you also need to hire.",
  },
};

export const signupPathList = [signupPaths.customer, signupPaths.artisan];

export function isSignupPath(value: unknown): value is SignupPath {
  return value === "customer" || value === "artisan";
}
