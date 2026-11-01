import type { Metadata } from "next";
import { TrainingDirectory } from "@/features/training/training-directory";
import { listGuides } from "@/features/training/service";

export const metadata: Metadata = { title: "Training directory · SabiWork" };

export default async function TrainingPage() {
  const guides = await listGuides({
    q: "",
    topic: "all",
    sort: "recommended",
  });
  return <TrainingDirectory guides={guides} />;
}
