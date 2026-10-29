import type { Metadata } from "next";
import { AuthFrame } from "@/features/accounts/auth-frame";
import { VerificationForm } from "@/features/accounts/verification-form";
export const metadata: Metadata = {
  title: "Email verification",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const token =
    typeof query.token === "string" && query.token.length < 100
      ? query.token
      : "";
  return (
    <AuthFrame recovery>
      <VerificationForm key={token} token={token} />
    </AuthFrame>
  );
}
