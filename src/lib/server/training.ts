import "server-only";

import { and, eq } from "drizzle-orm";
import { getTrainingModule, getTrainingModules, type TrainingModule } from "@/features/training/service";
import { trainingSectionId } from "@/features/training/progress";
import { getDb } from "./db";
import { artisanTrainingProgress } from "./schema";
import type { ArtisanTrainingModule, ArtisanTrainingProgress, ArtisanTrainingStats } from "@/features/artisan-workspace/training-types";

type ProgressRow = typeof artisanTrainingProgress.$inferSelect;

function decorate(module: TrainingModule, row?: ProgressRow): ArtisanTrainingModule {
  const completedSectionIds = row?.completed_section_ids ?? [];
  const completedCount = trainingModule.sections.filter((section) =>
    completedSectionIds.includes(trainingSectionId(section.sectionTitle)),
  ).length;
  const percent = trainingModule.sections.length
    ? Math.round((completedCount / trainingModule.sections.length) * 100)
    : 0;
  const status = percent === 100
    ? "completed"
    : completedCount > 0
      ? "in_progress"
      : "not_started";
  return {
    ...module,
    completedSectionIds,
    completedAt: row?.completed_at?.toISOString() ?? null,
    status,
    progress: percent,
  };
}

function summarize(modules: readonly ArtisanTrainingModule[]): ArtisanTrainingStats {
  const completedCount = modules.filter((module) => module.status === "completed").length;
  const inProgressCount = modules.filter((module) => module.status === "in_progress").length;
  const minutesLearned = modules.reduce(
    (total, module) => total + Math.round(module.durationMinutes * module.progress / 100),
    0,
  );
  return {
    completedCount,
    inProgressCount,
    availableCount: modules.length - completedCount - inProgressCount,
    totalHoursLearned: Math.round((minutesLearned / 60) * 10) / 10,
  };
}

export async function getArtisanTrainingOverview(artisanId: string) {
  const rows = await getDb()
    .select()
    .from(artisanTrainingProgress)
    .where(eq(artisanTrainingProgress.artisan_id, artisanId));
  const byModule = new Map(rows.map((row) => [row.module_id, row]));
  const modules = getTrainingModules().map((module) => decorate(module, byModule.get(module.id)));
  return { modules, stats: summarize(modules) };
}

export async function getArtisanTrainingModule(artisanId: string, moduleId: string) {
  const trainingModule = getTrainingModule(moduleId);
  if (!trainingModule) return null;
  const [row] = await getDb()
    .select()
    .from(artisanTrainingProgress)
    .where(and(
      eq(artisanTrainingProgress.artisan_id, artisanId),
      eq(artisanTrainingProgress.module_id, moduleId),
    ))
    .limit(1);
  return decorate(trainingModule, row);
}

export async function updateArtisanTrainingProgress(
  artisanId: string,
  moduleId: string,
  sectionId: string,
  completed: boolean,
): Promise<ArtisanTrainingProgress | null> {
  const trainingModule = getTrainingModule(moduleId);
  if (!trainingModule) return null;
  const validSectionIds = trainingModule.sections.map((section) => trainingSectionId(section.sectionTitle));
  if (!validSectionIds.includes(sectionId)) return null;

  const db = getDb();
  const [existing] = await db
    .select()
    .from(artisanTrainingProgress)
    .where(and(
      eq(artisanTrainingProgress.artisan_id, artisanId),
      eq(artisanTrainingProgress.module_id, moduleId),
    ))
    .limit(1);
  const ids = new Set(existing?.completed_section_ids ?? []);
  if (completed) ids.add(sectionId);
  else ids.delete(sectionId);
  const completedSectionIds = validSectionIds.filter((id) => ids.has(id));
  const completedCount = completedSectionIds.length;
  const percent = Math.round((completedCount / trainingModule.sections.length) * 100);
  const status = percent === 100
    ? "completed"
    : completedCount > 0
      ? "in_progress"
      : "not_started";
  const completedAt = status === "completed" ? new Date() : null;
  const now = new Date();
  const [row] = await db
    .insert(artisanTrainingProgress)
    .values({
      artisan_id: artisanId,
      module_id: moduleId,
      completed_section_ids: completedSectionIds,
      completed_at: completedAt,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: [artisanTrainingProgress.artisan_id, artisanTrainingProgress.module_id],
      set: {
        completed_section_ids: completedSectionIds,
        completed_at: completedAt,
        updated_at: now,
      },
    })
    .returning();

  return {
    completedSectionIds: row.completed_section_ids,
    completedCount,
    totalSections: trainingModule.sections.length,
    percent,
    status,
    completedAt: row.completed_at?.toISOString() ?? null,
  };
}
