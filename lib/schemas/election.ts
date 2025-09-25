import { z } from "zod"

export const electionSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  associationId: z.uuid(),
  startAt: z.string(), // ISO date string
  endAt: z.string(),   // ISO date string
})

export const electionUpdateSchema = z.object({
  id: z.uuid(),
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  isActive: z.boolean().optional(),
})