import { z } from 'zod'

export const redactionPreviewSchema = z
  .object({
    log: z
      .string()
      .max(50_000, 'Log cannot exceed 50,000 characters')
      .refine(
        (value) => value.trim().length > 0,
        'Log cannot be empty'
      )
  })
  .strict()