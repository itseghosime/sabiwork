"use client";

import { createDeviceStore, useDeviceValue } from "@/lib/device-store";

export type { DeviceStore } from "@/lib/device-store";
export { useDeviceValue };

export const notificationReadStore = createDeviceStore<string[]>(
  "sabiwork.notifications.read",
  [],
);

export interface CustomerPreferences {
  bookingUpdates: boolean;
  quoteAlerts: boolean;
  paymentReminders: boolean;
  productNews: boolean;
  preferredArea: string;
}

export const defaultPreferences: CustomerPreferences = {
  bookingUpdates: true,
  quoteAlerts: true,
  paymentReminders: true,
  productNews: false,
  preferredArea: "GRA",
};

export const preferenceStore = createDeviceStore<CustomerPreferences>(
  "sabiwork.customer.preferences",
  defaultPreferences,
);
