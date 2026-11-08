import type { TrainingModule } from "@/features/training/service";

export type ArtisanTrainingModule = TrainingModule & {
  completedSectionIds: string[];
  completedAt: string | null;
};

export type ArtisanTrainingStats = {
  completedCount: number;
  inProgressCount: number;
  availableCount: number;
  totalHoursLearned: number;
};

export type ArtisanTrainingProgress = {
  completedSectionIds: string[];
  completedCount: number;
  totalSections: number;
  percent: number;
  status: TrainingModule["status"];
  completedAt: string | null;
};
