import type { Metadata } from "next";
import { AuthFrame } from "@/features/accounts/auth-frame";
import { AccountForm } from "@/features/accounts/account-form";

export const metadata: Metadata = {
  title: "Join as an artisan",
  robots: { index: false, follow: false },
};

export default function ArtisanSignupPage() {
  return (
    <AuthFrame recovery={false} path="artisan">
      <AccountForm mode="signup" path="artisan" />
    </AuthFrame>
  );
}
