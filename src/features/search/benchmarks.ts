import type { CategoryId } from "./data";
// Fictional design examples only, not maintained local market rates or quotes.
export const sampleEstimates: Record<CategoryId, readonly [number, number]> = {
  plumbing: [650000, 1800000],
  electrical: [800000, 2500000],
  carpentry: [1200000, 3500000],
  tailoring: [500000, 2200000],
  painting: [700000, 2800000],
  cleaning: [450000, 1600000],
};
