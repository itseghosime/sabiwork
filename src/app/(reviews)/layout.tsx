import "@/features/reviews/reviews.css";
import { requireSignedInPage } from "@/lib/server/authorization";

export const dynamic = "force-dynamic";

export default async function ReviewsLayout({ children }: { children: React.ReactNode }) {
  await requireSignedInPage();
  return children;
}
