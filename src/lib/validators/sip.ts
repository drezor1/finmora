import { z } from "zod";

export const sipEnrollSchema = z.object({
  lockYears: z.union([z.literal(1), z.literal(3), z.literal(5)]),
  percentOfIncome: z.number().int().min(30).max(50),
});

export const sipUpdateSchema = z.object({
  percentOfIncome: z.number().int().min(30).max(50),
});
