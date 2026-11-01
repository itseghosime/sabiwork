import type { Metadata } from "next";
import { AuthFrame } from "@/features/accounts/auth-frame";
import { AccountForm } from "@/features/accounts/account-form";
export const metadata: Metadata = {
  title: "Hire an artisan",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <AuthFrame recovery={false} path="customer">
      <AccountForm mode="signup" path="customer" />
    </AuthFrame>
  );
}
