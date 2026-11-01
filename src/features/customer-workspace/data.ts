import type { IconName } from "@/components/icon";
import { artisans, categories, type CategoryId } from "@/features/search/data";

/** Maps discovery trades onto the request composer's category labels. */
export const tradeRequestLabels: Record<CategoryId, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  carpentry: "Carpentry",
  tailoring: "Tailoring",
  painting: "Painting",
  cleaning: "Cleaning",
};

export const exploreTrades = categories.map((category) => ({
  id: category.id,
  name: category.name,
  short: category.short,
  description: category.description,
  icon: category.icon as IconName,
  services: category.services,
  requestLabel: tradeRequestLabels[category.id],
}));

export const featuredArtisans = [...artisans]
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 3);

export interface SupportTopic {
  id: string;
  label: string;
}

export const supportTopics: readonly SupportTopic[] = [
  { id: "booking", label: "Booking, quotes or sign-off" },
  { id: "payment", label: "Payment, receipt or test mode" },
  { id: "review", label: "Review or rating" },
  { id: "account", label: "Account access or profile" },
  { id: "safety", label: "Report a safety or conduct concern" },
  { id: "other", label: "Something else" },
];

export interface SupportFaq {
  question: string;
  answer: string;
}

export const supportFaqs: readonly SupportFaq[] = [
  {
    question: "How do quotes and bookings work?",
    answer:
      "You describe the work in a service request, artisans send itemised quotes, and you accept one quote. Accepting a quote opens a booking with a 50% deposit milestone and a 50% completion balance milestone.",
  },
  {
    question: "Are any real payments taken?",
    answer:
      "No. Payments in this build are simulated. No card is charged, no bank transfer is collected, and the milestone amounts shown come from the quote totals saved for your booking.",
  },
  {
    question: "Is my money held in escrow?",
    answer:
      "SabiWork does not operate an escrow or refund guarantee yet. Milestone payments are test-mode records, and opening a dispute does not automatically reverse or release any funds.",
  },
  {
    question: "When can I rate an artisan?",
    answer:
      "Reviews open once you sign off a booking as completed. Each completed booking accepts one review with a 1–5 star rating and a short written comment.",
  },
  {
    question: "How do I raise an issue with a booking?",
    answer:
      "Open the booking and choose “Report issue”, or submit the form on this support page. You can follow the case on the dispute status screen while mediation is under review.",
  },
  {
    question: "Why do some artisan profiles show as sample records?",
    answer:
      "Directory profiles marked as samples are fictional demonstration records used to preview discovery. Badges and ratings on those profiles are not real verification decisions or persisted reviews.",
  },
];

export interface SupportQuickLink {
  href: string;
  label: string;
  description: string;
  icon: IconName;
}

export const supportQuickLinks: readonly SupportQuickLink[] = [
  {
    href: "/jobs",
    label: "My bookings",
    description: "Check milestones, sign off work and open a dispute.",
    icon: "briefcase",
  },
  {
    href: "/payments",
    label: "Payments & receipts",
    description: "Review milestone amounts recorded in test mode.",
    icon: "receipt",
  },
  {
    href: "/explore",
    label: "Explore services",
    description: "Browse trades and sample artisan profiles.",
    icon: "compass",
  },
  {
    href: "/settings",
    label: "Account settings",
    description: "Update your name, role and profile details.",
    icon: "settings",
  },
];
