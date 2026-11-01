import { Icon } from "@/components/icon";

export default function SettingsLoading() {
  return (
    <p role="status" className="settings-loading">
      <Icon name="sparkles" size={18} /> Opening your demo settings…
    </p>
  );
}
