import type { Metadata } from "next";
import { AuthFrame } from "@/features/accounts/auth-frame";
import { AccountForm } from "@/features/accounts/account-form";
export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <AuthFrame recovery={false}>
      <AccountForm mode="login" />
    </AuthFrame>
  );
}
