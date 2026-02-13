import { z } from 'zod';

/**
 * Core SciVal entity types
 */
export type EntityType = 'author' | 'institution' | 'journal';

/**
 * Time period for metrics
 */
export const TimePeriodSchema = z.object({
  start: z.number().describe('Start year (inclusive)'),
  end: z.number().describe('End year (inclusive)')
});

export type TimePeriod = z.infer<typeof TimePeriodSchema>;

/**
 * Author entity with scholarly metrics
 */
export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  affiliation: z.string().optional(),
  metrics: z.object({
    publications: z.number(),
    citations: z.number(),
    hIndex: z.number(),
    fieldWeightedCitationImpact: z.number(),
    outputsInTopCitationPercentiles: z.object({
      top1: z.number(),
      top5: z.number(),
      top10: z.number()
    })
  })
});

export type Author = z.infer<typeof AuthorSchema>;

/**
 * Institution entity with research output metrics
 */
export const InstitutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  metrics: z.object({
    publications: z.number(),
    citations: z.number(),
    collaborationRate: z.number(),
    fieldWeightedCitationImpact: z.number(),
    academicCorporateCollaboration: z.number()
  })
});

export type Institution = z.infer<typeof InstitutionSchema>;

/**
 * Journal entity with publication metrics
 */
export const JournalSchema = z.object({
  id: z.string(),
  name: z.string(),
  publisher: z.string(),
  metrics: z.object({
    citesPerDoc: z.number(),
    sjr: z.number(), // SCImago Journal Rank
    snip: z.number(), // Source Normalized Impact per Paper
    percentCited: z.number()
  })
});

export type Journal = z.infer<typeof JournalSchema>;

/**
 * Trend data point
 */
export const TrendPointSchema = z.object({
  year: z.number(),
  value: z.number()
});

export type TrendPoint = z.infer<typeof TrendPointSchema>;

/**
 * Comparison result
 */
export const ComparisonSchema = z.object({
  entityA: z.object({
    id: z.string(),
    name: z.string(),
    value: z.number()
  }),
  entityB: z.object({
    id: z.string(),
    name: z.string(),
    value: z.number()
  }),
  difference: z.number(),
  percentDifference: z.number()
});

export type Comparison = z.infer<typeof ComparisonSchema>;
