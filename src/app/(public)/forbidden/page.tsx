import type { Metadata } from "next";
import { RecoveryScreen } from "@/components/recovery-screen";
export const metadata: Metadata = {
  title: "Access restricted",
  robots: { index: false, follow: false },
};
// Informational UI only. Protected routes must enforce access on the server.
export default function ForbiddenPage() {
  return <RecoveryScreen forbidden />;
}
