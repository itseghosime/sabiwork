// Fictional demonstration record for the account settings screen.
// TEST mode only: nothing here is a real user, and nothing is persisted.
export type DemoSettings = {
  fullName: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
  district: string;
  channels: {
    whatsapp: boolean;
    emailSummaries: boolean;
    paymentAlerts: boolean;
  };
};

// The sample email keeps the @example.test domain used by every demo screen
// in this repository, so it can never accidentally match a real mailbox.
export const demoSettings: DemoSettings = {
  fullName: "Osaze Ighodaro",
  email: "osaze@example.test",
  phone: "+234 803 456 7890",
  language: "english-standard",
  timezone: "wat",
  district: "gra-ring-road",
  channels: {
    whatsapp: true,
    emailSummaries: true,
    paymentAlerts: true,
  },
};

export const languageOptions: readonly { value: string; label: string }[] = [
  { value: "english-standard", label: "English (West Africa Standard)" },
  { value: "pidgin", label: "Pidgin English" },
  { value: "edo-bilingual", label: "English & Edo (bilingual labels)" },
];

export const timezoneOptions: readonly { value: string; label: string }[] = [
  { value: "wat", label: "WAT (West Africa Time, UTC+1)" },
  { value: "gmt", label: "GMT (UTC+0)" },
];

export const districtOptions: readonly { value: string; label: string }[] = [
  { value: "gra-ring-road", label: "GRA / Ring Road" },
  { value: "airport-road", label: "Airport Road / Oko" },
  { value: "uselu-ugbowo", label: "Uselu / Ugbowo" },
  { value: "ikpoba-ramat", label: "Ikpoba Hill / Ramat Park" },
  { value: "sapele-limit", label: "Sapele Road / Limit" },
];

export const channelOptions: readonly {
  id: keyof DemoSettings["channels"];
  title: string;
  description: string;
}[] = [
  {
    id: "whatsapp",
    title: "WhatsApp job alerts",
    description:
      "Immediate update prompts when a client sends a new request or schedule note.",
  },
  {
    id: "emailSummaries",
    title: "Weekly email summary",
    description:
      "A Monday recap of the week's demo activity. Note: real email sending is not connected yet.",
  },
  {
    id: "paymentAlerts",
    title: "Payment alerts (TEST mode)",
    description:
      "Sample text alerts for demo payment events. Paystack TEST mode: no real money moves.",
  },
];

/** The five supported guide sections rendered as an in-page side menu. */
export const settingsSections: readonly { id: string; title: string }[] = [
  { id: "identity", title: "Profile & identity" },
  { id: "preferences", title: "Regional & notifications" },
  { id: "security", title: "Security & password" },
  { id: "sessions", title: "Connected sessions" },
  { id: "danger-zone", title: "Danger zone" },
];
