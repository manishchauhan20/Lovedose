import { z } from "zod";

export const publishDurationIdSchema = z.enum([
  "1h",
  "3h",
  "6h",
  "12h",
  "24h",
  "1m",
  "3m",
  "6m",
  "1y",
]);

export const publishPlanSchema = z.object({
  id: publishDurationIdSchema,
  label: z.string().min(1),
  description: z.string().min(1),
  hours: z.number().nonnegative(),
  price: z.number().nonnegative(),
  allTemplateAccess: z.boolean(),
});

export type PublishPlan = z.infer<typeof publishPlanSchema>;

export const publishPlans: PublishPlan[] = [
  { id: "1h", label: "1 Hour", description: "Quick launch for a short surprise window.", hours: 1, price: 19, allTemplateAccess: false },
  { id: "3h", label: "3 Hours", description: "Ideal for a same-evening reveal.", hours: 3, price: 29, allTemplateAccess: false },
  { id: "6h", label: "6 Hours", description: "Enough time for a special date flow.", hours: 6, price: 39, allTemplateAccess: false },
  { id: "12h", label: "12 Hours", description: "Half-day access for a bigger moment.", hours: 12, price: 49, allTemplateAccess: false },
  { id: "24h", label: "24 Hours", description: "A full day for one premium template.", hours: 24, price: 79, allTemplateAccess: false },
  { id: "1m", label: "1 Month", description: "Long-running link with all template access.", hours: 24 * 30, price: 999, allTemplateAccess: true },
  { id: "3m", label: "3 Months", description: "Season-long access with all templates unlocked.", hours: 24 * 90, price: 2999, allTemplateAccess: true },
  { id: "6m", label: "6 Months", description: "Extended campaign with full template control.", hours: 24 * 180, price: 4999, allTemplateAccess: true },
  { id: "1y", label: "1 Year", description: "Annual premium access for all templates.", hours: 24 * 365, price: 7999, allTemplateAccess: true },
];
