import type { Metadata } from "next";
import { AuthFrame } from "@/features/accounts/auth-frame";
import { AccountForm } from "@/features/accounts/account-form";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false, follow: false },
};

export default function ArtisanSignupPage() {
  return (
    <AuthFrame recovery={false}>
      <AccountForm mode="signup" />
    </AuthFrame>
  );
}
