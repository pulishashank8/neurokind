import { z } from "zod";

/**
 * Data Catalog validation schemas for enterprise data governance
 */

export const DataSensitivityEnum = z.enum([
  "PUBLIC",
  "INTERNAL",
  "SENSITIVE",
  "PII",
  "PHI",
]);

export const CreateDatasetSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  domain: z.string().min(1).max(100),
  ownerTeam: z.string().min(1),
  sensitivity: DataSensitivityEnum.default("INTERNAL"),
  tags: z.array(z.string()).default([]),
});

export const UpdateDatasetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  domain: z.string().min(1).max(100).optional(),
  ownerTeam: z.string().min(1).optional(),
  sensitivity: DataSensitivityEnum.optional(),
  tags: z.array(z.string()).optional(),
});

export const CreateDatasetFieldSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  description: z.string().min(1),
  isNullable: z.boolean().default(true),
  sensitivity: DataSensitivityEnum.default("INTERNAL"),
  examples: z.string().optional(),
});

export const UpdateDatasetFieldSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  isNullable: z.boolean().optional(),
  sensitivity: DataSensitivityEnum.optional(),
  examples: z.string().optional(),
});

export const DatasetSearchParamsSchema = z.object({
  q: z.string().optional(),
  domain: z.string().optional(),
  sensitivity: DataSensitivityEnum.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateDatasetInput = z.infer<typeof CreateDatasetSchema>;
export type UpdateDatasetInput = z.infer<typeof UpdateDatasetSchema>;
export type CreateDatasetFieldInput = z.infer<typeof CreateDatasetFieldSchema>;
export type UpdateDatasetFieldInput = z.infer<typeof UpdateDatasetFieldSchema>;
export type DatasetSearchParams = z.infer<typeof DatasetSearchParamsSchema>;
