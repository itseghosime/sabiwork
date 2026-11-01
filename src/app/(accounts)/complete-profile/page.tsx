import type { Metadata } from "next";
import { AuthFrame } from "@/features/accounts/auth-frame";
import { CompleteProfileForm } from "@/features/accounts/complete-profile";

export const metadata: Metadata = {
  title: "Complete your account",
  robots: { index: false, follow: false },
};

export default function CompleteProfilePage() {
  return (
    <AuthFrame recovery={false}>
      <CompleteProfileForm />
    </AuthFrame>
  );
}
