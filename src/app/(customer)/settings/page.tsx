import { AccountSettingsScreen } from "@/features/requests/screens";
import { defaultSettings } from "@/features/requests/service";

export default function SettingsPage() {
  return <AccountSettingsScreen initialSettings={defaultSettings} />;
}

