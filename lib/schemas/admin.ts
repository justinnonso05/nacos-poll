import { z } from "zod"

export const adminSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["SUPERADMIN", "ADMIN"]),
  associationId: z.uuid(),
})