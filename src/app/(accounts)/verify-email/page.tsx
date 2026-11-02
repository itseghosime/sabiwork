import type { Metadata } from "next";
import Link from "next/link";
import { AuthFrame } from "@/features/accounts/auth-frame";

export const metadata: Metadata = {
  title: "Email verification",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthFrame recovery>
      <div className="auth-card auth-state">
        <p className="eyebrow">EMAIL VERIFICATION</p>
        <h1>Email OTP is currently turned off</h1>
        <p>
          You can continue using your account with email and password only. We will announce if OTP verification is enabled later.
        </p>
        <Link className="button button-primary auth-submit" href="/login">
          Go to login
        </Link>
      </div>
    </AuthFrame>
  );
}
