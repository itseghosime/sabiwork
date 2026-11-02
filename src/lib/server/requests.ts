import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { jobRequests } from "./schema";

export function customerRequestsQuery(userId: string) {
  return getDb()
    .select({
      id: jobRequests.id,
      title: jobRequests.title,
      category: jobRequests.category,
      service_area: jobRequests.service_area,
      budget_guidance_kobo: jobRequests.budget_guidance_kobo,
      status: jobRequests.status,
      created_at: jobRequests.created_at,
    })
    .from(jobRequests)
    .where(eq(jobRequests.customer_id, userId))
    .orderBy(desc(jobRequests.created_at), desc(jobRequests.id))
    .limit(50);
}
