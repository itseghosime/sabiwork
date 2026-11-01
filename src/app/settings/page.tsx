import type { Metadata } from "next";
import { AccountSettings } from "@/features/settings/account-settings";
import { fetchSettings } from "@/features/settings/service";

export const metadata: Metadata = { title: "Account settings · SabiWork" };

export default async function SettingsPage() {
  const settings = await fetchSettings();
  return <AccountSettings initialSettings={settings} />;
}
