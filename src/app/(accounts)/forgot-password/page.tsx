import type { Metadata } from "next";
import { AuthFrame } from "@/features/accounts/auth-frame";
import { AccountForm } from "@/features/accounts/account-form";
export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <AuthFrame recovery={true}>
      <AccountForm mode="forgot" />
    </AuthFrame>
  );
}
