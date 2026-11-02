"use client";

import { createDeviceStore } from "@/lib/device-store";

export interface ArtisanPreferences {
  jobRequests: boolean;
  quoteReplies: boolean;
  paymentMilestones: boolean;
  trainingNudges: boolean;
}

export const defaultArtisanPreferences: ArtisanPreferences = {
  jobRequests: true,
  quoteReplies: true,
  paymentMilestones: true,
  trainingNudges: false,
};

/** Artisan dispatch alerts live under their own key so a single login that is
 * both customer and artisan keeps two independent preference sets. */
export const artisanPreferenceStore = createDeviceStore<ArtisanPreferences>(
  "sabiwork.artisan.preferences",
  defaultArtisanPreferences,
);
