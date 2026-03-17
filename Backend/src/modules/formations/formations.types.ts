import { z } from "zod";

export const CreateFormationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2).max(20),
  department: z.string().min(2),
  description: z.string().optional(),
});

export type CreateFormationDto = z.infer<typeof CreateFormationSchema>;
