"use server";

import { db } from "@/lib/db";
import { events } from "@/../drizzle/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";

const generateReportSchema = z.object({
  from: z.date(),
  to: z.date(),
});

type ToolDetail = {
  eventName: string;
  toolName: string;
  category: string;
  initialCondition: string;
  finalCondition: string | null;
  notes: string | null;
};

export type ReportData = {
  startDate: string;
  endDate: string;
  totalEvents: number;
  totalItemsDeployed: number;
  categoryInsights: {
    [category: string]: {
      usageCount: number;
      itemsDeployed: number;
      damagedCount: number;
    };
  };
  damagedTools: ToolDetail[];
  allTools: ToolDetail[];
};

export async function generateReport(
  input: z.infer<typeof generateReportSchema>,
): Promise<ReportData> {
  const { from, to } = generateReportSchema.parse(input);

  // Set time to end of day for the 'to' date to include all events on that day
  to.setHours(23, 59, 59, 999);

  const completedEvents = await db.query.events.findMany({
    where: and(
      eq(events.status, "completed"),
      gte(events.endDate, from.toISOString()),
      lte(events.endDate, to.toISOString()),
    ),
    with: {
      tools: true,
    },
  });

  let totalItemsDeployed = 0;
  const categoryInsights: ReportData["categoryInsights"] = {};
  const damagedTools: ReportData["damagedTools"] = [];
  const allTools: ReportData["allTools"] = [];

  for (const event of completedEvents) {
    for (const tool of event.tools) {
      totalItemsDeployed += tool.total;

      const toolDetail: ToolDetail = {
        eventName: event.name,
        toolName: tool.name,
        category: tool.category,
        initialCondition: tool.initialCondition,
        finalCondition: tool.finalCondition,
        notes: tool.notes,
      };
      allTools.push(toolDetail);

      // Initialize category if not present
      if (!categoryInsights[tool.category]) {
        categoryInsights[tool.category] = {
          usageCount: 0,
          itemsDeployed: 0,
          damagedCount: 0,
        };
      }
      
      categoryInsights[tool.category].usageCount += 1;
      categoryInsights[tool.category].itemsDeployed += tool.total;

      const isDamaged = tool.finalCondition && tool.initialCondition.toLowerCase() !== tool.finalCondition.toLowerCase();

      if (isDamaged) {
         categoryInsights[tool.category].damagedCount += 1;
         damagedTools.push(toolDetail);
      }
    }
  }

  return {
    startDate: from.toISOString().split("T")[0],
    endDate: to.toISOString().split("T")[0],
    totalEvents: completedEvents.length,
    totalItemsDeployed,
    categoryInsights,
    damagedTools,
    allTools,
  };
}
