import type { Metadata } from "next";
import { AuthFrame } from "@/features/accounts/auth-frame";
import { AccountForm } from "@/features/accounts/account-form";
export const metadata: Metadata = {
  title: "Reset password",
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
      <AccountForm key={token} mode="reset" token={token} />
    </AuthFrame>
  );
}
